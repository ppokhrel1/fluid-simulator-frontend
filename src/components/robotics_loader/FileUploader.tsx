import JSZip from "jszip";
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

/**
 * Types
 */
export type ModelObject = THREE.Group | THREE.Mesh | THREE.Object3D;

interface FileUploaderProps {
  onModelLoaded: (model: ModelObject) => void;
   onModelLoading?: () => void;
}

type MeshDataMap = Record<string, ArrayBuffer>;

type PartSpec = {
  name?: string;
  placement?: { x?: number; y?: number; z?: number };
  pose?: number[]; // [x,y,z,roll,pitch,yaw]
  color?: number[]; // [r,g,b] floats 0..1
  metalness?: number;
  roughness?: number;
  dimensions?: { length: number; width: number; height: number };
  [k: string]: any;
};

type Specification = {
  parts?: PartSpec[];
  defaultMaterial?: { color?: number[]; metalness?: number; roughness?: number };
  [k: string]: any;
};

/**
 * Utility helpers (kept local and pure)
 */

const safeGetFilename = (path: string): string =>
  (path.split("/").pop() || path).toLowerCase();

const parseText = async (blob: JSZip.JSZipObject) => blob.async("text");

const isSTLFile = (name: string) => /\.stl$/i.test(name);
const isSupportedMesh = (name: string) => /\.(stl|glb|obj)$/i.test(name);

const toThreeColorHex = (arr?: number[]) =>
  arr && arr.length >= 3
    ? new THREE.Color(arr[0], arr[1], arr[2]).getHex()
    : 0xcccccc;

/**
 * FileUploader component
 */
const FileUploader: React.FC<FileUploaderProps> = ({ onModelLoaded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mountedRef = useRef(true);

  // Keep a reference to active loaders to allow cleanup if needed
  const activeLoadersRef = useRef<Array<STLLoader | null>>([]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      // unmount cleanup
      mountedRef.current = false;
      // Dispose any loader references if necessary
      activeLoadersRef.current.forEach((loader) => {
        // STLLoader doesn't require explicit dispose, but if you extend loaders, cleanup here.
        // If loader had onProgress handlers, remove them here.
      });
      activeLoadersRef.current = [];
    };
  }, []);

  /**
   * Core: parse SDF XML, extract links, load meshes (from meshData or server), create three.js Group
   */
  const parseSDF = useCallback(
    async (sdfContent: string, meshData: MeshDataMap, specification?: Specification) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(sdfContent, "application/xml");

      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) throw new Error("Invalid SDF XML");

      const modelElement = xmlDoc.querySelector("model");
      if (!modelElement) throw new Error("No <model> element found in SDF");

      const modelName = modelElement.getAttribute("name") || "UnnamedModel";
      const rootGroup = new THREE.Group();
      rootGroup.name = modelName;

      // Collect link elements
      const linkElements = Array.from(xmlDoc.querySelectorAll("link"));

      // Process each link concurrently
      const linkPromises = linkElements.map(async (linkEl) => {
        const linkName = linkEl.getAttribute("name") || "unnamed_link";
        const linkGroup = new THREE.Group();
        linkGroup.name = linkName;

        // Pose: prefer specification placement; fallback to SDF pose
        const specPart = getPartSpecification(specification, linkName);
        const { position, rotation } = getPoseFromSpecOrSDF(specPart, linkEl);
        linkGroup.position.copy(position);
        linkGroup.rotation.copy(rotation);

        // Visual elements
        const visualEls = Array.from(linkEl.querySelectorAll("visual"));
        for (const visual of visualEls) {
          const meshUriEl = visual.querySelector("mesh uri");
          if (meshUriEl && meshUriEl.textContent) {
            const meshUri = meshUriEl.textContent.trim();
            try {
              // Only supporting STL meshes for now (embedded or server)
              const mesh = await loadMeshFromUri(meshUri, meshData, specification, linkName);
              mesh.name = visual.getAttribute("name") || `${linkName}_visual`;
              linkGroup.add(mesh);
            } catch (err) {
              console.error(`Mesh load failed for ${meshUri}:`, err);
              // fallback placeholder
              const placeholder = createPlaceholderMesh();
              placeholder.name = `placeholder_${linkName}`;
              linkGroup.add(placeholder);
            }
          }
        }

        return linkGroup;
      });

      const linkGroups = await Promise.all(linkPromises);
      linkGroups.forEach((lg) => rootGroup.add(lg));

      // Fit & center model
      scaleModelForViewing(rootGroup);

      if (mountedRef.current) onModelLoaded(rootGroup);
    },
    [onModelLoaded]
  );

  /**
   * Load mesh referenced by URI:
   * - If the mesh exists in meshData (embedded in ZIP) use that
   * - Else try to load from /meshes/<filename>
   *
   * Only STL is supported here; extend for GLB/OBJ if needed.
   */
  const loadMeshFromUri = useCallback(
    async (
      uri: string,
      meshData: MeshDataMap,
      specification: Specification | undefined,
      linkName: string
    ): Promise<THREE.Mesh> => {
      // Extract filename from URI. Support package:// and normal paths
      const match = uri.match(/([^\/\\]+(?:\.(stl|glb|obj)))$/i);
      if (!match) throw new Error(`Cannot determine filename from uri: ${uri}`);
      const filename = match[1].toLowerCase();

      // If embedded in ZIP
      if (meshData && meshData[filename]) {
        return loadSTLFromArrayBuffer(meshData[filename], specification, linkName);
      }

      // Otherwise try server path (you should serve /meshes/<filename> from your server)
      if (isSTLFile(filename)) {
        return new Promise<THREE.Mesh>((resolve, reject) => {
          const loader = new STLLoader();
          activeLoadersRef.current.push(loader);
          const path = `/meshes/${filename}`;

          loader.load(
            path,
            (geometry) => {
              try {
                const partSpec = getPartSpecification(specification, linkName);
                const material = createMaterialFromSpec(partSpec, specification);
                const mesh = new THREE.Mesh(geometry, material);
                applyPartScaling(mesh, specification, linkName);
                resolve(mesh);
              } catch (err) {
                reject(err);
              }
            },
            undefined,
            (err) => reject(new Error(`Failed to load ${path}: ${err}`))
          );
        });
      }

      throw new Error(`Unsupported mesh format for ${filename}`);
    },
    []
  );

  /**
   * Load STL from ArrayBuffer and return Mesh
   */
  const loadSTLFromArrayBuffer = useCallback(
    async (arrayBuffer: ArrayBuffer, specification?: Specification, linkName?: string) => {
      const loader = new STLLoader();
      const geometry = loader.parse(arrayBuffer);
      geometry.computeVertexNormals();

      const specPart = linkName ? getPartSpecification(specification, linkName) : null;
      const material = createMaterialFromSpec(specPart, specification);

      const mesh = new THREE.Mesh(geometry, material);
      applyPartScaling(mesh, specification, linkName ?? "");

      return mesh;
    },
    []
  );

  /**
   * Apply scaling/centering per-part based on specification
   */
  const applyPartScaling = useCallback((mesh: THREE.Mesh, specification?: Specification, linkName?: string) => {
    const geometry = mesh.geometry as THREE.BufferGeometry;
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox!;
    const size = new THREE.Vector3();
    bbox.getSize(size);

    if (specification && linkName) {
      const part = getPartSpecification(specification, linkName);
      if (part?.dimensions) {
        // guard against zero sizes
        const sx = size.x > 0 ? part.dimensions.length / size.x : 1;
        const sy = size.y > 0 ? part.dimensions.width / size.y : 1;
        const sz = size.z > 0 ? part.dimensions.height / size.z : 1;
        const avg = (sx + sy + sz) / 3;
        mesh.scale.setScalar(avg);
      }
    }

    // center geometry
    geometry.computeBoundingBox();
    const center = geometry.boundingBox!.getCenter(new THREE.Vector3());
    geometry.translate(-center.x, -center.y, -center.z);
  }, []);

  /**
   * Create a simple placeholder geometry (red box)
   */
  const createPlaceholderMesh = (): THREE.Mesh => {
    const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const mat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    return new THREE.Mesh(geo, mat);
  };

  /**
   * Create material based on part spec or default
   */
  const createMaterialFromSpec = (partSpec?: PartSpec | null, specification?: Specification) => {
    const defaultColor = toThreeColorHex(specification?.defaultMaterial?.color);
    const defaultMetalness = specification?.defaultMaterial?.metalness ?? 0.3;
    const defaultRoughness = specification?.defaultMaterial?.roughness ?? 0.7;

    const hex = partSpec?.color ? toThreeColorHex(partSpec.color) : defaultColor;
    const metalness = partSpec?.metalness ?? defaultMetalness;
    const roughness = partSpec?.roughness ?? defaultRoughness;

    return new THREE.MeshStandardMaterial({ color: hex, metalness, roughness });
  };

  /**
   * Find matching part in specification by link name
   */
  const getPartSpecification = (spec?: Specification | undefined, linkName?: string): PartSpec | null => {
    if (!spec || !spec.parts || !linkName) return null;
    return spec.parts.find((p) => (p.name || "").toLowerCase() === linkName.toLowerCase()) || null;
  };

  /**
   * Pose extraction: prefer specification placement, fallback to SDF <pose>
   */
  const getPoseFromSpecOrSDF = (specPart: PartSpec | null | undefined, linkEl: Element) => {
    const position = new THREE.Vector3(0, 0, 0);
    const rotation = new THREE.Euler(0, 0, 0);

    if (specPart?.placement) {
      position.set(specPart.placement.x ?? 0, specPart.placement.y ?? 0, specPart.placement.z ?? 0);
      if (Array.isArray(specPart.pose) && specPart.pose.length >= 6) {
        rotation.set(specPart.pose[3], specPart.pose[4], specPart.pose[5]);
      }
      return { position, rotation };
    }

    const poseEl = linkEl.querySelector("pose");
    if (poseEl && poseEl.textContent) {
      const vals = poseEl.textContent.trim().split(/\s+/).map((v) => parseFloat(v));
      if (vals.length >= 6) {
        position.set(vals[0], vals[1], vals[2]);
        rotation.set(vals[3], vals[4], vals[5]);
      }
    }
    return { position, rotation };
  };

  /**
   * After entire model is constructed, scale & center it to fit the viewport
   */
  const scaleModelForViewing = useCallback((group: THREE.Group) => {
    const bbox = new THREE.Box3().setFromObject(group);
    const size = new THREE.Vector3();
    bbox.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z, 0.0001); // avoid zero
    const target = 10; // desired size in scene units
    const scale = target / maxDim;
    group.scale.setScalar(scale);

    // re-center
    const newBbox = new THREE.Box3().setFromObject(group);
    const center = newBbox.getCenter(new THREE.Vector3());
    group.position.sub(center);
  }, []);

  /**
   * Load a ZIP file: find SDF, specification.json, and mesh files
   */
  const loadZipFile = useCallback(
    async (file: File) => {
      const zip = await JSZip.loadAsync(file);
      const meshData: MeshDataMap = {};
      let sdfText: string | null = null;
      let specification: Specification | undefined = undefined;

      // iterate entries
      const entries = Object.values(zip.files);
      for (const entry of entries) {
        if (entry.dir) continue;
        const name = safeGetFilename(entry.name);

        if (name.endsWith(".sdf")) {
          sdfText = await entry.async("text");
        } else if (name === "specification.json" || entry.name.toLowerCase().endsWith("specification.json")) {
          try {
            const txt = await entry.async("text");
            specification = JSON.parse(txt) as Specification;
          } catch (err) {
            console.warn("Failed to parse specification.json:", err);
          }
        } else if (isSupportedMesh(name)) {
          // store arraybuffer keyed by filename
          meshData[name] = await entry.async("arraybuffer");
        }
      }

      if (!sdfText) throw new Error("No .sdf file found inside the ZIP archive");
      await parseSDF(sdfText, meshData, specification);
    },
    [parseSDF]
  );

  /**
   * Load raw SDF file (standalone)
   */
  const loadSDFFile = useCallback(
    async (file: File) =>
      new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const text = e.target?.result as string;
            await parseSDF(text, {});
            resolve();
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error("Failed to read SDF file"));
        reader.readAsText(file);
      }),
    [parseSDF]
  );

  /**
   * Main input change handler
   */
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setIsLoading(true);

      try {
        const name = file.name.toLowerCase();
        if (name.endsWith(".zip")) {
          await loadZipFile(file);
        } else if (name.endsWith(".sdf")) {
          await loadSDFFile(file);
        } else {
          window.alert("Unsupported file type. Use .sdf or .zip (containing .sdf and meshes).");
        }
      } catch (err) {
        console.error("File processing error:", err);
        window.alert(`Failed to load file: ${(err as Error).message}`);
      } finally {
        if (mountedRef.current) setIsLoading(false);
        // reset input so same file can be reselected
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [loadSDFFile, loadZipFile]
  );

  return (
    <div className="file-uploader" aria-live="polite">
      <h3>Upload Robot Model</h3>

      <div className="upload-section">
        <input
          ref={fileInputRef}
          id="sdf-zip-upload"
          type="file"
          accept=".sdf,.zip"
          onChange={handleFileUpload}
          disabled={isLoading}
          style={{ display: "none" }}
        />

        <label htmlFor="sdf-zip-upload">
          <button
            className="upload-button btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            aria-disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Choose SDF / ZIP File"}
          </button>
        </label>

        <div className="file-info mt-2">
          <p className="mb-1">Supported formats:</p>
          <ul>
            <li>
              <strong>SDF</strong> — Simulation Description Format (.sdf)
            </li>
            <li>
              <strong>ZIP</strong> — Archive containing .sdf, <code>specification.json</code>, and meshes
            </li>
            <li>
              <strong>Meshes</strong> — Embedded STL files (or served from <code>/meshes/&lt;filename&gt;</code>)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;

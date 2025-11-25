// frontend/src/components/3dShapes/FileUploader.tsx
import React, { useState, useRef } from 'react';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as THREE from 'three';
import JSZip from 'jszip';

// Define the type for the model object
type ModelObject = THREE.Mesh | THREE.Object3D | THREE.Group;

// Define props for FileUploader
interface FileUploaderProps {
  onModelLoaded: (model: ModelObject) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onModelLoaded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const fileName = file.name.toLowerCase();

    try {
      if (fileName.endsWith('.sdf')) {
        await loadSDFFile(file);
      } else if (fileName.endsWith('.zip')) {
        await loadZipFile(file);
      } else {
        alert('Unsupported file type. Please upload SDF files or ZIP archives containing SDF and meshes.');
      }
    } catch (error) {
      console.error('File loading failed:', error);
      alert('Failed to load file. Please check the console for details.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Load SDF from ZIP file
  const loadZipFile = async (file: File): Promise<void> => {
    const zip = new JSZip();
    const zipContents = await zip.loadAsync(file);
    
    // Find SDF file in zip
    let sdfFile: JSZip.JSZipObject | null = null;
    let specificationFile: JSZip.JSZipObject | null = null;
    const meshFiles: Map<string, Promise<ArrayBuffer>> = new Map();
    
    // Look for .sdf files, specification.json, and mesh files
    Object.keys(zipContents.files).forEach((relativePath) => {
      const zipEntry = zipContents.files[relativePath];
      if (!zipEntry.dir) {
        if (relativePath.endsWith('.sdf')) {
          sdfFile = zipEntry;
        } else if (relativePath.includes('specification.json')) {
          specificationFile = zipEntry;
        } else if (relativePath.match(/\.(stl|glb|obj)$/i)) {
          // Extract filename to use as key, assuming flat mesh structure for lookup
          const fileName = relativePath.split('/').pop() || relativePath; 
          meshFiles.set(fileName.toLowerCase(), zipEntry.async('arraybuffer'));
        }
      }
    });

    if (!sdfFile) {
      throw new Error('No SDF file found in ZIP archive');
    }

    const sdfContent = await (sdfFile as JSZip.JSZipObject).async('text');
    
    // Load specification if available
    let specification: any = null;
    if (specificationFile) {
      try {
        const specContent = await (specificationFile as JSZip.JSZipObject).async('text');
        specification = JSON.parse(specContent);
        console.log('Loaded specification:', specification);
      } catch (error) {
        console.warn('Failed to parse specification.json:', error);
      }
    }

    // Wait for all mesh files to load and convert to ArrayBuffer
    const meshEntries = Array.from(meshFiles.entries());
    const meshResults = await Promise.all(
      meshEntries.map(async ([name, promise]) => ({
        name,
        data: await promise
      }))
    );

    const meshData: { [key: string]: ArrayBuffer } = {};
    meshResults.forEach(({ name, data }) => {
      meshData[name] = data;
    });

    await parseSDF(sdfContent, meshData, specification);
  };

  // Load standalone SDF file
  const loadSDFFile = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const sdfContent = e.target?.result as string;
          // Standalone SDF assumes meshes must be loaded from server (meshData = {})
          parseSDF(sdfContent, {}).then(resolve).catch(reject);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read SDF file'));
      reader.readAsText(file);
    });
  };

  // Helper to get link data from specification
  const getPartSpecification = (specification: any, linkName: string): any => {
    if (!specification || !specification.parts) return null;
    // Note: The specification uses 'name' which is equivalent to the link name
    return specification.parts.find((p: any) => 
      p.name.toLowerCase() === linkName.toLowerCase()
    );
  };
  
  // Helper to create material from specification or default
  const createMaterialFromSpec = (specPart: any, specification: any): THREE.MeshStandardMaterial => {
    // Default values if specification is missing or doesn't specify color
    const defaultColor = specification?.defaultMaterial?.color || [0.8, 0.8, 0.8];
    const defaultMetalness = specification?.defaultMaterial?.metalness ?? 0.3;
    const defaultRoughness = specification?.defaultMaterial?.roughness ?? 0.7;

    const colorArray = specPart?.color || defaultColor;
    
    if (colorArray && colorArray.length >= 3) {
      // Assuming color is provided as [R, G, B] floats (0 to 1)
      const color = new THREE.Color(colorArray[0], colorArray[1], colorArray[2]);
      
      return new THREE.MeshStandardMaterial({ 
        color: color.getHex(),
        metalness: specPart?.metalness ?? defaultMetalness,
        roughness: specPart?.roughness ?? defaultRoughness
      });
    }

    // Fallback if color data is invalid
    return new THREE.MeshStandardMaterial({ 
      color: 0xcccccc, 
      metalness: defaultMetalness,
      roughness: defaultRoughness
    });
  };
  
  // Load STL from ArrayBuffer (for ZIP files)
  const loadSTLFromArrayBuffer = (arrayBuffer: ArrayBuffer, specification?: any, linkName?: string): Promise<THREE.Mesh> => {
    return new Promise((resolve, reject) => {
      try {
        const loader = new STLLoader();
        const geometry = loader.parse(arrayBuffer);
        
        const specPart = linkName ? getPartSpecification(specification, linkName) : null;
        const material = createMaterialFromSpec(specPart, specification); 
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Apply part-specific scaling if specification and linkName are provided
        if (specification && linkName) {
          applyPartScaling(mesh, specification, linkName);
        } else {
          // Default centering
          geometry.computeBoundingBox();
          const center = geometry.boundingBox!.getCenter(new THREE.Vector3());
          geometry.translate(-center.x, -center.y, -center.z);
        }
        
        resolve(mesh);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Apply scaling based on specification part dimensions
  const applyPartScaling = (mesh: THREE.Mesh, specification: any, linkName: string) => {
    if (!specification || !specification.parts) return;
    
    // Find the part in specification that matches the link name
    const part = specification.parts.find((p: any) => 
      p.name.toLowerCase() === linkName.toLowerCase()
    );
    
    if (part && part.dimensions) {
      console.log(`Applying part-specific scaling for: ${part.name}`, part.dimensions);
      
      const geometry = mesh.geometry;
      geometry.computeBoundingBox();
      const bbox = geometry.boundingBox!;
      const size = new THREE.Vector3();
      bbox.getSize(size);
      
      // Calculate scale factors for each dimension
      // Uses the provided dimension keys (length, width, height)
      const scaleX = part.dimensions.length / size.x;
      const scaleY = part.dimensions.width / size.y; 
      const scaleZ = part.dimensions.height / size.z;
      
      // Apply scaling based on the average of calculated scales
      const averageScale = (scaleX + scaleY + scaleZ) / 3;
      mesh.scale.setScalar(averageScale);
    }
    
    // Always center the geometry
    const geometry = mesh.geometry;
    geometry.computeBoundingBox();
    const center = geometry.boundingBox!.getCenter(new THREE.Vector3());
    geometry.translate(-center.x, -center.y, -center.z);
  };
  
  // Load mesh from URI or from provided mesh data
  const loadMeshFromUri = async (uri: string, meshData: { [key: string]: ArrayBuffer }, specification: any, linkName: string): Promise<THREE.Mesh> => {
    // Extract filename from URI (handles package:// format and regular paths)
    const filenameMatch = uri.match(/([^\/]+\.(stl|glb|obj))$/i);
    if (!filenameMatch) {
      throw new Error(`Invalid mesh URI: ${uri}`);
    }

    const filename = filenameMatch[1].toLowerCase();
    console.log(`Looking for mesh file: ${filename}`);

    // Check if we have the mesh data from ZIP
    if (meshData[filename]) {
      console.log(`Loading mesh from embedded data: ${filename}`);
      return loadSTLFromArrayBuffer(meshData[filename], specification, linkName);
    }

    // If not in ZIP, try to load from server (only supports STL for now)
    const meshPath = `/meshes/${filename}`;
    console.log(`Loading mesh from server: ${meshPath}`);
    
    return new Promise((resolve, reject) => {
      const loader = new STLLoader();
      loader.load(
        meshPath,
        (geometry) => {
          const specPart = getPartSpecification(specification, linkName);
          const material = createMaterialFromSpec(specPart, specification); 

          const mesh = new THREE.Mesh(geometry, material);
          
          // Apply part-specific scaling from specification if available
          applyPartScaling(mesh, specification, linkName);
          
          resolve(mesh);
        },
        undefined,
        (error) => {
          reject(new Error(`Failed to load mesh from ${meshPath}: ${error}`));
        }
      );
    });
  };

  // Parse SDF content and create 3D model
  const parseSDF = async (sdfContent: string, meshData: { [key: string]: ArrayBuffer }, specification?: any): Promise<void> => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(sdfContent, 'application/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.getElementsByTagName('parsererror');
    if (parseError.length > 0) {
      throw new Error('Invalid SDF XML format');
    }

    const modelElement = xmlDoc.querySelector('model');
    if (!modelElement) {
      throw new Error('No model found in SDF file');
    }

    const modelName = modelElement.getAttribute('name') || 'Unnamed Model';
    console.log(`Loading SDF model: ${modelName}`);

    // Create main group for the entire model
    const modelGroup = new THREE.Group();
    modelGroup.name = modelName;

    // Parse all links
    const linkElements = xmlDoc.querySelectorAll('link');
    const linkPromises = Array.from(linkElements).map(async (linkElement) => {
      const linkName = linkElement.getAttribute('name') || 'unnamed_link';
      console.log(`Processing link: ${linkName}`);
      
      const partSpec = getPartSpecification(specification, linkName);

      // --- 1. PARSE LINK POSE (Prioritize specification.json) ---
      let position = new THREE.Vector3(0, 0, 0);
      let rotation = new THREE.Euler(0, 0, 0);
      
      let poseValues: number[] | null = null;

      // A. Try to read position from specification.json's 'placement'
      if (partSpec?.placement) {
        position.set(
          partSpec.placement.x ?? 0, 
          partSpec.placement.y ?? 0, 
          partSpec.placement.z ?? 0
        );
        console.log(`Link ${linkName}: Using POSITION from specification.json's placement`);
        
        // Check for rotation in a dedicated 'pose' array (x,y,z,r,p,y) as a fallback, otherwise default to 0,0,0
        if (partSpec.pose && Array.isArray(partSpec.pose) && partSpec.pose.length >= 6) {
             rotation.set(partSpec.pose[3], partSpec.pose[4], partSpec.pose[5]);
             console.log(`Link ${linkName}: Using RPY from specification.json's 'pose' array`);
        }
      } 
      // B. Fallback to SDF XML if no specific placement in JSON
      else {
        const poseElement = linkElement.querySelector('pose');
        if (poseElement && poseElement.textContent) {
          poseValues = poseElement.textContent.split(' ').map(parseFloat);
          console.log(`Link ${linkName}: Using POSE from SDF XML`);
        }
        
        if (poseValues && poseValues.length >= 6) {
          // SDF order: X Y Z Roll Pitch Yaw
          position.set(poseValues[0], poseValues[1], poseValues[2]);
          rotation.set(poseValues[3], poseValues[4], poseValues[5]);
        }
      }
      // --- END POSE PARSING ---


      // Create group for this link
      const linkGroup = new THREE.Group();
      linkGroup.name = linkName;
      linkGroup.position.copy(position);
      linkGroup.rotation.copy(rotation);

      // Process visual elements
      const visualElements = linkElement.querySelectorAll('visual');
      for (const visualElement of visualElements) {
        const visualName = visualElement.getAttribute('name') || 'unnamed_visual';
        
        const meshElement = visualElement.querySelector('mesh uri');
        if (meshElement && meshElement.textContent) {
          const meshUri = meshElement.textContent;
          
          try {
            const mesh = await loadMeshFromUri(meshUri, meshData, specification, linkName);
            mesh.name = visualName;
            linkGroup.add(mesh);
          } catch (error) {
            console.error(`Failed to load mesh ${meshUri}:`, error);
            // Create a placeholder cube if mesh fails to load
            const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
            const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            const placeholder = new THREE.Mesh(geometry, material);
            placeholder.name = `${visualName}_placeholder`;
            linkGroup.add(placeholder);
          }
        }
      }

      return linkGroup;
    });

    // Wait for all links to load
    const linkGroups = await Promise.all(linkPromises);
    linkGroups.forEach(linkGroup => modelGroup.add(linkGroup));

    // Scale the entire model to make it easier to view
    scaleModelForViewing(modelGroup);

    onModelLoaded(modelGroup);
  };

  // Scale the entire model to fit nicely in the view
  const scaleModelForViewing = (modelGroup: THREE.Group) => {
    // Calculate bounding box of the entire model
    const bbox = new THREE.Box3().setFromObject(modelGroup);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    
    // Find the largest dimension
    const maxDimension = Math.max(size.x, size.y, size.z);
    
    // Calculate scale factor to fit within a reasonable view size (e.g., 10 units)
    const targetSize = 10;
    // Prevent division by zero if the model is empty or too small
    const scaleFactor = maxDimension > 0 ? targetSize / maxDimension : 1;
    
    console.log(`Model dimensions: ${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}`);
    console.log(`Scaling model by ${scaleFactor.toFixed(2)} for better viewing`);
    
    modelGroup.scale.setScalar(scaleFactor);
    
    // Center the model after scaling
    bbox.setFromObject(modelGroup);
    const center = bbox.getCenter(new THREE.Vector3());
    modelGroup.position.sub(center);
  };

  return (
    <div className="file-uploader">
      <h3>Upload Robot Model</h3>
      
      <div className="upload-section">
        <input
          ref={fileInputRef}
          type="file"
          accept=".sdf,.zip"
          onChange={handleFileUpload}
          disabled={isLoading}
          style={{ display: 'none' }}
        />
        
        <button
          className="upload-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Choose SDF/ZIP File'}
        </button>
        
        <div className="file-info">
          <p>Supported formats:</p>
          <ul>
            <li>**SDF** - Simulation Description Format files</li>
            <li>**ZIP** - Archives containing SDF file and meshes in mesh/ directory</li>
            <li>**Specification** - Will use `specification.json` inside ZIP for link poses, colors, and scaling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
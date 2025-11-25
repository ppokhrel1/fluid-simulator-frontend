import React, { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Mesh, BufferGeometry, BufferAttribute, Group, Object3D } from 'three';
import { TransformControls } from '@react-three/drei';
import type { MeshData } from '~/types/3dshapes';
import { LoaderUtils } from 'three';
import { XacroLoader } from 'xacro-parser';
import URDFLoader from 'urdf-loader';

// --- Helper Functions ---
// Utility to get the path to the main XACRO file.
// Assuming the user wants to load the uploaded file: 'Mars Exploration Rover.urdf.xacro'
const getUrdfUrl = (object: MeshData): string | null => {
    // You might define the URL in object.parameters, e.g., parameters: { url: 'robot.xacro' }
    const fileFromParams = object.parameters?.url as string;

    if (fileFromParams) {
        return fileFromParams;
    }
    // Fallback to the known uploaded file name if this component's data points to a URDF type
    if (object.type.toLowerCase() === 'urdf') {
        // NOTE: You must ensure this path is correct relative to where your web server serves files.
        return './Mars Exploration Rover.urdf.xacro'; 
    }
    return null;
};

// --- Component Interfaces ---

interface SceneObjectProps {
  object: MeshData;
  isSelected: boolean;
  // This type is correct for this component, allowing for complex groups/Object3Ds.
  onSelect: (objectId: string, mesh: Mesh | Group | Object3D | null) => void; 
  showTransformControls?: boolean;
  transformMode: 'translate' | 'rotate' | 'scale';
}

const SceneObject: React.FC<SceneObjectProps> = ({ 
  object, 
  isSelected, 
  onSelect, 
  showTransformControls = false,
  transformMode 
}) => {
  // Use a Group ref as the root container, as it can hold either a single Mesh or a complex hierarchy.
  const groupRef = useRef<Group>(null);
  
  // State to hold the loaded URDF hierarchy (THREE.Object3D)
  const [robotModel, setRobotModel] = useState<THREE.Object3D | null>(null);

  // Determine if we should attempt to load a URDF
  const isUrdf = object.type.toLowerCase() === 'urdf';
  const urdfUrl = isUrdf ? getUrdfUrl(object) : null;

  // --- URDF/XACRO Loading Effect ---
  useEffect(() => {
    if (!urdfUrl) {
      setRobotModel(null);
      return;
    }

    console.log(`🤖 Starting URDF Load for: ${urdfUrl}`);
    setRobotModel(null); // Clear previous model while loading

    const xacroLoader = new XacroLoader();
    
    // NOTE: Removed xacroLoader.workingPath = LoaderUtils.extractUrlBase(urdfUrl);
    // XacroLoader does not have a workingPath property.

    xacroLoader.load(
        urdfUrl, 
        (xml) => {
            try {
                const urdfLoader = new URDFLoader();
                // This is crucial for URDFLoader to find mesh files (STL, DAE, etc.)
                urdfLoader.workingPath = LoaderUtils.extractUrlBase(urdfUrl);
                
                // This is crucial for using geometry files like STL
                urdfLoader.manager = THREE.DefaultLoadingManager;

                const robot = urdfLoader.parse(xml);
                robot.name = `URDF:${object.id}`;
                
                // Apply scale and rotation if needed (URDF often uses meters, so scale is common)
                robot.scale.set(object.scale[0], object.scale[1], object.scale[2]);

                setRobotModel(robot);
                console.log(`✅ URDF Load complete for ${object.id}. Robot has ${robot.children.length} top-level elements.`);
                
            } catch (error) {
                console.error(`🔴 Error parsing URDF for ${object.id}:`, error);
            }
        }, 
        // FIX: The XacroLoader's signature is (url, onLoad, onError), requiring only 3 arguments.
        // We removed the 'undefined' onProgress callback.
        (error: any) => {
            console.error(`🔴 Error loading XACRO file for ${object.id}:`, error);
        }
    );
    
    // Cleanup function (optional, but good practice if URDFLoader had a robust dispose method)
    return () => {
        // No explicit cleanup needed here for the loaders, but useful for cancelling ongoing loads
    };
  }, [urdfUrl, object.id, object.scale]); // Dependency on URL and scale

  // --- Geometry Creation Logic (Primitives) ---
  const MeshComponent = useMemo(() => {
    if (isUrdf) return null; // Skip primitive mesh generation for URDF type

    // Default size for primitives if parameters are missing
    const DEFAULT_UNIT = 1.0; 
    
    // 💡 Determine the base geometry type by stripping 'ai_' or mapping 'boolean'
    const typeKey = object.type.toLowerCase();
    let baseType = typeKey;
    if (typeKey.startsWith('ai_')) {
        baseType = typeKey.substring(3); // e.g., 'ai_cylinder' -> 'cylinder'
    } else if (typeKey === 'boolean') {
        baseType = 'mesh'; // Treat boolean results as raw meshes
    }
    
    switch (baseType) {
      case 'cube':
        const size = object.parameters?.size || 4.0;
        return <boxGeometry args={[size, size, size]} />;
        
      case 'sphere':
        const radius = object.parameters?.radius || 2.0;
        return <sphereGeometry args={[radius, 32, 32]} />;
        
      case 'cylinder':
        const cylRadius = object.parameters?.radius || DEFAULT_UNIT;
        const cylHeight = object.parameters?.height || 4.0;
        // 32 segments is a good default for smooth appearance
        return <cylinderGeometry args={[cylRadius, cylRadius, cylHeight, 32]} />;
        
      case 'cone':
        const coneRadius = object.parameters?.radius || DEFAULT_UNIT;
        const coneHeight = object.parameters?.height || 4.0;
        return <coneGeometry args={[coneRadius, coneHeight, 32]} />;

      case 'torus':
        const majorRadius = object.parameters?.major_radius || 4.0;
        const minorRadius = object.parameters?.minor_radius || 1.0;
        return <torusGeometry args={[majorRadius, minorRadius, 16, 100]} />;

      // Custom/AI-generated Mesh using BufferGeometry (for raw 'mesh' or 'boolean' results)
      case 'mesh':
        if (object.vertices && object.faces) {
          const geometry = new BufferGeometry();
          
          const flatVertices = object.vertices.flat();
          const flatIndices = object.faces.flat();
          
          geometry.setAttribute('position', new BufferAttribute(new Float32Array(flatVertices), 3));
          geometry.setIndex(new BufferAttribute(new Uint32Array(flatIndices), 1));
          
          geometry.computeVertexNormals();
          return <primitive object={geometry} />;
        }
        // Fallthrough if mesh data is missing
        
      default:
        console.warn(`Unknown object type or missing parameters for ${object.id}: ${object.type}. Rendering a fallback box.`);
        return <boxGeometry args={[4, 4, 4]} />;
    }
  }, [object, isUrdf]); // Added isUrdf dependency

  const handleClick = (e: any) => {
    e.stopPropagation();
    // Select the whole group/model
    onSelect(object.id, groupRef.current);
  };
  
  const [x, y, z] = object.position || [0, 0, 0];
  const scaledPosition = [x, y, z] as [number, number, number];
  
  // Conditionally render based on type (URDF or Primitive)
  const content = isUrdf 
    ? (
        // Render the loaded robot model as a primitive
        robotModel 
            ? <primitive object={robotModel} /> 
            : <group>
                {/* Simple loading indicator/placeholder for URDF */}
                <mesh>
                    <sphereGeometry args={[0.5, 32, 32]} />
                    <meshBasicMaterial color={'orange'} wireframe={true} />
                </mesh>
            </group>
    ) 
    : (
        // Render the primitive/custom mesh
        <mesh
            castShadow
            receiveShadow
        >
            {MeshComponent} 
            <meshStandardMaterial 
                color={object.material?.color || (isSelected ? '#4f8cff' : '#ff6b6b')}
                metalness={object.material?.metalness ?? 0.2}
                roughness={object.material?.roughness ?? 0.6}
                emissive={object.material?.emissive || '#000000'}
                emissiveIntensity={object.material?.emissiveIntensity ?? 0}
                transparent={object.material?.transparent || false}
                opacity={object.material?.opacity || 1}
                wireframe={object.material?.wireframe || false}
                needsUpdate={true}
            />
        </mesh>
    );

  // The root element is now a <group> to correctly contain the complex URDF hierarchy or a simple <mesh>.
  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      position={scaledPosition}
      rotation={object.rotation}
      // Note: scale is applied to the robotModel primitive object for URDF, 
      // but kept on the group for primitives.
      scale={isUrdf ? [1, 1, 1] : object.scale} 
    >
      {content}
      
      {showTransformControls && groupRef.current && (
        <TransformControls 
          mode={transformMode} 
          object={groupRef.current} 
          onMouseUp={() => onSelect(object.id, groupRef.current)} // Use groupRef
        />
      )}
    </group>
  );
};

export default SceneObject;
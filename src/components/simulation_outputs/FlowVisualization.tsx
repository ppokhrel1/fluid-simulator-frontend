import React, { useMemo } from 'react';
import * as THREE from 'three';

interface FlowVisualizationProps {
  flowData: any;
  mode: 'streamlines' | 'vectors' | 'both';
}

const FlowVisualization: React.FC<FlowVisualizationProps> = ({ flowData, mode }) => {
  const vectorArrows = useMemo(() => {
    if (mode === 'streamlines' || !flowData?.velocity_field) return null;
    
    const { points, vectors, magnitude } = flowData.velocity_field;
    const arrows: THREE.ArrowHelper[] = [];
    
    // Sample fewer points for better performance
    const stride = Math.ceil(points.length / 900); // Limit to ~300 arrows
    
    for (let i = 0; i < points.length; i += stride * 3) {
      const pointIndex = i;
      const vectorIndex = i;
      
      const point = new THREE.Vector3(
        points[pointIndex], 
        points[pointIndex + 1], 
        points[pointIndex + 2]
      );
      const direction = new THREE.Vector3(
        vectors[vectorIndex], 
        vectors[vectorIndex + 1], 
        vectors[vectorIndex + 2]
      );
      const length = direction.length();
      
      if (length > 0.01) {
        direction.normalize();
        
        // Color by velocity magnitude (blue to red)
        const normalizedMag = Math.min(length / 2, 1);
        const color = new THREE.Color();
        color.setHSL(0.7 * (1 - normalizedMag), 1, 0.5);
        
        const arrowHelper = new THREE.ArrowHelper(
          direction,
          point,
          Math.min(length * 0.3, 0.5), // Scale arrow length
          color.getHex(),
          0.05, // Head length
          0.03  // Head width
        );
        
        arrows.push(arrowHelper);
      }
    }
    
    return arrows;
  }, [flowData, mode]);

  const streamlineMeshes = useMemo(() => {
    if (mode === 'vectors' || !flowData?.streamlines) return null;
    
    const meshes: THREE.Mesh[] = [];
    const streamlines = flowData.streamlines;
    
    // Color gradient for streamlines
    const colors = [
      new THREE.Color(0.1, 0.5, 1.0),  // Blue
      new THREE.Color(0.3, 0.8, 1.0),  // Light blue
      new THREE.Color(0.8, 0.9, 1.0),  // Very light blue
    ];
    
    streamlines.slice(0, 40).forEach((streamline: number[][], index: number) => {
      if (streamline.length < 2) return;
      
      const points = streamline.map(point => 
        new THREE.Vector3(point[0], point[1], point[2])
      );
      
      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.TubeGeometry(curve, 32, 0.008, 6, false);
      
      // Cycle through colors
      const material = new THREE.MeshBasicMaterial({
        color: colors[index % colors.length],
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      meshes.push(mesh);
    });
    
    return meshes;
  }, [flowData, mode]);

  const velocityContours = useMemo(() => {
    if (!flowData?.velocity_field?.points || mode === 'streamlines') return null;
    
    const { points, magnitude } = flowData.velocity_field;
    const geometry = new THREE.BufferGeometry();
    
    // Create point cloud for velocity magnitude visualization
    const positions = new Float32Array(points);
    const colors = new Float32Array(points.length);
    
    for (let i = 0; i < magnitude.length; i++) {
      const normalizedMag = Math.min(magnitude[i] / 2, 1);
      const color = new THREE.Color().setHSL(0.7 * (1 - normalizedMag), 1, 0.5);
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });
    
    return new THREE.Points(geometry, material);
  }, [flowData, mode]);

  return (
    <group>
      {/* Velocity vectors as arrows */}
      {vectorArrows && vectorArrows.map((arrow, index) => (
        <primitive key={`arrow-${index}`} object={arrow} />
      ))}
      
      {/* Streamlines as tubes */}
      {streamlineMeshes && streamlineMeshes.map((mesh, index) => (
        <primitive key={`streamline-${index}`} object={mesh} />
      ))}
      
      {/* Velocity magnitude point cloud */}
      {velocityContours && <primitive object={velocityContours} />}
    </group>
  );
};

export default FlowVisualization;
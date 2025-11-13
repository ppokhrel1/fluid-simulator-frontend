import React, { useMemo } from 'react';
import * as THREE from 'three';

interface ScalarFieldVisualizationProps {
  points: number[][];
  scalarValues: number[];
  fieldName: 'SDF' | 'Pressure';
}

/**
 * Renders a scalar field (like SDF or Pressure) as a color-mapped point cloud.
 */
const ScalarFieldVisualization: React.FC<ScalarFieldVisualizationProps> = ({ 
  points, 
  scalarValues, 
  fieldName 
}) => {

  const pointsMesh = useMemo(() => {
    // Enhanced validation with detailed logging
    if (!points || !scalarValues) {
      console.warn('ScalarFieldVisualization: Missing points or scalarValues', { 
        points, 
        scalarValues 
      });
      return null;
    }

    if (points.length === 0) {
      console.warn('ScalarFieldVisualization: Empty points array');
      return null;
    }

    if (scalarValues.length === 0) {
      console.warn('ScalarFieldVisualization: Empty scalarValues array');
      return null;
    }

    if (points.length !== scalarValues.length) {
      console.warn('ScalarFieldVisualization: Points and scalarValues length mismatch', {
        pointsLength: points.length,
        scalarValuesLength: scalarValues.length
      });
      return null;
    }

    // Additional validation: check if points are properly formatted [x,y,z] arrays
    const invalidPoints = points.filter(point => 
      !Array.isArray(point) || point.length !== 3 || 
      point.some(coord => typeof coord !== 'number' || isNaN(coord))
    );

    if (invalidPoints.length > 0) {
      console.warn('ScalarFieldVisualization: Invalid point format found', {
        invalidPointsCount: invalidPoints.length,
        sampleInvalid: invalidPoints[0]
      });
      return null;
    }

    const invalidScalars = scalarValues.filter(val => 
      typeof val !== 'number' || isNaN(val) || !isFinite(val)
    );

    if (invalidScalars.length > 0) {
      console.warn('ScalarFieldVisualization: Invalid scalar values found', {
        invalidScalarsCount: invalidScalars.length,
        sampleInvalid: invalidScalars[0]
      });
      // Continue but log warning
    }

    console.log('ScalarFieldVisualization: Creating visualization with', {
      points: points.length,
      scalarValues: scalarValues.length,
      fieldName
    });

    try {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(points.length * 3);
      const colors = new Float32Array(points.length * 3);

      // Filter out extreme outliers and compute normalization
      let minVal = Infinity;
      let maxVal = -Infinity;
      
      // Use the 99th percentile to filter outliers and get a better color range
      const validScalars = scalarValues.filter(val => 
        typeof val === 'number' && isFinite(val)
      );
      
      if (validScalars.length === 0) {
        console.warn('ScalarFieldVisualization: No valid scalar values');
        return null;
      }

      const sortedValues = [...validScalars].sort((a, b) => a - b);
      const p99Index = Math.floor(sortedValues.length * 0.99);
      const p01Index = Math.floor(sortedValues.length * 0.01);
      
      // Set min/max based on the 1st and 99th percentiles
      minVal = sortedValues[p01Index];
      maxVal = sortedValues[p99Index];
      
      // Ensure min and max are different to avoid division by zero
      if (minVal === maxVal) {
        maxVal = minVal + 0.001; // Small offset to avoid division by zero
      }
      
      if (fieldName === 'SDF') {
          // For SDF, we typically want to see the near-field, so clamp around a small range
          minVal = Math.max(-0.2, minVal); 
          maxVal = Math.min(0.2, maxVal);
      }
      
      // Color mapping function (Blue to Red - Jet-like)
      const getColor = (value: number) => {
        // Handle invalid values
        if (typeof value !== 'number' || !isFinite(value)) {
          return new THREE.Color(0.5, 0.5, 0.5); // Gray for invalid
        }
        
        // Clamp value to the computed range
        const clampedValue = Math.max(minVal, Math.min(maxVal, value));
        
        // Normalize to [0, 1]
        const normalized = (clampedValue - minVal) / (maxVal - minVal);
        
        const color = new THREE.Color();
        // Use HSL for a blue (low/cold, hue 0.6) to red (high/hot, hue 0.0) gradient
        const hue = 0.6 * (1 - normalized); 
        color.setHSL(hue, 0.8, 0.5); // Saturation 0.8, Lightness 0.5
        return color;
      };

      for (let i = 0; i < points.length; i++) {
        const [x, y, z] = points[i];
        const scalar = scalarValues[i];

        // Position
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // Color
        const color = getColor(scalar);
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
      
      console.log('ScalarFieldVisualization: Successfully created mesh');
      return new THREE.Points(geometry, material);

    } catch (error) {
      console.error('ScalarFieldVisualization: Error creating mesh:', error);
      return null;
    }
  }, [points, scalarValues, fieldName]);
  
  if (!pointsMesh) {
    // Return a fallback or null instead of throwing error
    return null;
  }
  
  return (
    <group>
      {pointsMesh && <primitive object={pointsMesh} />}
    </group>
  );
};

export default ScalarFieldVisualization;
import React, { useEffect, useRef } from 'react';
import { Group, LoaderUtils, Mesh, BoxGeometry, MeshStandardMaterial } from 'three';
import URDFLoader from 'urdf-loader';
import { XacroLoader } from 'xacro-parser';

const DebugObject: React.FC = () => {
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    const ROVER_URL = './MarsExplorationRover.urdf.xacro';

    const loadModel = () => {
      const xacroLoader = new XacroLoader();

      xacroLoader.load(
        ROVER_URL,
        (xml) => {
          if (!xml) {
            console.error('XACROLoader returned undefined XML');
            return;
          }

          const urdfLoader = new URDFLoader();

          // Set working path for relative references (not needed here, but good practice)
          urdfLoader.workingPath = LoaderUtils.extractUrlBase(ROVER_URL);

          // Fallback for meshes (boxes already defined, but ensures robust loading)
          urdfLoader.loadMeshCb = (path, manager, onComplete) => {
            const geometry = new BoxGeometry(1, 1, 1);
            const material = new MeshStandardMaterial({ color: 0x00ff00 });
            const mesh = new Mesh(geometry, material);
            onComplete(mesh);
          };

          // Parse the XACRO-expanded URDF
          const robot = urdfLoader.parse(xml);

          // Set initial joint poses for a more realistic rover layout
          const jointAngles: { [key: string]: number } = {
            'Chassis_FrontLeftWheel': 0,
            'Chassis_FrontRightWheel': 0,
            'Chassis_RearLeftWheel': 0,
            'Chassis_RearRightWheel': 0,
            'Chassis_Manipulator': Math.PI / 6,
            'Manipulator_Gripper': Math.PI / 4,
          };

          Object.keys(jointAngles).forEach((jointName) => {
            const joint = robot.joints[jointName];
            if (joint) joint.setJointValue(jointAngles[jointName]);
          });

          if (groupRef.current) groupRef.current.add(robot);
        },
        (err) => {
          console.error('Failed to load XACRO:', err);
        }
      );
    };

    loadModel();
  }, []);

  return <group ref={groupRef} />;
};

export default DebugObject;

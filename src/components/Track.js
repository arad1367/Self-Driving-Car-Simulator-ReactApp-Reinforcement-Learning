import React from "react";
import { Box, Plane, Sphere } from "@react-three/drei";
import * as THREE from "three";

const Track = ({ sensors = [0, 0, 0, 0, 0] }) => {
  return (
    <group>
      <Plane
        args={[50, 50]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#333333" roughness={0.8} metalness={0.2} />
      </Plane>

      <gridHelper
        args={[50, 50, "#444444", "#222222"]}
        position={[0, 0.01, 0]}
      />

      <Box
        args={[2, 1.5, 20]}
        position={[10, 0.75, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#555555" roughness={0.7} metalness={0.3} />
      </Box>

      <Box
        args={[2, 1.5, 20]}
        position={[-10, 0.75, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#555555" roughness={0.7} metalness={0.3} />
      </Box>

      <Box
        args={[20, 1.5, 2]}
        position={[0, 0.75, 10]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#555555" roughness={0.7} metalness={0.3} />
      </Box>

      <Box
        args={[20, 1.5, 2]}
        position={[0, 0.75, -10]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#555555" roughness={0.7} metalness={0.3} />
      </Box>

      <group position={[8, 0, 8]}>
        <Sphere args={[0.7]} position={[0, 0.7, 0]} castShadow>
          <meshStandardMaterial
            color="green"
            emissive="green"
            emissiveIntensity={0.5}
            roughness={0.3}
            metalness={0.7}
          />
        </Sphere>

        <pointLight
          position={[0, 1.5, 0]}
          color="green"
          intensity={5}
          distance={5}
        />
      </group>

      <Box
        args={[1.5, 0.3, 1.5]}
        position={[8, 0.15, 8]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#444444" />
      </Box>
    </group>
  );
};

export default Track;

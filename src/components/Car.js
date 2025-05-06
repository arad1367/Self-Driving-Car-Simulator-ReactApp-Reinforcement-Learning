import React from "react";
import { Box, Cylinder } from "@react-three/drei";
import * as THREE from "three";

const Car = ({
  position,
  rotation,
  color,
  sensors = [1, 1, 1, 1, 1],
  speed = 0,
}) => {
  const sensorAngles = [
    -Math.PI / 4,
    -Math.PI / 8,
    0,
    Math.PI / 8,
    Math.PI / 4,
  ];
  const sensorRange = 10;

  // Calculate visual effects based on speed
  const speedAbs = Math.abs(speed);
  const thrusterSize = speedAbs * 2; // Thruster size scales with speed
  const thrusterOpacity = Math.min(0.8, speedAbs * 3); // Opacity increases with speed

  // Wheel rotation effect based on speed direction
  const wheelRotationX = speed > 0 ? Math.PI / 2 : Math.PI / 2 - 0.2;

  // Determine if car is braking
  const isBraking = speed < -0.01;

  // Car tilt based on speed (leaning forward when accelerating, backward when braking)
  const carTilt = speed * 0.2;

  return (
    <group position={position} rotation={rotation}>
      {/* Main car body with tilt effect */}
      <group rotation={[carTilt, 0, 0]}>
        <Box args={[1, 0.4, 2]} position={[0, 0.2, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={color} />
        </Box>
        <Box args={[0.8, 0.2, 1]} position={[0, 0.5, -0.2]} castShadow>
          <meshStandardMaterial color={color} />
        </Box>

        {/* Front lights */}
        <Box args={[0.1, 0.1, 0.05]} position={[0.3, 0.3, 0.9]} castShadow>
          <meshStandardMaterial
            color="yellow"
            emissive="yellow"
            emissiveIntensity={0.5}
          />
        </Box>
        <Box args={[0.1, 0.1, 0.05]} position={[-0.3, 0.3, 0.9]} castShadow>
          <meshStandardMaterial
            color="yellow"
            emissive="yellow"
            emissiveIntensity={0.5}
          />
        </Box>

        {/* Brake lights - glow red when braking */}
        <Box args={[0.1, 0.1, 0.05]} position={[0.3, 0.3, -0.9]} castShadow>
          <meshStandardMaterial
            color={isBraking ? "#ff0000" : "#8B0000"}
            emissive={isBraking ? "#ff0000" : "#400000"}
            emissiveIntensity={isBraking ? 2 : 0.2}
          />
        </Box>
        <Box args={[0.1, 0.1, 0.05]} position={[-0.3, 0.3, -0.9]} castShadow>
          <meshStandardMaterial
            color={isBraking ? "#ff0000" : "#8B0000"}
            emissive={isBraking ? "#ff0000" : "#400000"}
            emissiveIntensity={isBraking ? 2 : 0.2}
          />
        </Box>
      </group>

      {/* Wheels with rotation effect */}
      <Box
        args={[0.25, 0.25, 0.25]}
        position={[0.4, 0.125, 0.8]}
        rotation={[wheelRotationX, 0, Math.PI / 2]}
        castShadow
      >
        <meshStandardMaterial color="black" />
      </Box>
      <Box
        args={[0.25, 0.25, 0.25]}
        position={[-0.4, 0.125, 0.8]}
        rotation={[wheelRotationX, 0, Math.PI / 2]}
        castShadow
      >
        <meshStandardMaterial color="black" />
      </Box>
      <Box
        args={[0.25, 0.25, 0.25]}
        position={[0.4, 0.125, -0.8]}
        rotation={[wheelRotationX, 0, Math.PI / 2]}
        castShadow
      >
        <meshStandardMaterial color="black" />
      </Box>
      <Box
        args={[0.25, 0.25, 0.25]}
        position={[-0.4, 0.125, -0.8]}
        rotation={[wheelRotationX, 0, Math.PI / 2]}
        castShadow
      >
        <meshStandardMaterial color="black" />
      </Box>

      {/* Thruster/exhaust effect that grows with speed */}
      {speedAbs > 0.02 && (
        <Cylinder
          args={[0.2, 0.3, thrusterSize, 8]}
          position={[0, 0.2, -1 - thrusterSize / 2]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial
            color={isBraking ? "#ff6666" : "#ff9933"}
            emissive={isBraking ? "#ff3333" : "#ff6600"}
            emissiveIntensity={2}
            transparent
            opacity={thrusterOpacity}
          />
        </Cylinder>
      )}

      {/* Add small exhaust pipe */}
      <Cylinder
        args={[0.1, 0.1, 0.2, 8]}
        position={[0, 0.25, -0.95]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
      </Cylinder>

      {/* Sensor visualizations */}
      {sensors.map((sensor, i) => (
        <group key={i} rotation={[0, sensorAngles[i], 0]}>
          <Cylinder
            args={[0.02, 0.02, sensor * sensorRange, 8]}
            position={[0, 0.3, (sensor * sensorRange) / 2]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial
              color="rgba(255,0,0,0.3)"
              transparent
              opacity={0.3}
            />
          </Cylinder>
        </group>
      ))}

      {/* Ground effect - subtle shadow/glow under the car when moving fast */}
      {speedAbs > 0.1 && (
        <Box args={[1.2, 0.05, 2.2]} position={[0, -0.1, 0]} receiveShadow>
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.3 * speedAbs}
          />
        </Box>
      )}
    </group>
  );
};

export default Car;

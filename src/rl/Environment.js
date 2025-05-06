import * as THREE from "three";

class Environment {
  constructor() {
    this.trackWidth = 20;
    this.trackHeight = 20;
    this.wallThickness = 2;
    this.walls = [
      { start: [-10, -10], end: [10, -10], normal: [0, 1] },
      { start: [10, -10], end: [10, 10], normal: [-1, 0] },
      { start: [10, 10], end: [-10, 10], normal: [0, -1] },
      { start: [-10, 10], end: [-10, -10], normal: [1, 0] },
    ];

    this.goalPosition = [8, 8];
    this.goalRadius = 2;

    // Improved car physics properties
    this.maxSpeed = 0.25;
    this.acceleration = 0.02;
    this.deceleration = 0.01; // Natural deceleration
    this.turnSpeed = 0.05;
    this.friction = 0.98;
    this.brakeStrength = 0.04;

    // Additional physics properties for more natural feel
    this.minTurnSpeed = 0.01;
    this.steeringFactor = 0.7;
    this.driftFactor = 0.01;

    // Key state tracking
    this.keysHeld = {
      accelerate: false,
      brake: false,
      turnLeft: false,
      turnRight: false,
    };

    this.currentLearningRate = 0.1;
    this.currentGamma = 0.9;

    this.reset();
  }

  setParameters(learningRate, gamma) {
    this.currentLearningRate = learningRate;
    this.currentGamma = gamma;
  }

  reset() {
    this.carPosition = [0, 0];
    this.carRotation = Math.PI / 2;
    this.carSpeed = 0; // Set initial speed to 0 (not moving)
    this.carLateralSpeed = 0;
    this.sensorReadings = Array(5).fill(0);
    this.isTerminated = false;
    this.goalReached = false;
    this.totalReward = 0;
    this.lastActionTime = Date.now();

    // Reset key states
    this.keysHeld = {
      accelerate: false,
      brake: false,
      turnLeft: false,
      turnRight: false,
    };

    this.updateSensors();

    return this.getState();
  }

  updateSensors() {
    const sensorAngles = [
      -Math.PI / 4,
      -Math.PI / 8,
      0,
      Math.PI / 8,
      Math.PI / 4,
    ];
    const sensorRange = 10;

    for (let i = 0; i < sensorAngles.length; i++) {
      const angle = this.carRotation + sensorAngles[i];
      const direction = [Math.sin(angle), Math.cos(angle)];
      let distance = sensorRange;

      for (const wall of this.walls) {
        const intersection = this.rayWallIntersection(
          this.carPosition,
          direction,
          wall.start,
          wall.end
        );

        if (intersection && intersection.distance < distance) {
          distance = intersection.distance;
        }
      }

      this.sensorReadings[i] = distance / sensorRange;
    }
  }

  rayWallIntersection(origin, direction, wallStart, wallEnd) {
    const x1 = wallStart[0];
    const y1 = wallStart[1];
    const x2 = wallEnd[0];
    const y2 = wallEnd[1];

    const x3 = origin[0];
    const y3 = origin[1];
    const x4 = origin[0] + direction[0];
    const y4 = origin[1] + direction[1];

    const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

    if (denominator === 0) {
      return null;
    }

    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;

    if (ua < 0 || ua > 1) {
      return null;
    }

    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

    if (ub < 0) {
      return null;
    }

    const x = x1 + ua * (x2 - x1);
    const y = y1 + ua * (y2 - y1);
    const distance = Math.sqrt((x - x3) ** 2 + (y - y3) ** 2);

    return { x, y, distance };
  }

  // New method to set key states
  setKeyState(action, isPressed) {
    switch (action) {
      case 0: // Accelerate
        this.keysHeld.accelerate = isPressed;
        break;
      case 1: // Brake
        this.keysHeld.brake = isPressed;
        break;
      case 2: // Turn Left
        this.keysHeld.turnLeft = isPressed;
        break;
      case 3: // Turn Right
        this.keysHeld.turnRight = isPressed;
        break;
    }
  }

  // Modified step to work with key state tracking
  step(action) {
    // For AI training, just set the key for a single frame
    if (action !== undefined) {
      this.setKeyState(action, true);

      const result = this.updatePhysics();

      // Reset the key state after one frame (for AI training)
      this.setKeyState(action, false);

      return result;
    }

    // For manual control, just update physics based on current key states
    return this.updatePhysics();
  }

  // Physics update method
  updatePhysics() {
    const now = Date.now();
    const deltaTime = Math.min(100, now - this.lastActionTime) / 1000; // Cap at 100ms, convert to seconds
    this.lastActionTime = now;

    if (this.isTerminated) {
      return {
        nextState: this.getState(),
        reward: 0,
        done: true,
      };
    }

    // Process all currently held keys
    this.processKeyStates(deltaTime);

    this.updateSensors();

    const distanceToGoal = this.getDistanceToGoal();
    const isCollision = this.checkCollision();
    const isGoalReached = distanceToGoal < this.goalRadius;

    let reward = 0;

    if (isCollision) {
      reward = -10 * (1 + this.currentLearningRate);
      this.isTerminated = true;
    } else if (isGoalReached) {
      reward = 10 * (1 + this.currentGamma);
      this.isTerminated = true;
      this.goalReached = true;
    } else {
      // Base reward is affected by parameters
      reward =
        -0.1 * (1 - this.currentLearningRate / 2) +
        (1 / (distanceToGoal + 1)) * this.currentGamma;
    }

    this.totalReward += reward;

    return {
      nextState: this.getState(),
      reward,
      done: this.isTerminated,
    };
  }

  // Process all key states at once
  processKeyStates(deltaTime) {
    // Normalize to 60fps for consistent feel regardless of frame rate
    const normalizedDelta = deltaTime * 60;

    // IMPORTANT FIX: Start with zero acceleration by default
    let accelerationAmount = 0;

    // Handle acceleration/deceleration
    if (this.keysHeld.accelerate) {
      accelerationAmount = this.acceleration * normalizedDelta;
    }

    if (this.keysHeld.brake) {
      // Apply stronger braking when explicitly braking
      accelerationAmount = -this.brakeStrength * normalizedDelta;
    }

    // Apply acceleration to speed
    this.carSpeed += accelerationAmount;

    // IMPORTANT FIX: Only apply friction, not automatic deceleration when no keys are pressed
    // Apply small friction to gradually slow down
    this.carSpeed *= this.friction;

    // If speed is very low and no acceleration, stop completely
    if (Math.abs(this.carSpeed) < 0.001 && accelerationAmount === 0) {
      this.carSpeed = 0;
    }

    // Apply speed limits
    this.carSpeed = Math.max(
      -this.maxSpeed * 0.5, // Reverse is slower than forward
      Math.min(this.maxSpeed, this.carSpeed)
    );

    // Calculate turn rate based on speed
    const speedFactor = Math.abs(this.carSpeed / this.maxSpeed);
    const turnFactor =
      this.minTurnSpeed +
      (1 - this.minTurnSpeed) * (1 - speedFactor * this.steeringFactor);

    // Apply turning only if car is moving
    if (Math.abs(this.carSpeed) > 0.0001) {
      if (this.keysHeld.turnLeft) {
        const actualTurnSpeed = this.turnSpeed * turnFactor;
        this.carRotation += actualTurnSpeed * normalizedDelta;

        // Add slight lateral drift at high speeds when turning
        if (Math.abs(this.carSpeed) > this.maxSpeed * 0.7) {
          this.carLateralSpeed = this.driftFactor * this.carSpeed;
        }
      } else if (this.keysHeld.turnRight) {
        const actualTurnSpeed = this.turnSpeed * turnFactor;
        this.carRotation -= actualTurnSpeed * normalizedDelta;

        // Add slight lateral drift at high speeds when turning
        if (Math.abs(this.carSpeed) > this.maxSpeed * 0.7) {
          this.carLateralSpeed = -this.driftFactor * this.carSpeed;
        }
      } else {
        // Gradually reduce lateral drift when not turning
        this.carLateralSpeed *= 0.9;
      }
    }

    // Calculate movement vector based on rotation
    const forwardVector = [
      Math.sin(this.carRotation),
      Math.cos(this.carRotation),
    ];

    // Calculate lateral vector (perpendicular to forward)
    const lateralVector = [-forwardVector[1], forwardVector[0]];

    // Calculate new position based on forward speed and lateral drift
    const nextX =
      this.carPosition[0] +
      forwardVector[0] * this.carSpeed +
      lateralVector[0] * this.carLateralSpeed;
    const nextY =
      this.carPosition[1] +
      forwardVector[1] * this.carSpeed +
      lateralVector[1] * this.carLateralSpeed;

    // Store current position before updating
    const currentPosition = [...this.carPosition];

    // Check for collision with walls
    const nextPosition = [nextX, nextY];
    const carSize = 1.2;
    let collision = false;

    for (const wall of this.walls) {
      const distance = this.distanceToLine(nextPosition, wall.start, wall.end);

      if (distance < carSize / 2) {
        collision = true;
        break;
      }
    }

    // IMPORTANT FIX: Keep the car from penetrating walls
    if (!collision) {
      // Update position only if no collision
      this.carPosition = nextPosition;
    } else {
      // Stop the car completely instead of bouncing
      this.carSpeed = 0;
      this.carLateralSpeed = 0;

      // Apply a small penalty for hitting walls
      this.totalReward -= 0.5;
    }
  }

  getDistanceToGoal() {
    const dx = this.carPosition[0] - this.goalPosition[0];
    const dy = this.carPosition[1] - this.goalPosition[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  checkCollision() {
    const carSize = 1.2;

    for (const wall of this.walls) {
      const distance = this.distanceToLine(
        this.carPosition,
        wall.start,
        wall.end
      );

      if (distance < carSize / 2) {
        return true;
      }
    }

    return false;
  }

  distanceToLine(point, lineStart, lineEnd) {
    const x0 = point[0];
    const y0 = point[1];
    const x1 = lineStart[0];
    const y1 = lineStart[1];
    const x2 = lineEnd[0];
    const y2 = lineEnd[1];

    const A = x0 - x1;
    const B = y0 - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x0 - xx;
    const dy = y0 - yy;

    return Math.sqrt(dx * dx + dy * dy);
  }

  getState() {
    return {
      position: [...this.carPosition],
      rotation: this.carRotation,
      sensors: [...this.sensorReadings],
      velocity: this.carSpeed,
      lateralVelocity: this.carLateralSpeed,
      goalReached: this.goalReached,
      collision: this.checkCollision(),
    };
  }

  get3DPosition() {
    return [this.carPosition[0], 0, this.carPosition[1]];
  }

  get3DRotation() {
    return [0, -this.carRotation + Math.PI, 0];
  }
}

export default Environment;

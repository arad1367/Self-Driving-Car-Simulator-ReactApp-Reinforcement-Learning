import React, { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Car from "./Car";
import Track from "./Track";
import Controls from "./Controls";
import QTableVisualization from "./QTableVisualization";
import RewardVisualization from "./RewardVisualization";
import Environment from "../rl/Environment";
import Agent from "../rl/Agent";

const CarSimulation = () => {
  // State for car position, parameters and visualization
  const [carPosition, setCarPosition] = useState([0, 0, 0]);
  const [carRotation, setCarRotation] = useState([0, Math.PI / 2, 0]);
  const [learningRate, setLearningRate] = useState(0.1);
  const [gamma, setGamma] = useState(0.9);
  const [episodes, setEpisodes] = useState(100);
  const [isAiMode, setIsAiMode] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [totalReward, setTotalReward] = useState(0);
  const [sensors, setSensors] = useState([0, 0, 0, 0, 0]);
  const [qTable, setQTable] = useState({});
  const [rewardHistory, setRewardHistory] = useState([]);
  const [goalReached, setGoalReached] = useState(false);
  const [showGoalMessage, setShowGoalMessage] = useState(false);
  const [carSpeed, setCarSpeed] = useState(0); // For UI display

  // Refs for managing environment, agent and animation
  const environmentRef = useRef(null);
  const agentRef = useRef(null);
  const keysPressed = useRef({});
  const manualIntervalRef = useRef(null);
  const trainingRef = useRef(false);
  const trainingLoopRef = useRef(null);

  // Initialize environment and agent on component mount
  useEffect(() => {
    initEnvironmentAndAgent();

    return () => {
      cleanupIntervals();
    };
  }, []);

  // Clean up any intervals or async operations
  const cleanupIntervals = () => {
    if (manualIntervalRef.current) {
      clearInterval(manualIntervalRef.current);
      manualIntervalRef.current = null;
    }

    trainingRef.current = false;

    if (trainingLoopRef.current) {
      clearTimeout(trainingLoopRef.current);
      trainingLoopRef.current = null;
    }
  };

  // Initialize environment and agent with current parameters
  const initEnvironmentAndAgent = () => {
    environmentRef.current = new Environment();
    agentRef.current = new Agent(5, 4, learningRate, gamma);

    // Set initial parameters
    environmentRef.current.setParameters(learningRate, gamma);

    // Update 3D position
    updateCarFromEnvironment();
  };

  // Update parameters when they change
  useEffect(() => {
    if (environmentRef.current && agentRef.current) {
      environmentRef.current.setParameters(learningRate, gamma);
      agentRef.current.setParameters(learningRate, gamma);
    }
  }, [learningRate, gamma]);

  // Setup keyboard handlers
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleKeyDown = (e) => {
    // Prevent default behavior for arrow keys to avoid page scrolling
    if (
      [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "w",
        "a",
        "s",
        "d",
        " ",
      ].includes(e.key)
    ) {
      e.preventDefault();
    }

    keysPressed.current[e.key] = true;

    // If in manual mode, set the key state in the environment
    if (!isAiMode && environmentRef.current) {
      if (e.key === "ArrowUp" || e.key === "w") {
        environmentRef.current.setKeyState(0, true); // Accelerate
      }
      if (e.key === "ArrowDown" || e.key === "s") {
        environmentRef.current.setKeyState(1, true); // Brake
      }
      if (e.key === "ArrowLeft" || e.key === "a") {
        environmentRef.current.setKeyState(2, true); // Turn left
      }
      if (e.key === "ArrowRight" || e.key === "d") {
        environmentRef.current.setKeyState(3, true); // Turn right
      }
    }
  };

  const handleKeyUp = (e) => {
    keysPressed.current[e.key] = false;

    // If in manual mode, release the key in the environment
    if (!isAiMode && environmentRef.current) {
      if (e.key === "ArrowUp" || e.key === "w") {
        environmentRef.current.setKeyState(0, false); // Release Accelerate
      }
      if (e.key === "ArrowDown" || e.key === "s") {
        environmentRef.current.setKeyState(1, false); // Release Brake
      }
      if (e.key === "ArrowLeft" || e.key === "a") {
        environmentRef.current.setKeyState(2, false); // Release Turn left
      }
      if (e.key === "ArrowRight" || e.key === "d") {
        environmentRef.current.setKeyState(3, false); // Release Turn right
      }
    }
  };

  // Handle switching between AI and manual mode
  useEffect(() => {
    if (isAiMode) {
      stopManualControl();
    } else {
      stopTraining();
      startManualControl();
    }

    return () => {
      stopManualControl();
    };
  }, [isAiMode]);

  // Start the manual control loop
  const startManualControl = () => {
    if (manualIntervalRef.current) return;

    manualIntervalRef.current = setInterval(() => {
      if (!environmentRef.current) return;

      // Let the environment handle the physics update based on current key states
      environmentRef.current.updatePhysics();

      // Update car position and check for goal
      updateCarFromEnvironment();

      // Check if goal reached
      const state = environmentRef.current.getState();
      if (state.goalReached) {
        setGoalReached(true);
      }
    }, 16); // ~60fps for smooth control
  };

  // Stop the manual control loop
  const stopManualControl = () => {
    if (manualIntervalRef.current) {
      clearInterval(manualIntervalRef.current);
      manualIntervalRef.current = null;
    }
  };

  // Update car position from environment state
  const updateCarFromEnvironment = () => {
    if (!environmentRef.current) return;

    const position3D = environmentRef.current.get3DPosition();
    const rotation3D = environmentRef.current.get3DRotation();
    const state = environmentRef.current.getState();

    setCarPosition(position3D);
    setCarRotation(rotation3D);
    setSensors(state.sensors);
    setCarSpeed(state.velocity);

    if (state.goalReached) {
      setGoalReached(true);
    }
  };

  // Handle goal reached notification
  useEffect(() => {
    if (goalReached) {
      showGoalNotification();
    }
  }, [goalReached]);

  const showGoalNotification = () => {
    setShowGoalMessage(true);

    setTimeout(() => {
      setShowGoalMessage(false);
    }, 3000);
  };

  // Start AI training process
  const startTraining = async () => {
    if (!isAiMode || isTraining || !environmentRef.current || !agentRef.current)
      return;

    setIsTraining(true);
    trainingRef.current = true;

    // Clear previous training data
    setCurrentEpisode(0);
    setTotalReward(0);
    setRewardHistory([]);

    // Reset environment and agent for fresh training
    environmentRef.current.reset();
    updateCarFromEnvironment();

    // Run the training loop in the background
    runTrainingLoop();
  };

  // Stop the training process
  const stopTraining = () => {
    trainingRef.current = false;
    setIsTraining(false);

    if (trainingLoopRef.current) {
      clearTimeout(trainingLoopRef.current);
      trainingLoopRef.current = null;
    }
  };

  // Main training loop implementation
  const runTrainingLoop = async () => {
    if (!environmentRef.current || !agentRef.current) return;

    const env = environmentRef.current;
    const agent = agentRef.current;
    const newRewardHistory = [...rewardHistory];
    let currentEpisodeCount = 0;

    // Training episode loop
    while (trainingRef.current && currentEpisodeCount < episodes) {
      currentEpisodeCount++;
      setCurrentEpisode(currentEpisodeCount);

      let state = env.reset();
      let episodeReward = 0;
      let done = false;
      setGoalReached(false);

      updateCarFromEnvironment();

      // Training step loop for the current episode
      while (!done && trainingRef.current) {
        // Get action from the agent
        const action = agent.getAction(state);

        // Apply the action in the environment
        const { nextState, reward, done: isDone } = env.step(action);

        // Update the agent's knowledge
        agent.update(state, action, reward, nextState, isDone);

        // Update state and tracking variables
        state = nextState;
        episodeReward += reward;
        done = isDone;

        // Update visualization
        updateCarFromEnvironment();
        setTotalReward(episodeReward);
        setQTable({ ...agent.qTable });

        // Check for goal
        if (nextState.goalReached) {
          setGoalReached(true);
        }

        // Pause between steps - faster with higher learning rate
        const stepPauseTime = Math.max(10, 50 - learningRate * 40);
        await new Promise((resolve) => {
          trainingLoopRef.current = setTimeout(resolve, stepPauseTime);
        });
      }

      // Record episode results
      newRewardHistory.push(episodeReward);
      setRewardHistory([...newRewardHistory]);

      // Pause between episodes - shorter with higher gamma
      const episodePauseTime = Math.max(100, 500 - gamma * 300);
      await new Promise((resolve) => {
        trainingLoopRef.current = setTimeout(resolve, episodePauseTime);
      });
    }

    // Training complete
    trainingRef.current = false;
    setIsTraining(false);
  };

  // Reset everything to initial state
  const resetTraining = () => {
    // Stop any ongoing processes
    stopTraining();
    stopManualControl();

    // Reset state
    setGoalReached(false);
    setCurrentEpisode(0);
    setTotalReward(0);
    setRewardHistory([]);
    setCarSpeed(0);

    // Reset environment
    if (environmentRef.current) {
      environmentRef.current.reset();
      updateCarFromEnvironment();
    }

    // Restart appropriate mode
    if (!isAiMode) {
      startManualControl();
    }
  };

  // Handle AI/Manual mode toggling
  const handleModeChange = (newMode) => {
    // Clean up current mode
    if (isAiMode) {
      stopTraining();
    } else {
      stopManualControl();
    }

    // Set new mode
    setIsAiMode(newMode);
    setIsTraining(false);

    // Reset environment for the new mode
    resetTraining();
  };

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex" }}>
      <div style={{ flex: 3, position: "relative" }}>
        <Canvas shadows camera={{ position: [0, 10, 10], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <Track sensors={sensors} />
          <Car
            position={carPosition}
            rotation={carRotation}
            color={isAiMode ? "blue" : "red"}
            sensors={sensors}
            speed={carSpeed}
          />
          <OrbitControls />
        </Canvas>

        {showGoalMessage && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "rgba(0, 0, 0, 0.8)",
              color: "#4caf50",
              padding: "20px 40px",
              borderRadius: "10px",
              fontSize: "24px",
              fontWeight: "bold",
              textAlign: "center",
              zIndex: 100,
            }}
          >
            Goal Reached! 🎉
            <div style={{ fontSize: "16px", marginTop: "10px" }}>
              Press Reset to start a new run
            </div>
          </div>
        )}

        {/* Speed Indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            background: "rgba(0, 0, 0, 0.7)",
            color: "#fff",
            padding: "10px 15px",
            borderRadius: "5px",
            fontSize: "16px",
            zIndex: 50,
          }}
        >
          Speed: {Math.abs(Math.round(carSpeed * 100))}%
        </div>
      </div>
      <div
        style={{
          flex: 1,
          padding: "20px",
          backgroundColor: "#222",
          overflowY: "auto",
          height: "100vh",
        }}
      >
        <Controls
          learningRate={learningRate}
          setLearningRate={setLearningRate}
          gamma={gamma}
          setGamma={setGamma}
          episodes={episodes}
          setEpisodes={setEpisodes}
          isAiMode={isAiMode}
          setIsAiMode={handleModeChange}
          startTraining={startTraining}
          resetTraining={resetTraining}
          currentEpisode={currentEpisode}
          totalReward={totalReward}
          goalReached={goalReached}
          isTraining={isTraining}
        />
        <RewardVisualization rewardHistory={rewardHistory} />
        <QTableVisualization qTable={qTable} />
      </div>
    </div>
  );
};

export default CarSimulation;

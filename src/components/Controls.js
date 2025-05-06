import React from "react";

const Controls = ({
  learningRate,
  setLearningRate,
  gamma,
  setGamma,
  episodes,
  setEpisodes,
  isAiMode,
  setIsAiMode,
  startTraining,
  resetTraining,
  currentEpisode,
  totalReward,
  goalReached,
  isTraining,
}) => {
  return (
    <div className="controls">
      <h2>Reinforcement Learning Parameters</h2>

      <div className="parameter">
        <label>
          Learning Rate:
          <span>{learningRate.toFixed(3)}</span>
        </label>
        <input
          type="range"
          min="0.001"
          max="1"
          step="0.001"
          value={learningRate}
          onChange={(e) => setLearningRate(parseFloat(e.target.value))}
          disabled={isTraining}
        />
        <div className="parameter-description">
          How quickly the agent learns from new experiences.
        </div>
        <div className="parameter-effects">
          <strong>Higher values:</strong> Learn faster but may be unstable
          <br />
          <strong>Lower values:</strong> Learn more slowly but more consistently
        </div>
      </div>

      <div className="parameter">
        <label>
          Gamma (Discount Factor):
          <span>{gamma.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min="0.1"
          max="0.99"
          step="0.01"
          value={gamma}
          onChange={(e) => setGamma(parseFloat(e.target.value))}
          disabled={isTraining}
        />
        <div className="parameter-description">
          How much the agent values future rewards vs. immediate ones.
        </div>
        <div className="parameter-effects">
          <strong>Higher values:</strong> More focus on long-term goals
          <br />
          <strong>Lower values:</strong> More focus on immediate rewards
        </div>
      </div>

      <div className="parameter">
        <label>
          Episodes:
          <span>{episodes}</span>
        </label>
        <input
          type="number"
          min="1"
          max="1000"
          value={episodes}
          onChange={(e) => setEpisodes(parseInt(e.target.value))}
          disabled={isTraining}
        />
        <div className="parameter-description">
          Number of training runs to perform.
        </div>
        <div className="parameter-effects">
          <strong>Higher values:</strong> More thorough learning
          <br />
          <strong>Lower values:</strong> Faster training overall
        </div>
      </div>

      <div className="mode-switch">
        <label>
          <input
            type="checkbox"
            checked={isAiMode}
            onChange={(e) => setIsAiMode(e.target.checked)}
            disabled={isTraining}
          />
          AI Mode
        </label>
      </div>

      <div className="buttons">
        <button
          onClick={startTraining}
          disabled={!isAiMode || goalReached || isTraining}
          className={
            isAiMode && !goalReached && !isTraining
              ? "start-button"
              : "disabled-button"
          }
        >
          {isTraining ? "Training..." : "Start Training"}
        </button>
        <button onClick={resetTraining} className="reset-button">
          Reset
        </button>
      </div>

      <div className="stats">
        <p>
          Current Episode:
          <span>{currentEpisode}</span>
        </p>
        <p>
          Total Reward:
          <span>{totalReward.toFixed(2)}</span>
        </p>
        <p>
          Goal Status:
          <span className={goalReached ? "goal-reached" : "goal-not-reached"}>
            {goalReached ? "REACHED ✅" : "NOT REACHED ❌"}
          </span>
        </p>
        <p>
          Mode:
          <span
            className={
              isAiMode
                ? isTraining
                  ? "ai-training-mode"
                  : "ai-mode"
                : "manual-mode"
            }
          >
            {isAiMode
              ? isTraining
                ? "AI (TRAINING)"
                : "AI (READY)"
              : "MANUAL"}
          </span>
        </p>
      </div>

      <div className="instructions">
        <h3>Instructions:</h3>
        <p>
          <strong>Manual Mode:</strong> Use arrow keys or WASD to control the
          car
        </p>
        <p>
          <strong>AI Mode:</strong> Check the box above and click Start Training
        </p>
        <p>
          <strong>Goal:</strong> Reach the green glowing sphere!
        </p>
        <p>
          <strong>Parameters:</strong> Adjust to see how they affect learning
        </p>
      </div>

      <div className="parameter-insights">
        <h3>How Parameters Affect Learning:</h3>
        <p>
          <strong>Learning Rate (α):</strong> Controls how quickly the agent
          updates its knowledge. You'll see faster progress with higher values,
          but the car might "forget" good paths or make erratic movements. Lower
          values make learning more stable but slower.
        </p>
        <p>
          <strong>Gamma (γ):</strong> Determines how much the agent cares about
          future rewards. With higher values, the car focuses more on reaching
          the goal even if it takes longer. With lower values, it focuses on
          immediate rewards like avoiding walls.
        </p>
        <p>
          Try different combinations to see how they affect the learning
          process!
        </p>
      </div>
    </div>
  );
};

export default Controls;

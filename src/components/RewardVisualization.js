import React from "react";

const RewardVisualization = ({ rewardHistory }) => {
  if (!rewardHistory || rewardHistory.length === 0) {
    return (
      <div className="reward-visualization">
        <h3>Learning Progress</h3>
        <p>
          No reward data available yet. Start training to see the learning
          curve.
        </p>
      </div>
    );
  }

  const maxReward = Math.max(...rewardHistory);
  const minReward = Math.min(...rewardHistory);
  const range = Math.max(Math.abs(maxReward), Math.abs(minReward));

  const chartHeight = 150;
  const chartWidth =
    rewardHistory.length < 50 ? rewardHistory.length * 10 : 500;

  const getYPosition = (value) => {
    const normalized = (value + range) / (2 * range);
    return chartHeight - normalized * chartHeight;
  };

  const points = rewardHistory
    .map((reward, index) => {
      const x = (index / (rewardHistory.length - 1)) * chartWidth;
      const y = getYPosition(reward);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="reward-visualization">
      <h3>Learning Progress</h3>
      <div className="chart-container">
        <svg width={chartWidth} height={chartHeight}>
          <line
            x1="0"
            y1={getYPosition(0)}
            x2={chartWidth}
            y2={getYPosition(0)}
            stroke="#666"
            strokeDasharray="5,5"
          />

          <polyline
            points={points}
            fill="none"
            stroke="#4285f4"
            strokeWidth="2"
          />

          {rewardHistory.map((reward, index) => {
            const x = (index / (rewardHistory.length - 1)) * chartWidth;
            const y = getYPosition(reward);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={reward >= 0 ? "#4caf50" : "#f44336"}
              />
            );
          })}
        </svg>

        <div className="chart-labels">
          <div>Max: {maxReward.toFixed(2)}</div>
          <div>Min: {minReward.toFixed(2)}</div>
        </div>
      </div>
      <p className="reward-info">Episodes completed: {rewardHistory.length}</p>
    </div>
  );
};

export default RewardVisualization;

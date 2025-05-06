import React from "react";

const QTableVisualization = ({ qTable }) => {
  if (!qTable || Object.keys(qTable).length === 0) {
    return (
      <div className="q-table-visualization">
        <h3>Q-Table Visualization</h3>
        <p>No data available yet. Start training to see Q-values.</p>
      </div>
    );
  }

  const tableEntries = Object.entries(qTable);
  const sampleEntries = tableEntries.slice(
    0,
    Math.min(10, tableEntries.length)
  );

  const actionLabels = ["Accelerate", "Decelerate", "Turn Left", "Turn Right"];

  const getColorForValue = (value) => {
    const minValue = -10;
    const maxValue = 10;
    const normalizedValue = Math.max(
      0,
      Math.min(1, (value - minValue) / (maxValue - minValue))
    );

    const r = Math.round(255 * (1 - normalizedValue));
    const g = Math.round(255 * normalizedValue);
    const b = 0;

    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="q-table-visualization">
      <h3>Q-Table Visualization (Sample)</h3>
      <div className="q-table-container">
        <table className="q-table">
          <thead>
            <tr>
              <th>State</th>
              {actionLabels.map((label, i) => (
                <th key={i}>{label}</th>
              ))}
              <th>Best Action</th>
            </tr>
          </thead>
          <tbody>
            {sampleEntries.map(([state, values], i) => {
              const bestActionIndex = values.indexOf(Math.max(...values));

              return (
                <tr key={i}>
                  <td title={state} className="state-cell">
                    State {i + 1}
                  </td>
                  {values.map((value, j) => (
                    <td
                      key={j}
                      style={{
                        backgroundColor: getColorForValue(value),
                        color: value > 0 ? "black" : "white",
                      }}
                    >
                      {value.toFixed(2)}
                    </td>
                  ))}
                  <td>{actionLabels[bestActionIndex]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="q-table-info">
        Total states learned: {tableEntries.length}
      </p>
    </div>
  );
};

export default QTableVisualization;

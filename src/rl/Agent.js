class Agent {
  constructor(stateSize, actionSize, learningRate, gamma) {
    this.stateSize = stateSize;
    this.actionSize = actionSize;
    this.learningRate = learningRate;
    this.gamma = gamma;

    // Make exploration rate dependent on learning rate
    this.epsilon = 1.0;
    this.epsilonMin = 0.01;
    this.epsilonDecay = 0.995;

    this.qTable = {};
  }

  getQValue(state, action) {
    const stateKey = this.getStateKey(state);

    if (!this.qTable[stateKey]) {
      // Initialize with small random values
      this.qTable[stateKey] = Array(this.actionSize)
        .fill(0)
        .map(() => Math.random() * 0.1);
    }

    return this.qTable[stateKey][action];
  }

  getStateKey(state) {
    // Discretize the state to reduce state space
    const discretizationLevel = 5;
    const discreteState = state.sensors.map(
      (s) => Math.floor(s * discretizationLevel) / discretizationLevel
    );
    return JSON.stringify(discreteState);
  }

  getAction(state) {
    // Exploration vs exploitation based on epsilon
    if (Math.random() < this.epsilon) {
      return Math.floor(Math.random() * this.actionSize);
    }

    const stateKey = this.getStateKey(state);

    if (!this.qTable[stateKey]) {
      this.qTable[stateKey] = Array(this.actionSize)
        .fill(0)
        .map(() => Math.random() * 0.1);
    }

    // Find the best action
    const qValues = this.qTable[stateKey];
    let maxValue = qValues[0];
    let maxActions = [0];

    for (let i = 1; i < qValues.length; i++) {
      if (qValues[i] > maxValue) {
        maxValue = qValues[i];
        maxActions = [i];
      } else if (qValues[i] === maxValue) {
        maxActions.push(i);
      }
    }

    // Return a random action among the best actions
    return maxActions[Math.floor(Math.random() * maxActions.length)];
  }

  update(state, action, reward, nextState, done) {
    const stateKey = this.getStateKey(state);
    const nextStateKey = this.getStateKey(nextState);

    // Initialize Q-values if not present
    if (!this.qTable[stateKey]) {
      this.qTable[stateKey] = Array(this.actionSize)
        .fill(0)
        .map(() => Math.random() * 0.1);
    }

    if (!this.qTable[nextStateKey]) {
      this.qTable[nextStateKey] = Array(this.actionSize)
        .fill(0)
        .map(() => Math.random() * 0.1);
    }

    // Current Q-value
    const qCurrent = this.qTable[stateKey][action];

    // Calculate target Q-value using the Bellman equation
    let qTarget;
    if (done) {
      qTarget = reward;
    } else {
      const nextMaxQ = Math.max(...this.qTable[nextStateKey]);
      qTarget = reward + this.gamma * nextMaxQ;
    }

    // Update Q-value using the learning rate
    this.qTable[stateKey][action] =
      qCurrent + this.learningRate * (qTarget - qCurrent);

    // Decay epsilon for less exploration over time
    if (this.epsilon > this.epsilonMin) {
      this.epsilon *= this.epsilonDecay;
    }
  }

  setParameters(learningRate, gamma) {
    this.learningRate = learningRate;
    this.gamma = gamma;

    // Update epsilon decay based on learning rate
    this.epsilonDecay = 0.99 - 0.05 * learningRate;
  }
}

export default Agent;

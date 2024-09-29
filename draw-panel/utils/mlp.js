import { NeuralNetwork } from "../network/index.js";

export default class MLP {
  constructor(neuronCounts, classes) {
    this.neuronCounts = neuronCounts;
    this.classes = classes;
    this.network = new NeuralNetwork(neuronCounts);
  }
  // 预测此类为哪一类
  predict(point) {
    const output = NeuralNetwork.feedForward(point, this.network);
    const max = Math.max(...output);
    const index = output.indexOf(max);
    const label = this.classes[index];
    return { label };
  }

  fit(samples, tries = 1000) {
    let bestNetwork = this.network;
    let bestAccuracy = this.evaluate(samples);
    for (let i = 0; i < tries; i++) {
      this.network = new NeuralNetwork(this.neuronCounts);
      const accuracy = this.evaluate(samples);
      // 如果当前决策比之前决策好，则保留当前决策
      if (accuracy > bestAccuracy) {
        bestAccuracy = accuracy;
        bestNetwork = this.network;
      }
    }
    this.network = bestNetwork;
  }

  // 评估方法
  evaluate(samples) {
    let correctCount = 0;
    for (const sample of samples) {
      const { label } = this.predict(sample.point);
      const truth = sample.label;
      correctCount += truth == label ? 1 : 0;
    }
    const accuracy = correctCount / samples.length;
    return accuracy;
  }

  // 加载已有数据做训练
  load(mlp) {
    this.neuronCounts = mlp.neuronCounts;
    this.classes = mlp.classes;
    this.network = mlp.network;
  }
}

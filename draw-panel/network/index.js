import { lerp } from "../utils/index.js";

export class NeuralNetwork {
  constructor(neuronCounts) {
    this.levels = [];
    // 获取层级
    for (let i = 0; i < neuronCounts.length - 1; i++) {
      this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]));
    }
  }
  // 返回层级输出
  static feedForward(givenInputs, network) {
    let outputs = Level.feedForward(givenInputs, network.levels[0]);

    for (let i = 1; i < network.levels.length; i++) {
      outputs = Level.feedForward(outputs, network.levels[i]);
    }
    return outputs;
  }

  // 从最佳策略中，变更值
  static mutate(network, amount = 1) {
    network.levels.forEach((level) => {
      for (let i = 0; i < level.biases.length; i++) {
        level.biases[i] = lerp(level.biases[i], Math.random() * 2 - 1, amount);
      }
      for (let i = 0; i < level.weights.length; i++) {
        for (let j = 0; j < level.weights[i].length; j++) {
          level.weights[i][j] = lerp(
            level.weights[i][j],
            Math.random() * 2 - 1,
            amount
          );
        }
      }
    });
  }
}

export class Level {
  constructor(inputCount, outputConut) {
    this.inputs = new Array(inputCount);
    this.outputs = new Array(outputConut);
    // 偏差值，每个输出神经元都有一个偏差值
    // 高于该值它将触发这个输出
    this.biases = new Array(outputConut);

    // 权重值
    // 每一条输入，都对应很多条输出，每个输出都有对应的权重值
    this.weights = [];

    for (let i = 0; i < inputCount; i++) {
      this.weights[i] = new Array(outputConut);
    }

    Level.#randomize(this);
  }

  // 随机数据
  static #randomize(level) {
    for (let i = 0; i < level.inputs.length; i++) {
      for (let j = 0; j < level.outputs.length; j++) {
        level.weights[i][j] = Math.random() * 2 - 1;
      }
    }

    for (let i = 0; i < level.biases.length; i++) {
      level.biases[i] = Math.random() * 2 - 1;
    }
  }

  // 反馈
  static feedForward(givenInputs, level) {
    // console.log(level)
    for (let i = 0; i < level.inputs.length; i++) {
      level.inputs[i] = givenInputs[i];
    }
    for (let i = 0; i < level.outputs.length; i++) {
      let sum = 0;
      // 计算每一条线的积分，输入加权重
      for (let j = 0; j < level.inputs.length; j++) {
        sum += level.inputs[j] * level.weights[j][i];
      }

      // 判断，如果大于偏差值，则输出结果
      // if (sum > level.biases[i]) {
      //   level.outputs[i] = 1;
      // } else {
      //   level.outputs[i] = 0;
      // }
      level.outputs[i] = Math.tanh(sum + level.biases[i]);
    }

    return level.outputs;
  }
}

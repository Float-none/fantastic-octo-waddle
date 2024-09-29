import { getNearest } from "./index.js";

export default class KNN {
  constructor(samples, k = 10) {
    this.samples = samples;
    this.k = k;
  }
  // 获取目前最近的数据集
  predict(point) {
    const samplePoints = this.samples.map((s) => s.point);
    const indices = getNearest(point, samplePoints, this.k);
    const nearestSamples = indices.map((i) => this.samples[i]);
    const labels = nearestSamples.map((s) => s.label);
    const counts = {};
    // 给附近的值计算谁的种类最多
    for (const label of labels) {
      counts[label] = counts[label] ? counts[label] + 1 : 1;
    }
    const max = Math.max(...Object.values(counts));
    const label = labels.find((l) => counts[l] == max);
    return { label, nearestSamples };
  }
}

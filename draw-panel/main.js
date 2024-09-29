// 绘板
import SketchPad from "./sketch_pad/index.js";
// 图表
import Chart from "./chart/index.js";
// 绘制左边图片集
import { createRow, handleClick } from "./display/index.js";
// 数据
import { training } from "./generate_data/training.js";
import { testing } from "./generate_data/testing.js";
import { minMAX } from "./generate_data/minMax.js";
// 工具
import { groupBy, inUse, normalization, formatpercent } from "./utils/index.js";
// import KNN from "./utils/KNN.js";
import Classes from "./utils/classes.js";
// 混淆矩阵
import Confusion from "./confusion_matrix/index.js";
// 神经网络可视化
import Visualizer from "./network/visualizer.js";
import MLP from "./utils/mlp.js";

// import { model } from "./generate_data/model.js";
import { model } from "./python_generate_data/model.js";
// import { model } from "./other/model.js";
// console.log(model);
// 配置
const options = {
  size: 400,
  axesLabels: training.featureNames,
  styles: Classes,
  icon: "text",
  // icon: 'image',
  transparency: 0.7,
  event: handleClick,
  bg: new Image(),
  hideSamples: true,
};

// 数据集
const TestingSamples = testing.samples;
const TainingSamples = training.samples;

// 画板canvas
const sketchCanvas = document.getElementById("sketch-pad");
const showText = document.getElementById("show-text");
const undo = document.getElementById("undo");
const sketchPadFrame = document.getElementById("sketch-frame");
const openSketchPad = document.getElementById("open-sketch-pad");
// 左边图片展示集
const container = document.getElementById("container");
// 图表
const chartCanvas = document.getElementById("chart");
const chartInstance = new Chart(chartCanvas, TainingSamples, options);
// 混淆表格
const confusionContainer = document.getElementById("confusion-container");
const visualizerCanvas = document.getElementById("visualizer-canvas");
visualizerCanvas.width = 500;
visualizerCanvas.height = 500;
const visualizerCanvasCtx = visualizerCanvas.getContext("2d");

// 混淆矩阵
new Confusion(
  confusionContainer,
  TestingSamples,
  ["car", "fish", "house", "tree", "bicycle", "guitar", "pencil", "clock"],
  options
);

// 邻近计算法
// const knn = new KNN(TainingSamples, 50);
// 神经网络算法
const mlp = new MLP([], []);
mlp.load(model);
// 可视化神经网络计算
const outputLabels = Object.values(options.styles).map((s) => s.image);
Visualizer.drawNetwork(visualizerCanvasCtx, mlp.network, outputLabels);

// 画板
const sketchPad = new SketchPad(sketchCanvas, (paths) => {
  // const point = [getPathCount(paths), getPointCount(paths)];
  const functions = inUse.map((f) => f.function);
  // const point = functions.map((f) => f(paths));
  const point = functions[0](paths);

  normalization([point], minMAX);
  // const { label, nearestSamples } = knn.predict(point);
  // chartInstance.showDynamicPoint(point, label, nearestSamples);
  const { label } = mlp.predict(point);
  Visualizer.drawNetwork(visualizerCanvasCtx, mlp.network, outputLabels);
  showText.innerHTML = `Is it a ${label}?`;

  //
});

// 回退画板
undo.addEventListener("click", (e) => {
  sketchPad.undo();
});
// 打开
openSketchPad.addEventListener("click", function () {
  sketchPadFrame.style.display =
    sketchPadFrame.style.display === "block" ? "none" : "block";
});

let correctCount = 0;
let totalCount = 0;
// let testingSuccess = 0;
// 填入测试数据的真实值
for (const testSample of TestingSamples) {
  testSample.truth = testSample.label;
  // const { label, nearestSamples } = knn.predict(testSample.point);
  // testSample.nearestSamples = nearestSamples;
  const { label } = mlp.predict(testSample.point);
  testSample.correct = label == testSample.truth;
  testSample.label = testSample.correct ? label : "?";
  totalCount++;
  correctCount += testSample.correct ? 1 : 0;
}

// 绘制左边图片集
// const testingDataLength = testing.samples.length;

const groups = groupBy(TestingSamples, "student_id");
for (let student_id in groups) {
  const samples = groups[student_id];
  const studentName = samples[0].student_name;

  samples.forEach((node) => {
    // const { label, nearestSamples } = knn.predict(node.point);
    // node.nearestSamples = nearestSamples;
    const { label } = mlp.predict(node.point);
    if (label !== node.label) {
      node.label = "?";
      return;
    }
    // testingSuccess += 1;
  });
  createRow(container, studentName, samples, chartInstance);
}

// 绘制目前数据集验证情况
document.getElementById("show-data").innerHTML = `成功率：${formatpercent(
  correctCount / totalCount
)} ${correctCount}/${totalCount}`;

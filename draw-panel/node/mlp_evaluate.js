import { readFileSync, writeFileSync, existsSync } from "fs";
// import { createCanvas } from "canvas";

import constants from "./constants.js";
import MLP from "../utils/mlp.js";
// import Classes from "../utils/classes.js";
import {
  formatpercent,
  // printProgress
} from "../utils/index.js";

const Classes = [
  "car",
  "fish",
  "house",
  "tree",
  "bicycle",
  "guitar",
  "pencil",
  "clock",
];

console.log("运行决策分类 ...");

const { samples: trainingSamples } = JSON.parse(
  readFileSync(constants.TRAINING)
);
// console.log(trainingSamples[0].point.length);
const mlp = new MLP(
  [trainingSamples[0].point.length, 10, Classes.length],
  Classes
);

if (existsSync(constants.MODEL)) {
  mlp.load(JSON.parse(readFileSync(constants.MODEL)));
}

// 执行5000次
mlp.fit(trainingSamples, 5000);

writeFileSync(constants.MODEL, JSON.stringify(mlp));
writeFileSync(constants.MODEL_JS, `export const model = ${JSON.stringify(mlp)};`);

const { samples: testingSamples } = JSON.parse(readFileSync(constants.TESTING));

let totalCount = 0;
let correctCount = 0;

for (const sample of testingSamples) {
  const { label: predictedLabel } = mlp.predict(sample.point);
  let count = predictedLabel == sample.label ? 1 : 0;
  correctCount += count;
  totalCount++;
}

console.log(
  "准确率: " +
    correctCount +
    "/" +
    totalCount +
    " (" +
    formatpercent(correctCount / totalCount) +
    ")"
);

// console.log("开始生成决策边界图片 ...");

// const imgSize = 1000;
// const canvas = createCanvas(imgSize, imgSize);
// const ctx = canvas.getContext("2d");

// for (let x = 0; x < canvas.width; x++) {
//   for (let y = 0; y < canvas.height; y++) {
//     const point = [x / canvas.width, 1 - y / canvas.height];
//     while (point.length < trainingSamples[0].point.length) {
//       point.push(0);
//     }
//     const { label } = mlp.predict(point);
//     const color = Classes[label].color;
//     ctx.fillStyle = color;
//     ctx.fillRect(x, y, 1, 1);
//   }
//   printProgress(x + 1, canvas.width);
// }

// const buffer = canvas.toBuffer("image/png");
// writeFileSync(constants.DECISION_BOUNDARY, buffer);

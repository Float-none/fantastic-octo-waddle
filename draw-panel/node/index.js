import { createCanvas } from "canvas";
import process from "node:process";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import constants from "./constants.js";
// import { geometry } from "../geometry/index.js";
import {
  drawPath,
  formatpercent,
  getPixels,
  // drawText,
} from "../utils/index.js";

const canvas = createCanvas(400, 400);
const ctx = canvas.getContext("2d");
// 获取原始json数据
const fileNames = readdirSync(constants.RAW_DIR);

// 示例
const samples = [];
let id = 1;
// 遍历所有原始json数据，生成需要的数据
fileNames.forEach((fn, index) => {
  const content = readFileSync(constants.RAW_DIR + "/" + fn);
  let oneJSON = {};
  try {
    oneJSON = JSON.parse(content);
  } catch (e) {
    console.log(index, fn);
  }
  const { session, student, drawings } = oneJSON;
  if (!session) {
    return;
  }
  for (let label in drawings) {
    samples.push({
      id,
      label,
      student_name: student,
      student_id: session,
    });

    const paths = drawings[label];
    // 输出json数据
    writeFileSync(`${constants.JSON_DIR}/${id}.json`, JSON.stringify(paths));
    // 输出生成的图片
    generateImageFile(`${constants.IMG_DIR}/${id}.png`, paths);
    // 生成进度
    printProgress(id, fileNames.length * 8);
    id++;
  }
});

// 生成数据集
writeFileSync(constants.SAMPLES, JSON.stringify(samples));

// 生成js对象文件
writeFileSync(
  constants.JS_OBJECTS,
  `export const samples=${JSON.stringify(samples)};`
);

// 生成图片
function generateImageFile(outFile, paths) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // drawPath(ctx, paths);
  for (const path of paths) {
    drawPath(ctx, path);
  }

  // 计算边框
  // const { vertices, hull } = geometry.minimumBoundingBox({
  //   points: paths.flat(),
  // });
  // const roundness = geometry.roundness(hull);
  // const R = 255 - Math.floor(roundness * 255);
  // const B = 255 - Math.floor((1 - roundness) * 255);
  // const G = 255 - 0;
  // const color = `rgb(${R},${B},${G})`;
  // drawPath(ctx, [...vertices, vertices[0]], "red");
  // drawPath(ctx, [...hull, hull[0]], color, 10);
  // 计算多少个可见点
  const pixels = getPixels(paths);
  // const complexity = pixels.filter((a) => a != 0).length;

  const size = Math.sqrt(pixels.length);
  const imgData = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < pixels.length; i++) {
    const alpha = pixels[i];
    const startIndex = i * 4;
    imgData.data[startIndex] = 0;
    imgData.data[startIndex + 1] = 0;
    imgData.data[startIndex + 2] = 0;
    imgData.data[startIndex + 3] = alpha;
  }
  ctx.putImageData(imgData, 0, 0);

  // drawText(ctx, complexity, "blue");

  const buffer = canvas.toBuffer("image/png");
  writeFileSync(outFile, buffer);
}

// 生成进度条
function printProgress(count, max) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  const percent = formatpercent(count / max);
  process.stdout.write(`${count}/${max} (${percent})`);
}

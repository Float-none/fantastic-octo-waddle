import { readFileSync, writeFileSync } from "fs";
import constants from "./constants.js";
import process from "node:process";
import { inUse, normalization, toCSV, formatpercent } from "../utils/index.js";

const samples = JSON.parse(readFileSync(constants.SAMPLES));

const trainingAmount = samples.length * 0.5;
// 训练数据样本
const training = [];
// 测试数据样本
const testing = [];

for (let i = 0; i < samples.length; i++) {
  if (i < trainingAmount) {
    training.push(samples[i]);
  } else {
    testing.push(samples[i]);
  }
}

for (let i = 0; i < samples.length; i++) {
  const sample = samples[i];
  const paths = JSON.parse(
    readFileSync(constants.JSON_DIR + "/" + sample.id + ".json")
  );

  const functions = inUse.map((f) => f.function);
  // 常规学习 特征数据
  // sample.point = functions.map((f) => f(paths));
  // 深度学习 特征数据
  sample.point = Object.values(functions[0](paths));
  printProgress(i, samples.length - 1);
  // sample.point = [getPathCount(paths), getPointCount(paths)];
}

// 生成特征信息名称
// const featureNames = inUse.map((item) => item.name);
const featureNames = Array(samples[0].point.length).fill(" ");

console.log("开始生成文件");
// 最大最小值
const minMax = normalization(training.map((s) => s.point));

// 标准化
normalization(
  testing.map((s) => s.point),
  minMax
);

// 生成特征文件
writeFileSync(
  constants.FEATURES,
  JSON.stringify({
    featureNames,
    samples,
  })
);
writeFileSync(
  constants.FEATURES_JS,
  `export const features=${JSON.stringify({ featureNames, samples })};`
);

// 训练数据
writeFileSync(
  constants.TRAINING,
  JSON.stringify({
    featureNames,
    samples: training.map((s) => {
      return {
        point: s.point,
        label: s.label,
      };
    }),
  })
);
writeFileSync(
  constants.TRAINING_JS,
  `export const training=${JSON.stringify({
    featureNames,
    samples: training,
  })};`
);

writeFileSync(
  constants.TRAINING_CSV,
  toCSV(
    [...featureNames, "Label"],
    training.map((a) => [...a.point, a.label])
  )
);

// 测试数据
writeFileSync(
  constants.TESTING,
  JSON.stringify({
    featureNames,
    samples: testing.map((s) => {
      return {
        point: s.point,
        label: s.label,
      };
    }),
  })
);

writeFileSync(
  constants.TESTING_CSV,
  toCSV(
    [...featureNames, "Label"],
    testing.map((a) => [...a.point, a.label])
  )
);

writeFileSync(
  constants.TESTING_JS,
  `export const testing=${JSON.stringify({ featureNames, samples: testing })};`
);

// 最大最小值
writeFileSync(
  constants.MIN_MAX_JS,
  `export const minMAX=${JSON.stringify(minMax)};`
);

// 生成进度条
function printProgress(count, max) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  const percent = formatpercent(count / max);
  process.stdout.write(`${count}/${max} (${percent})`);
}

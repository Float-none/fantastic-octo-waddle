// 基础数据路径
const rawPath = "../raw_json";
// node生成数据路径
const datasetPath = "../generate_data";
// 路径设置
export default {
  RAW_DIR: rawPath,

  DATASET_DIR: datasetPath,
  // 存放生成的数据
  JSON_DIR: `${datasetPath}/json`,
  // 存放生成的图片路径
  IMG_DIR: `${datasetPath}/img`,
  // 数据集
  SAMPLES: `${datasetPath}/samples.json`,
  JS_OBJECTS: `${datasetPath}/samples.js`,
  TRAINING: `${datasetPath}/training.json`,
  TRAINING_JS: `${datasetPath}/training.js`,
  TESTING: `${datasetPath}/testing.json`,
  TESTING_JS: `${datasetPath}/testing.js`,
  // 特征集
  FEATURES: `${datasetPath}/features.json`,
  FEATURES_JS: `${datasetPath}/features.js`,
  MIN_MAX_JS: `${datasetPath}/minMax.js`,

  // 神经网络需要的特征值
  MODEL: `${datasetPath}/model.json`,
  MODEL_JS: `${datasetPath}/model.js`,

  // python训练需要的值
  TRAINING_CSV:`${datasetPath}/training.csv`,
  TESTING_CSV:`${datasetPath}/testing.csv`,

};

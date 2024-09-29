import { geometry } from "../geometry/index.js";
// import { createCanvas } from "canvas";

export function download(canvas, name) {
  const base64Img = convertCanvasToImage(canvas);
  var a = document.createElement("a"); // 生成一个a元素
  var event = new MouseEvent("click"); // 创建一个单击事件
  a.download = `${name}.png`; // 设置图片名称
  a.href = base64Img; // 将生成的URL设置为a.href属性
  a.dispatchEvent(event);
}

// 将canvas转换为图片
export function convertCanvasToImage(canvas) {
  // 首先将canvas转换为DataURL
  var image = new Image();
  image.src = canvas.toDataURL("image/png");
  return image;
}

// 生成csv数据
export function toCSV(headers, samples) {
  let str = headers.join(",") + "\n";
  for (const sample of samples) {
    str += sample.join(",") + "\n";
  }
  return str;
}

// 群
export function groupBy(objArray, key) {
  const groups = {};
  for (let obj of objArray) {
    const val = obj[key];
    if (groups[val] == null) {
      groups[val] = [];
    }
    groups[val].push(obj);
  }
  return groups;
}

// 获取路径点
export function getPathCount(paths) {
  return paths.length;
}

// 获取多少个点
export function getPointCount(paths) {
  const points = paths.flat();
  return points.length;
}

// 获取图片宽度
export function getWidth(paths) {
  const points = paths.flat();
  if (points.length <= 0) {
    return 0;
  }
  const x = points.map((p) => p[0]);
  const min = Math.min(...x);
  const max = Math.max(...x);
  return max - min;
}

// 获取图片高度
export function getHeight(paths) {
  const points = paths.flat();
  if (points.length <= 0) {
    return 0;
  }
  const y = points.map((p) => p[1]);
  const min = Math.min(...y);
  const max = Math.max(...y);
  return max - min;
}

// 获取伸长率
export function getElongation(paths) {
  const points = paths.flat();
  const { width, height } = geometry.minimumBoundingBox({ points });
  return (Math.max(width, height) + 1) / (Math.min(width, height) + 1);
}

// 获取曲率
export function getRoundness(paths) {
  const points = paths.flat();
  const { hull } = geometry.minimumBoundingBox({ points });
  return geometry.roundness(hull);
}

// 获取当前像素总数
export function getPixels(paths, size = 400, expand = true) {
  let canvas = null;

  try {
    // for web
    canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
  } catch (err) {
    // for node
    canvas = createCanvas(size, size);
  }

  const ctx = canvas.getContext("2d");

  if (expand) {
    const points = paths.flat();

    const bounds = {
      left: Math.min(...points.map((p) => p[0])),
      right: Math.max(...points.map((p) => p[0])),
      top: Math.min(...points.map((p) => p[1])),
      bottom: Math.max(...points.map((p) => p[1])),
    };

    const newPaths = [];
    for (const path of paths) {
      const newPoints = path.map((p) => [
        invLerp(bounds.left, bounds.right, p[0]) * size,
        invLerp(bounds.top, bounds.bottom, p[1]) * size,
      ]);
      newPaths.push(newPoints);
    }
    for (const path of newPaths) {
      drawPath(ctx, path);
    }
  } else {
    for (const path of paths) {
      drawPath(ctx, path);
    }
  }

  const imgData = ctx.getImageData(0, 0, size, size);
  return imgData.data.filter((val, index) => index % 4 == 3);
}
export function getComplexity(paths) {
  const pixels = getPixels(paths);
  return pixels.filter((a) => a != 0).length;
}

export function getAllPixels(paths) {
  return getPixels(paths, 20);
}
export const inUse = [
  {
    name: "Pixel Array",
    function: getAllPixels,
  },
  // {
  //   name: 'Path Count',
  //   function: getPathCount,
  // },
  // {
  //   name: 'Point Count',
  //   function: getPointCount,
  // },
  // {
  //   name: "Width",
  //   function: getWidth,
  // },
  // {
  //   name: "Height",
  //   function: getHeight,
  // },
  // {
  //   name: "Elongation",
  //   function: getElongation,
  // },
  // {
  //   name: "Roundness",
  //   function: getRoundness,
  // },
  // {
  //   name: "Complexity",
  //   function: getComplexity,
  // },
];

// 绘制路径
export function drawPath(ctx, path, color = "black", width = 3) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(...path);
  for (let i = 0; i < path.length; i++) {
    ctx.lineTo(...path[i]);
  }
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

// 绘制文本
export function drawText(ctx, text, color = "black", loc = [0, 0], size = 100) {
  ctx.font = "bold" + size + "px Courier";
  ctx.textBaseline = "top";
  ctx.fillStyle = color;
  ctx.fillText(text, ...loc);
}
// 常规化，将数据设定在0-1之间
// 避免数据过于倾向某一项特征
export function normalization(points, minMax) {
  let min, max;
  const dimensions = points[0].length;
  if (minMax) {
    min = minMax.min;
    max = minMax.max;
  } else {
    min = [...points[0]];
    max = [...points[0]];

    for (let i = 1; i < points.length; i++) {
      for (let j = 0; j < dimensions; j++) {
        min[j] = Math.min(min[j], points[i][j]);
        max[j] = Math.max(max[j], points[i][j]);
      }
    }
  }

  for (let i = 0; i < points.length; i++) {
    for (let j = 0; j < dimensions; j++) {
      points[i][j] = invLerp(min[j], max[j], points[i][j]);
    }
  }
  return { min, max };
}

// 获取最近数据集
export function getNearest(loc, points, k = 1) {
  // let minDist = Number.MAX_SAFE_INTEGER;
  // let nearestIndex = 0;

  // for (let i = 0; i < points.length; i++) {
  //   const point = points[i];
  //   const d = distance(loc, point);

  //   if (d < minDist) {
  //     minDist = d;
  //     nearestIndex = i;
  //   }
  // }
  // return nearestIndex;
  const obj = points.map((val, ind) => {
    return { ind, val };
  });

  const sorted = obj.sort((a, b) => {
    return distance(loc, a.val) - distance(loc, b.val);
  });
  const indices = sorted.map((obj) => obj.ind);
  return indices.slice(0, k);
}

// 获取remap的点位
export function remapPoint(oldBounds, newBounds, point) {
  return [
    remap(
      oldBounds.left,
      oldBounds.right,
      newBounds.left,
      newBounds.right,
      point[0]
    ),
    remap(
      oldBounds.top,
      oldBounds.bottom,
      newBounds.top,
      newBounds.bottom,
      point[1]
    ),
  ];
}

// 保留数字的几位小数点
export function formatNumber(n, dec = 0) {
  return n.toFixed(dec);
}

export function equals(p1, p2) {
  return p1[0] == p2[0] && p1[1] == p2[1];
}

export function add(p1, p2) {
  return [p1[0] + p2[0], p1[1] + p2[1]];
}

export function subtract(p1, p2) {
  return [p1[0] - p2[0], p1[1] - p2[1]];
}

export function scale(p, scaler) {
  return [p[0] * scaler, p[1] * scaler];
}

// 获取点与点之间的长度
export function distance(p1, p2) {
  // return Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2);
  let sqDist = 0;
  for (let i = 0; i < p1.length; i++) {
    sqDist += (p1[i] - p2[i]) ** 2;
  }
  return Math.sqrt(sqDist);
}

// 线性插值
// 用于给定的值之间进行插值
// t为间隔
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

// 寻找线性插值
export function invLerp(a, b, v) {
  return (v - a) / (b - a);
}

export function remap(oldA, oldB, newA, newB, v) {
  return lerp(newA, newB, invLerp(oldA, oldB, v));
}

// 生成进度条
export function formatpercent(n) {
  return (n * 100).toFixed(2) + "%";
}

// 获取颜色
export function getRGBA(value, maxAlpha = 0.8) {
  const alpha = Math.min(maxAlpha, Math.abs(value));
  const R = value < 0 ? 0 : 255;
  const G = R;
  const B = value > 0 ? 0 : 255;
  return "rgba(" + R + "," + G + "," + B + "," + alpha + ")";
}

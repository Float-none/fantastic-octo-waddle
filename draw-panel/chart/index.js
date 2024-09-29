import {
  remapPoint,
  formatNumber,
  add,
  subtract,
  scale,
  distance,
  getNearest,
  equals,
  lerp,
} from "../utils/index.js";
export default class Chart {
  constructor(canvas, data, options = {}) {
    this.canvas = canvas;
    this.canvas.width = options.size;
    this.canvas.height = options.size;
    this.icon = options.icon;
    this.#generateImages(options.styles);

    this.bg = options.bg;

    this.data = data;
    this.styles = options.styles;
    this.axesLabels = options.axesLabels;
    this.onClick = options.event;

    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;

    this.margin = options.size * 0.1;
    this.transparency = options.transparency || 1;

    this.hoveredSample = null;
    this.selectedSample = null;

    this.dataTrans = {
      offset: [0, 0],
      scale: 1,
    };

    this.dragInfo = {
      start: [0, 0],
      end: [0, 0],
      offset: [0, 0],
      dragging: false,
    };

    // 像素边界
    this.pixelBounds = this.#getPixelBounds();
    // 整个数据边界
    this.dataBounds = this.#getDataBounds();
    // 初始数据边框
    this.defaultDataBounds = this.#getDataBounds();

    this.dynamicPoint = null;
    this.nearestSamples = null;

    this.#draw();

    this.#addEventListeners();
  }

  #addEventListeners() {
    const { canvas, dataTrans, dragInfo } = this;
    canvas.onmousedown = (evt) => {
      const dataLoc = this.#getMouse(evt, true);
      dragInfo.start = dataLoc;
      dragInfo.dragging = true;
      dragInfo.end = [0, 0];
      dragInfo.offset = [0, 0];
    };
    canvas.onmousemove = (evt) => {
      if (dragInfo.dragging) {
        const dataLoc = this.#getMouse(evt, true);
        dragInfo.end = dataLoc;
        dragInfo.offset = scale(
          subtract(dragInfo.start, dragInfo.end),
          dataTrans.scale ** 2
        );
        const newOffset = add(dataTrans.offset, dragInfo.offset);
        this.#updateDataBounds(newOffset, dataTrans.scale);
      }
      const pLoc = this.#getMouse(evt);
      const pPoints = this.data.map((s) =>
        remapPoint(this.dataBounds, this.pixelBounds, s.point)
      );
      const index = getNearest(pLoc, pPoints);

      const nearest = this.data[index];
      const dist = distance(pPoints[index], pLoc);
      if (dist < this.margin / 2) {
        this.hoveredSample = nearest;
      } else {
        this.hoveredSample = null;
      }

      this.#draw();
    };

    canvas.onmouseup = () => {
      dataTrans.offset = add(dataTrans.offset, dragInfo.offset);
      dragInfo.dragging = false;
    };

    canvas.onwheel = (evt) => {
      const dir = Math.sign(evt.deltaY);
      const step = 0.02;
      dataTrans.scale += dir * step;
      dataTrans.scale = Math.max(step, Math.min(2, dataTrans.scale));

      this.#updateDataBounds(dataTrans.offset, dataTrans.scale);

      this.#draw();
      evt.preventDefault();
    };

    canvas.onclick = () => {
      if (!equals(dragInfo.offset, [0, 0])) {
        return;
      }
      if (this.hoveredSample) {
        if (this.selectedSample == this.hoveredSample) {
          this.selectedSample = null;
        } else {
          this.selectedSample = this.hoveredSample;
        }
      } else {
        this.selectedSample = null;
      }
      if (this.onClick) {
        this.onClick(this.selectedSample).bind(this);
      }
      this.#draw();
    };
  }

  #updateDataBounds(offset, scale) {
    const { dataBounds, defaultDataBounds: def } = this;
    dataBounds.left = def.left + offset[0];
    dataBounds.right = def.right + offset[0];
    dataBounds.top = def.top + offset[1];
    dataBounds.bottom = def.bottom + offset[1];

    const center = [
      (dataBounds.left + dataBounds.right) / 2,
      (dataBounds.top + dataBounds.bottom) / 2,
    ];

    dataBounds.left = lerp(center[0], dataBounds.left, scale ** 2);

    dataBounds.right = lerp(center[0], dataBounds.right, scale ** 2);

    dataBounds.top = lerp(center[1], dataBounds.top, scale ** 2);

    dataBounds.bottom = lerp(center[1], dataBounds.bottom, scale ** 2);
  }

  #getMouse = (evt, dataSpace = false) => {
    const rect = this.canvas.getBoundingClientRect();
    const pixelLoc = [evt.clientX - rect.left, evt.clientY - rect.top];
    if (dataSpace) {
      const dataLoc = remapPoint(
        this.pixelBounds,
        this.defaultDataBounds,
        pixelLoc
      );
      return dataLoc;
    }
    return pixelLoc;
  };

  #getPixelBounds() {
    const { canvas, margin } = this;
    const bounds = {
      left: margin,
      right: canvas.width - margin,
      top: margin,
      bottom: canvas.height - margin,
    };

    return bounds;
  }

  #getDataBounds() {
    const { data } = this;
    const x = data.map((s) => s.point[0]);
    const y = data.map((s) => s.point[1]);
    const minX = Math.min(...x);
    const maxX = Math.max(...x);
    const minY = Math.min(...y);
    const maxY = Math.max(...y);

    const deltaX = maxX - minX;
    const deltaY = maxY - minY;

    const maxDelta = Math.max(deltaX, deltaY);

    const bounds = {
      left: minX,
      right: maxX,
      // right: minX + maxDelta,
      top: maxY,
      // top: maxY + maxDelta,
      bottom: minY,
    };

    return bounds;
  }

  #displayData() {
    const { ctx, data, dataBounds, pixelBounds } = this;
    for (const node of data) {
      const { point, label } = node;
      const pixelLoc = remapPoint(dataBounds, pixelBounds, point);

      // this.#drawPoint(ctx, pixelLoc, this.styles[label]);
      switch (this.icon) {
        case "image":
          this.#drawImage(ctx, this.styles[label].image, pixelLoc);
          break;
        case "text":
          this.#drawText(ctx, {
            text: this.styles[label].text,
            loc: pixelLoc,
            size: 20,
          });
          break;
        default:
          this.#drawPoint(ctx, pixelLoc, this.styles[label].color);
          break;
      }
    }
  }

  // 绘制
  #draw() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = this.transparency;
    this.#displayData();
    ctx.globalAlpha = 1;

    // 绘制背景图
    // const topLeft = remapPoint(this.dataBounds, this.pixelBounds, [0, 1]);
    // const sz = (canvas.width - this.margin * 2) / this.dataTrans.scale ** 2;
    // ctx.drawImage(this.bg, ...topLeft, sz, sz);

    if (this.hoveredSample) {
      this.#emphasizeSample(this.hoveredSample);
    }

    if (this.selectedSample) {
      this.#emphasizeSample(this.selectedSample, "yellow");
    }

    if (this.dynamicPoint) {
      const { point, label } = this.dynamicPoint;
      const pixelLoc = remapPoint(this.dataBounds, this.pixelBounds, point);
      this.#drawPoint(ctx, pixelLoc, "rgba(255,255,255,0.7)", 10000000);
      // this.#drawPoint(ctx, pixelLoc, 'black');
      for (const sample of this.nearestSamples) {
        // console.log(this.nearestSamples)
        const point = remapPoint(
          this.dataBounds,
          this.pixelBounds,
          sample.point
        );
        ctx.beginPath();
        ctx.moveTo(...pixelLoc);
        ctx.lineTo(...point);
        ctx.stroke();
      }
      this.#drawImage(ctx, this.styles[label].image, pixelLoc);
    }

    this.#drawAxes();
  }

  selectSample(sample) {
    this.selectedSample = sample;
    this.#draw();
  }

  showDynamicPoint(point, label, nearestSamples) {
    this.dynamicPoint = { point, label };
    this.nearestSamples = nearestSamples;
    this.#draw();
  }

  // 数据填充
  #emphasizeSample(node, color = "white") {
    const pLoc = remapPoint(this.dataBounds, this.pixelBounds, node.point);
    const grd = this.ctx.createRadialGradient(...pLoc, 0, ...pLoc, this.margin);
    grd.addColorStop(0, color);
    grd.addColorStop(1, "rgba(255,255,255,0)");
    this.#drawPoint(this.ctx, pLoc, grd, this.margin * 2);
    this.#displayData([node]);
  }

  // 绘制点
  #drawPoint(ctx, loc, color = "black", size = 8) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(...loc, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 绘制坐标线
  #drawAxes() {
    const { ctx, canvas, axesLabels, margin } = this;
    const { left, right, top, bottom } = this.pixelBounds;

    ctx.clearRect(0, 0, this.canvas.width, margin);
    ctx.clearRect(0, 0, margin, this.canvas.height);
    ctx.clearRect(this.canvas.width - margin, 0, margin, this.canvas.height);
    ctx.clearRect(0, this.canvas.height - margin, this.canvas.width, margin);

    this.#drawText(ctx, {
      text: axesLabels[0],
      loc: [canvas.width / 2, bottom + margin / 2],
      size: margin * 0.6,
    });

    ctx.save();
    ctx.translate(left - margin / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);

    this.#drawText(ctx, {
      text: axesLabels[1],
      loc: [0, 0],
      size: margin * 0.6,
    });

    ctx.restore();

    // 绘制线
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, bottom);
    ctx.lineTo(right, bottom);
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "lightgray";
    ctx.stroke();
    ctx.setLineDash([]);

    const dataMin = remapPoint(this.pixelBounds, this.dataBounds, [
      left,
      bottom,
    ]);
    this.#drawText(ctx, {
      text: formatNumber(dataMin[0], 2),
      loc: [left, bottom],
      size: margin * 0.3,
      align: "left",
      vAlign: "top",
    });
    ctx.save();

    ctx.translate(left, bottom);
    ctx.rotate(-Math.PI / 2);
    this.#drawText(ctx, {
      text: formatNumber(dataMin[1], 2),
      loc: [0, 0],
      size: margin * 0.3,
      align: "left",
      vAlign: "bottom",
    });
    ctx.restore();

    const dataMax = remapPoint(this.pixelBounds, this.dataBounds, [right, top]);
    this.#drawText(ctx, {
      text: formatNumber(dataMax[0], 2),
      loc: [right, bottom],
      size: margin * 0.3,
      align: "right",
      vAlign: "top",
    });
    ctx.save();

    ctx.translate(left, top);
    ctx.rotate(-Math.PI / 2);
    this.#drawText(ctx, {
      text: formatNumber(dataMax[1], 2),
      loc: [0, 0],
      size: margin * 0.3,
      align: "right",
      vAlign: "bottom",
    });
    ctx.restore();
  }

  // 绘制文字
  #drawText(
    ctx,
    {
      text,
      loc,
      align = "center",
      vAlign = "middle",
      size = 10,
      color = "black",
    }
  ) {
    ctx.textAlign = align;
    ctx.textBaseline = vAlign;
    ctx.font = "bold " + size + "px Courier";
    ctx.fillStyle = color;
    ctx.fillText(text, ...loc);
  }

  // 绘制图片
  #drawImage(ctx, image, loc) {
    ctx.beginPath();
    ctx.drawImage(
      image,
      loc[0] - image.width / 2,
      loc[1] - image.height / 2,
      image.width,
      image.height
    );
    ctx.fill();
  }

  // 生成图片
  #generateImages(styles, size = 20) {
    for (let label in styles) {
      const style = styles[label];
      const canvas = document.createElement("canvas");
      canvas.width = size + 10;
      canvas.height = size + 10;

      const ctx = canvas.getContext("2d");
      ctx.beginPath();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = size + "px Courier";

      const colorHueMap = {
        red: 0,
        yellow: 60,
        green: 120,
        cyan: 180,
        blue: 240,
        magenta: 300,
      };
      const hue = -45 + colorHueMap[style.color];
      if (!isNaN(hue)) {
        ctx.filter = `
             brightness(2)
             contrast(0.3)
             sepia(1)
             brightness(0.7)
             hue-rotate(${hue}deg)
             saturate(3)
             contrast(3)
          `;
      } else {
        ctx.filter = "grayscale(1)";
      }

      ctx.fillText(style.text, canvas.width / 2, canvas.height / 2);

      style["image"] = new Image();
      style["image"].src = canvas.toDataURL();
    }
  }
}

export default class SketchPad {
  constructor(canvas, onUpdate = null, size = 400) {
    canvas.width = size;
    canvas.height = size;
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");

    this.paths = [];
    this.isDrawing = false;

    this.onUpdate = onUpdate;
    // 监听鼠标左键事件
    this.#addEventListeners();
  }
  #addEventListeners() {
    // 鼠标按下
    this.canvas.onmousedown = (evt) => {
      const mouse = [evt.offsetX, evt.offsetY];
      this.paths.push([mouse]);
      this.isDrawing = true;
    };
    // 鼠标移动
    this.canvas.onmousemove = (evt) => {
      if (this.isDrawing) {
        const mouse = [evt.offsetX, evt.offsetY];
        const lastPath = this.paths[this.paths.length - 1];
        lastPath.push(mouse);
        this.#refresh();
      }
    };
    // 鼠标弹出
    this.canvas.onmouseup = () => {
      this.isDrawing = false;
    };
  }

  // 刷新
  #refresh() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawPaths();

    if (this.onUpdate) {
      this.onUpdate(this.paths);
    }
  }

  // 回退
  undo() {
    if (this.paths.length <= 0) {
      return;
    }
    this.paths.pop();
    this.#refresh();
  }

  // 根据点，绘制路径
  #drawPath(path, color = "black") {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(...path);
    for (let i = 1; i < path.length; i++) {
      this.ctx.lineTo(...path[i]);
    }
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.stroke();
  }
  // 根据多个点集合，绘制路径
  drawPaths(data) {
    const paths = data || this.paths;
    for (const path of paths) {
      this.#drawPath(path);
    }
  }

  // #getMouse(evt) {
  //   const rect = this.canvas.getBoundingClientRect();
  //   const mouse = [
  //     Math.round(evt.clientX - rect.left),
  //     Math.round(evt.clientY - rect.top),
  //   ];
  //   return mouse;
  // }
}

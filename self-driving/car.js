import Controls from './controls.js';
import { NeuralNetwork } from './network.js';
import Sensor from './sensor.js';

import { polysIntersect } from './utils.js';

export default class Car {
  // eslint-disable-next-line max-params
  constructor(x, y, width, height, controlsType, maxSpeed = 3, color = 'blue') {
    console.log(x, y);
    this.x = x;
    this.y = y;

    // 速度
    this.speed = 0;
    // 最大速度
    this.maxSpeed = maxSpeed;
    // 加速度
    this.acceleration = 0.2;
    // 摩擦力
    this.friction = 0.05;
    // 角度
    this.angle = 0;
    // 是否被撞到
    this.damaged = false;

    this.img = new Image();
    this.img.src = './ren.png';
    if (controlsType !== 'DUMMY') {
      this.img.src = './car.png';
    }
    this.useBrain = controlsType === 'AI';

    this.width = width;
    this.height = height;

    // 获取键盘事件
    this.controls = new Controls(controlsType);

    if (controlsType !== 'DUMMY') {
      this.sensor = new Sensor(this);
      this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
    }

    this.center = { x: this.width / 2, y: this.height / 2 };

    this.mask = document.createElement('canvas');
    this.mask.width = width;
    this.mask.height = height;

    const maskCtx = this.mask.getContext('2d');

    this.img.onload = () => {
      maskCtx.fillStyle = color;
      maskCtx.rect(0, 0, this.width, this.height);
      maskCtx.fill();

      maskCtx.globalCompositeOperation = 'destination-atop';
      maskCtx.drawImage(this.img, 0, 0, this.width, this.height);
    };
  }

  update(roadBorders, traffic) {
    if (!this.damaged) {
      this.#move();
      this.polygon = this.#createPolygon();
      this.damaged = this.#assessDamage(roadBorders, traffic);
    }
    if (this.sensor) {
      this.sensor.update(roadBorders, traffic);

      const offsets = this.sensor.readings.map((s) =>
        s === null ? 0 : 1 - s.offset,
      );

      const outputs = NeuralNetwork.feedForward(offsets, this.brain);
      // console.log(outputs);
      if (this.useBrain) {
        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
      }
    }
  }

  #assessDamage(roadBorders, traffic) {
    for (let i = 0; i < roadBorders.length; i++) {
      if (polysIntersect(this.polygon, roadBorders[i])) {
        return true;
      }
    }
    for (let i = 0; i < traffic.length; i++) {
      if (polysIntersect(this.polygon, traffic[i].polygon)) {
        return true;
      }
    }
    return false;
  }

  #createPolygon() {
    const points = [];
    const rad = Math.hypot(this.width, this.height) / 2;
    const angle = Math.atan2(this.width, this.height);

    points.push({
      x: this.x - Math.sin(this.angle - angle) * rad,
      y: this.y - Math.cos(this.angle - angle) * rad,
    });

    points.push({
      x: this.x - Math.sin(this.angle + angle) * rad,
      y: this.y - Math.cos(this.angle + angle) * rad,
    });

    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - angle) * rad,
      y: this.y - Math.cos(Math.PI + this.angle - angle) * rad,
    });

    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + angle) * rad,
      y: this.y - Math.cos(Math.PI + this.angle + angle) * rad,
    });

    return points;
  }

  #move() {
    // 向前加速度
    if (this.controls.forward) {
      this.speed += this.acceleration;
    }
    // 向后减速度
    if (this.controls.reverse) {
      this.speed -= this.acceleration;
    }
    // 限制最大速度
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
    // 限制倒退最小速度
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }
    // 速度减去摩擦力
    if (this.speed > 0) {
      this.speed -= this.friction;
    }

    if (this.speed < 0) {
      this.speed += this.friction;
    }
    // 如果速度小于摩擦力，直接速度等于0
    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }
    // 翻转转向
    if (this.speed !== 0) {
      const flip = this.speed > 0 ? 1 : -1;
      if (this.controls.left) {
        this.angle += 0.03 * flip;
      }
      if (this.controls.right) {
        this.angle -= 0.03 * flip;
      }
    }

    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
  }

  draw(ctx, color = 'black', drwaSensor = false) {
    // ctx.restore();
    if (this.sensor && drwaSensor) {
      this.sensor.draw(ctx);
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(-this.angle);
    // if (this.damaged) {
    //   ctx.fillStyle = 'gray';
    // } else {
    //   ctx.fillStyle = color;
    // }
    // ctx.beginPath();
    // ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
    // ctx.fill();
    if (this.damaged && this.controls !== 'DUMMY') {
      this.img.src = 'ren1-1.png';
      // setTimeout(() => {
      //   window.location.reload();
      // }, 3000);
    }

    if (!this.damaged) {
      ctx.drawImage(
        this.mask,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height,
      );

      // if (this.controlsType === 'DUMMY') {
      //   ctx.globalCompositeOperation = 'multiply';
      // }
    }

    // for (let i = 1; i < this.polygon.length; i++) {
    //   ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
    // }
    // ctx.rect(-this.center.x, -this.center.y, this.width, this.height);
    ctx.drawImage(
      this.img,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
    );
    ctx.restore();
  }
}

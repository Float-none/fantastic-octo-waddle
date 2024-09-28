import Car from './car.js';
import Road from './road.js';
import Visualizer from './visualizer.js';
import { NeuralNetwork } from './network.js';
import { getRangeRandom } from './utils.js';

const canvas = document.getElementById('gameCanvas');
canvas.height = window.innerHeight;
canvas.width = 250;
const ctx = canvas.getContext('2d');

// 展示点
const viewCanvas = document.getElementById('viewCanvas');
viewCanvas.width = 400;
viewCanvas.height = window.innerHeight;
const viewCtx = viewCanvas.getContext('2d');

const road = new Road(canvas.width / 2, canvas.width * 0.8);
// const car = new Car(road.getLaneCenter(1), canvas.height / 2, 30, 50, 'AI', 3);
// 生成学习汽车车辆
const cars = generateCars(200);

// 路障车
const traffic = [
  new Car(road.getLaneCenter(1), -100, 30, 50, 'DUMMY', 2),
  new Car(road.getLaneCenter(0), -300, 30, 50, 'DUMMY', 2),
  new Car(road.getLaneCenter(2), -300, 30, 50, 'DUMMY', 2),
  new Car(road.getLaneCenter(0), -500, 30, 50, 'DUMMY', 2),
  new Car(road.getLaneCenter(1), -500, 30, 50, 'DUMMY', 2),
  new Car(road.getLaneCenter(1), -700, 30, 50, 'DUMMY', 2),
  new Car(road.getLaneCenter(2), -700, 30, 50, 'DUMMY', 2),
];

let bestCar = cars[0];
const bestBrain = localStorage.getItem('bestBrain');
if (bestBrain) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem('bestBrain'));
    if (i !== 0) {
      NeuralNetwork.mutate(cars[i].brain, 0.2);
    }
  }
}

// setInterval(() => {
//   const num = getRangeRandom(0,2);
//   const y = getRangeRandom(-700,-500);
//   traffic.push(new Car(road.getLaneCenter(num), y, 30, 50, 'DUMMY', 2));
// }, getRangeRandom(5000,10000));

function addTraffic() {
  const num = getRangeRandom(0, 2);
  const y = getRangeRandom(-700, -500) + bestCar.y;
  traffic.push(new Car(road.getLaneCenter(num), y, 30, 50, 'DUMMY', 2));

  setTimeout(addTraffic, getRangeRandom(5000, 10000));
}

addTraffic();

// car.draw(ctx);
// console.table(car.brain);

display();

function display(time) {
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []);
    // traffic[i].draw(ctx);
  }

  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic);
  }
  // 启发算法
  // 寻找最先突破路障的车
  bestCar = cars.find((car) => car.y === Math.min(...cars.map((c) => c.y)));

  // ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.height = window.innerHeight;
  viewCanvas.height = window.innerHeight;

  ctx.save();
  ctx.translate(0, -bestCar.y + canvas.height * 0.5);

  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(ctx);
  }

  road.draw(ctx);
  // car.draw(ctx);
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(ctx);
  }
  ctx.globalAlpha = 1;
  bestCar.draw(ctx, 'blue', true);

  ctx.restore();

  viewCtx.lineDashOffset = -time / 50;
  Visualizer.drawNetwork(viewCtx, bestCar.brain);
  // 移除抽出屏幕的车子

  // if (traffic.length > 0) {
  //   console.log(traffic)
  //   traffic = traffic.filter((car) => car.y > (bestCar.y - 1000));
  // }

  requestAnimationFrame(display);
}

function generateCars(N) {
  const cars = [];
  for (let i = 1; i <= N; i++) {
    cars.push(
      new Car(road.getLaneCenter(1), canvas.height / 2, 30, 50, 'AI', 5),
      // new Car(road.getLaneCenter(1), canvas.height / 2, 30, 50, 'KEYS', 5),
    );
  }
  return cars;
}

// 存储最佳策略
document.getElementById('save').onclick = function () {
  localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain));
};

// 存储最佳策略
document.getElementById('discard').onclick = function () {
  localStorage.removeItem('bestBrain');
};

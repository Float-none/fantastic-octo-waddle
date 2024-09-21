import Draw from "./Draw.js";

const app = new PIXI.Application({
  background: "#ededed",
  width: 940,
  height: 800,
});

// 创建正方形图形对象
const target = new PIXI.Graphics();
target.lineStyle(2, 0xff0000); // 设置线条样式，线宽为2，颜色为红色
target.drawRect(0, 0, 133, 133); // 绘制正方形的线框，起点坐标为(50, 50)，宽度和高度为100

const stageCell = new Draw();

// 将画布添加到页面里
document.getElementById("canvas-ele").appendChild(app.view);

app.stage.addChild(stageCell, target);

const $score = document.getElementById("score");
const $cost = document.getElementById("cost");

const $e1 = document.getElementById("e1");
const $e2 = document.getElementById("e2");
const $e3 = document.getElementById("e3");
const $e4 = document.getElementById("e4");
const $e5 = document.getElementById("e5");
const $e6 = document.getElementById("e6");
const $e7 = document.getElementById("e7");
const $e8 = document.getElementById("e8");

const container = [$e1, $e2, $e3, $e4, $e5, $e6, $e7, $e8];

const $exec = document.getElementById("exec");
const $handleExecBtn = document.getElementById("handleExecBtn");

// console.log(stageCell);

function getCellBond() {
  const index = Math.floor(Math.random() * 22);
  const OneCell = stageCell.children[index];
  const curCellCost = container[OneCell.type];
  //   console.log(OneCell.type, curCellCost);
  target.x = OneCell.x;
  target.y = OneCell.y;

  return OneCell.getCurrnetBound(curCellCost.value);
}

$handleExecBtn.addEventListener("click", function () {
  const number = $exec.value;
  if (number <= 0) {
    return;
  }

  const e1Value = $e1.value || 0;
  const e2Value = $e2.value || 0;
  const e3Value = $e3.value || 0;
  const e4Value = $e4.value || 0;
  const e5Value = $e5.value || 0;
  const e6Value = $e6.value || 0;
  const e7Value = $e7.value || 0;
  const e8Value = $e8.value || 0;

  let costValue = $cost.textContent || 0;
  let score = $score.textContent || 0;

  for (let i = 0; i < number; i++) {
    // 开销
    costValue =
      Number(costValue) +
      Number(e1Value) +
      Number(e2Value) +
      Number(e3Value) +
      Number(e4Value) +
      Number(e5Value) +
      Number(e6Value) +
      Number(e7Value) +
      Number(e8Value);
    // 获得
    score = Number(score) + getCellBond();
  }

  $cost.innerHTML = costValue;
  $score.innerHTML = score;
});

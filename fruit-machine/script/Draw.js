import Cell from "./Cell.js";
import RectangleMsg from "./RectangleMsg.js";

export default class Draw extends PIXI.Container {
  cellContainer = [];
  constructor() {
    super();
    // 位置信息
    const position = new RectangleMsg().contaienr;

    // 生产信息
    position.forEach((item, index) => {
      const msg = this.getCell(index);
      if (!msg) {
        return;
      }
      const CellBody = new Cell(msg.name, msg.bonds, msg.index);
      CellBody.x = item[0];
      CellBody.y = item[1];
      this.addChild(CellBody);
    });

    // console.log(new RectangleMsg().contaienr);
  }
  getCell(index) {
    // 布局信息
    const obj = {
      0: {
        name: "orange.png",
        bonds: 10,
        index: 6,
      },
      1: {
        name: "lemon.png",
        bonds: 10,
        index: 5,
      },
      2: {
        name: "small-BAR.png",
        bonds: 50,
        index: 0,
      },
      3: {
        name: "BAR.png",
        bonds: 100,
        index: 0,
      },
      4: {
        name: "sherry.png",
        bonds: 5,
        index: 7,
      },
      5: {
        name: "small-pawpaw.png",
        bonds: 3,
        index: 3,
      },
      6: {
        name: "pawpaw.png",
        bonds: 15,
        index: 3,
      },
      7: {
        name: "banana.png",
        bonds: 10,
        index: 4,
      },
      8: {
        name: "small-banana.png",
        bonds: 2,
        index: 4,
      },
      9: {
        name: "sherry.png",
        bonds: 5,
        index: 7,
      },
      10: {
        name: "small-orange.png",
        bonds: 2,
        index: 6,
      },
      11: {
        name: "orange.png",
        bonds: 10,
        index: 6,
      },
      12: {
        name: "lemon.png",
        bonds: 10,
        index: 5,
      },
      13: {
        name: "small-77.png",
        bonds: 4,
        index: 1,
      },
      14: {
        name: "77.png",
        bonds: 20,
        index: 1,
      },
      15: {
        name: "sherry.png",
        bonds: 5,
        index: 7,
      },
      16: {
        name: "small-banana.png",
        bonds: 2,
        index: 4,
      },
      17: {
        name: "banana.png",
        bonds: 10,
        index: 4,
      },
      18: {
        name: "watermelon.png",
        bonds: 20,
        index: 2,
      },
      19: {
        name: "small-watermelon.png",
        bonds: 4,
        index: 2,
      },
      20: {
        name: "sherry.png",
        bonds: 5,
        index: 7,
      },
      21: {
        name: "pawpaw.png",
        bonds: 15,
        index: 3,
      },
      //   22: {
      //     name: "small-pawpaw.png",
      //     bonds: 2,
      //   },
      //   23: {
      //     name: "orange.png",
      //     bonds: 10,
      //   },
    };
    return obj[index];
  }
}

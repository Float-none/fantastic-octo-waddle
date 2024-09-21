export default class RectangleMsg {
  contaienr = [];
  constructor() {
    // 初始位置
    let initX = 0;
    let initY = 0;

    const cellWidth = 133;
    const cellHeight = 133;

    const numberX = 6;
    const numberY = 5;
    let xArrow = 0;
    let yArrow = 0;
    // 防止出现死循环
    // 递增到100，则打断
    let i = 0;

    while (true) {
      // 当回到初始位置后，中断
      const x = xArrow * cellWidth;
      const y = yArrow * cellHeight;
      this.contaienr.push([x, y]);
      i++;
      if (xArrow < numberX && yArrow === initY) {
        // 从左向右排列 x轴
        xArrow++;
      } else if (xArrow === numberX && yArrow < numberY) {
        // 从上到下 y轴
        yArrow++;
      } else if (xArrow <= numberX && xArrow > initX && yArrow === numberY) {
        // 从右到左 x轴
        xArrow--;
      } else if (xArrow === initX && yArrow <= numberY) {
        // 从下到上 y轴
        yArrow--;
      }

      if ((xArrow === 0 && yArrow === 0) || i === 100) {
        break;
      }
    }
  }
}

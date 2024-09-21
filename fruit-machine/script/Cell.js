export default class Cell extends PIXI.TilingSprite {
  imagePath = "./images/";
  type = "normal";
  state = 0;
  people = 0;
  cell = null;
  bonds = 2;
  constructor(imageName, bonds, type) {
    super();
    if (imageName === "") {
      console.error("图片名称为空");
      return;
    }
    if (bonds) {
      this.bonds = bonds;
    }
    this.type = type;
    this.width = 133;
    this.height = 133;

    this.texture = PIXI.Texture.from(`${this.imagePath}${imageName}`);
  }
  getCurrnetBound(number) {
    return this.bonds * number;
  }
}

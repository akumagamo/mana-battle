import { Container } from "../Models";
import { INVALID_STATE } from "../errors";
import { Item, Modifier } from "../Item/Model";
export class ItemDetailWindowScene extends Phaser.Scene {
  x = 100;
  y = 100;
  colWidth = 100;
  rowHeight = 30;
  container: Container | null = null;
  selectecItemDetailsContainer: Container | null = null;

  constructor(public allowReplace = true) {
    super("ItemDetailWindowScene");
  }

  create() {}

  clearChildren() {
    this.container?.destroy();
  }

  render(itemId: string, unitId: string, onItemSelect: () => void) {
    this.clearChildren();

    this.container = this.add.container(this.x, this.y);

    this.renderBgLayer(this.container);

    this.renderPanel(0, 0, 300, 300, this.container);

    // const item = api.getItemFromDB(itemId);

    // if (!item) throw new Error(INVALID_STATE);

    // this.itemIcon(100, 50, item, 60, this.container);

    // this.write(100, 10, item.name, this.container);

    // this.itemStats(item, 10, 120, this.container);


    // if (this.allowReplace)
    //   this.btn(150, 250, "Replace", () =>
    //     this.replaceItemList(item, unitId, onItemSelect)
    //   );

  }

  renderBgLayer(container: Container) {
    let rect = new Phaser.Geom.Rectangle(this.x * -1, this.y * -1, 1280, 520);
    let graphics = this.add.graphics({ fillStyle: { color: 0x000000 } });
    graphics.alpha = 0.3;
    graphics.fillRectShape(rect);

    container.add(graphics);

    //this.itemDetail?.container?.add(graphics);

    graphics.setInteractive(rect, Phaser.Geom.Rectangle.Contains);
    graphics.on("pointerdown", () => {
      this.clearChildren();
      graphics.destroy();
    });
  }

  renderPanel(
    x: number,
    y: number,
    width: number,
    height: number,
    parent: Container | null
  ) {
    var rect = new Phaser.Geom.Rectangle(x, y, width, height);
    var graphics = this.add.graphics({
      fillStyle: { color: 0xdeaa87 },
      lineStyle: {
        width: 2,
        color: 0x000000,
      },
    });

    graphics.strokeRectShape(rect);

    graphics.fillRectShape(rect);
    graphics.strokeRect(x, y, width, height);

    if (parent) parent.add(graphics);
    else this.container?.add(graphics);
  }

  replaceItemList(
    itemToReplace: Item,
    unitId: string,
    onItemSelect: () => void
  ) {
    // const otherItems = api
    //   .getItemList()
    //   .filter(
    //     (item) =>
    //       item.slot === itemToReplace.slot && item.id !== itemToReplace.id
    //   );

    // const baseX = 350;
    // const baseY = 0;
    // const rowHeight = 100;

    // this.renderPanel(baseX, baseY, 300, 400, this.container);

    // otherItems.forEach((item, index) => {
    //   if (!this.container) throw new Error(INVALID_STATE);

    //   const rowX = baseX + 10;
    //   const rowY = rowHeight * index + 10;

    //   const bg = this.makeBackground(baseX, baseY);

    //   bg.x = rowX;
    //   bg.y = rowY;

    //   var rect = new Phaser.Geom.Rectangle(0, 0, 300, 80);
    //   bg.setInteractive(rect, Phaser.Geom.Rectangle.Contains);

    //   bg.on("pointerdown", () => {
    //     this.selectedItemDetails(item, unitId, baseX, baseY, onItemSelect);
    //   });

    //   this.container.add(bg);

    //   this.itemIcon(rowX, rowY, item, 50, this.container);

    //   this.write(baseX + 100, 50 + rowY, item.name, this.container);
    // });
  }

  itemIcon(
    x: number,
    y: number,
    item: Item,
    size: number,
    parent: Container | null
  ) {
    const padding = 10;
    this.renderPanel(x, y, size + padding * 2, size + padding * 2, parent);
    const icon = this.add.image(
      x + size / 2 + padding,
      y + size / 2 + padding,
      item.id
    );
    icon.displayWidth = size;
    icon.displayHeight = size;
    parent?.add(icon);
  }

  selectedItemDetails(
    item: Item,
    unitId: string,
    x: number,
    y: number,
    onItemSelect: () => void
  ) {
    this.selectecItemDetailsContainer?.destroy();
    this.selectecItemDetailsContainer = this.add.container(0, 0);

    this.container?.add(this.selectecItemDetailsContainer);

    this.renderPanel(x + 350, y, 300, 300, this.selectecItemDetailsContainer);

    this.write(x + 370, y + 20, item.name, this.selectecItemDetailsContainer);

    this.itemIcon(x + 450, y + 50, item, 60, this.selectecItemDetailsContainer);

    this.itemStats(item, x + 370, y + 130, this.selectecItemDetailsContainer);

    this.btn(x + 400, y + 250, "Equip", () => {
      console.log(item);
      // api.equipItem(item.id, unitId);
      // this.clearChildren();
      // onItemSelect();
    });
  }

  makeBackground(baseX: number, baseY: number) {
    var rect = new Phaser.Geom.Rectangle(-10, baseY + -10, 300, 80);
    var graphics = this.add.graphics({
      fillStyle: { color: 0x0000ff },
    });

    graphics.alpha = 0.2;

    graphics.fillRectShape(rect);
    return graphics;
  }

  btn(x: number, y: number, text: string, onClick: () => void) {
    const text_ = this.add.text(x, y, text, { color: "#000" });
    const btn = this.add.image(x - 15, y - 10, "panel");
    btn.setOrigin(0, 0);
    this.container?.add(btn);
    this.container?.add(text_);
    btn.setInteractive();
    btn.displayWidth = text_.width + 30;
    btn.displayHeight = text_.height + 20;
    btn.on("pointerdown", () => {
      onClick();
    });
  }

  write = (
    x: number,
    y: number,
    str: string | number,
    parent: Container | null
  ) => {
    const text = this.add.text(
      x,
      y,
      typeof str === "number" ? str.toString() : str,
      {
        color: "#000",
      }
    );

    if (parent) parent.add(text);
    else this.container?.add(text);
  };

  col = (x: number, y: number, strs: (string | number)[]) =>
    strs.forEach((str, index) =>
      this.write(x, y + this.rowHeight * index, str, null)
    );

  itemStats(
    item: Item,
    baseX: number,
    baseY: number,
    parent: Container | null
  ) {
    (Object.keys(item.modifiers) as Modifier[])
      .filter((key) => {
        const value = item.modifiers[key];
        return value && value !== 0;
      })
      .forEach((key, index) => {
        const value = item.modifiers[key];

        this.write(baseX, baseY + this.rowHeight * index, key, parent);
        this.write(
          baseX + 200,
          baseY + this.rowHeight * index,
          value.toString(),
          parent
        );
      });
  }
}

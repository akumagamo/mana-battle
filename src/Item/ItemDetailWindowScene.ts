import * as Phaser from 'phaser';
import {preload} from '../preload';
import * as api from '../DB';
import {Text, Image, Container} from '../Models';
import {INVALID_STATE} from '../errors';
import {ItemSlot, Item, Modifier} from '../Item/Model';
export class ItemDetailWindowScene extends Phaser.Scene {
  x = 200;
  y = 200;
  colWidth = 100;
  rowHeight = 30;
  container: Container | null = null;

  constructor() {
    super('ItemDetailWindowScene');
  }

  preload = preload;

  create() {}

  clearChildren() {
    this.container?.destroy();
    this.container = this.add.container(this.x, this.y);
  }

  render(itemId: string, unitId:string, onItemSelect:()=>void) {
    this.clearChildren();

    this.renderPanel(0, 0, 300, 300);

    const item = api.getItem(itemId);

    if (!item) throw new Error(INVALID_STATE);

    this.write(10, 10, item.name);

    this.itemStats(item, 10, 100);

    this.btn(300, 0, 30, 30, 'X', () => this.clearChildren());

    this.btn(150, 250, 100, 50, 'Replace', () => this.replaceItem(item,unitId, onItemSelect));

    //this.renderItemDetails();
  }


  renderPanel(x: number, y: number, width: number, height: number) {
    const panel = this.add.image(x, y, 'panel');
    panel.setOrigin(0, 0);
    panel.displayWidth = width;
    panel.displayHeight = height;

    this.container?.add(panel);
  }

  replaceItem(itemToReplace: Item, unitId:string, onItemSelect:()=>void) {
    const otherItems = api
      .getItemList()
      .filter(
        (item) =>
          item.slot === itemToReplace.slot && item.id !== itemToReplace.id,
      );

    const baseX = 350;
    const baseY = -150
    const rowHeight = 100;

    this.renderPanel(baseX, baseY, 300, 400);

    otherItems.forEach((item, index) => {
      const row = rowHeight * index;

      const bg = this.makeBackground(baseX, baseY);

      bg.x = baseX;
      bg.y = row;

      bg.setInteractive();

      var rect = new Phaser.Geom.Rectangle(0, baseY, 300, 80);
      bg.setInteractive(rect, Phaser.Geom.Rectangle.Contains);

      bg.on('pointerdown', () =>{

        this.renderPanel(baseX+350,baseY, 300, 300 )

        this.itemStats(item, baseX+ 370,  baseY + 30)

        this.btn(baseX + 400, baseY + 250, 100, 50, 'Equip', ()=>{

          api.equipItem(item.id, unitId)
          this.clearChildren();
          onItemSelect();
          console.log(`replaced with`, item)})

      });

      this.container?.add(bg);

      const icon = this.add.image(baseX + 50,baseY + 50 + row, item.id);
      icon.displayWidth = 80;
      icon.displayHeight = 80;
      this.container?.add(icon);

      this.write(baseX + 100, baseY + 50 + row, item.name);
    });
  }

  makeBackground(baseX:number, baseY:number) {
    var rect = new Phaser.Geom.Rectangle(-10,baseY + -10, 300, 80);
    var graphics = this.add.graphics({
      fillStyle: {color: 0x0000ff},
    });

    graphics.alpha = 0.2;

    graphics.fillRectShape(rect);
    return graphics;
  }

  btn(
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    onClick: () => void,
  ) {
    const btn = this.add.image(x, y, 'panel');
    const text_ = this.add.text(x, y, text, {color: '#000'});
    this.container?.add(btn);
    this.container?.add(text_);
    btn.setInteractive();
    btn.displayWidth = width;
    btn.displayHeight = height;
    btn.on('pointerdown', () => {
      onClick();
    });
  }

  write = (x: number, y: number, str: string | number) =>
    this.container?.add(
      this.add.text(x, y, typeof str === 'number' ? str.toString() : str, {
        color: '#000',
      }),
    );

  col = (x: number, y: number, strs: (string | number)[]) =>
    strs.forEach((str, index) =>
      this.write(x, y + this.rowHeight * index, str),
    );

  itemStats(item: Item, baseX:number, baseY:number) {

    (Object.keys(item.modifiers) as Modifier[])
      .filter((key) => {
        const value = item.modifiers[key];
        return value && value !== 0;
      })
      .forEach((key, index) => {
        const value = item.modifiers[key];

        this.write(baseX, baseY + this.rowHeight * index, key);
        this.write(
          baseX + 200,
          baseY + this.rowHeight * index,
          value.toString(),
        );
      });
  }
}

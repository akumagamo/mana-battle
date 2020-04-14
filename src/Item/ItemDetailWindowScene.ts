import * as Phaser from 'phaser';
import {preload} from '../preload';
import * as api from '../DB';
import {Text, Image, Container} from '../Models';
import {INVALID_STATE} from '../errors';
import {ItemSlot, Item, Modifier} from '../Item/Model';
export class ItemDetailWindowScene extends Phaser.Scene {
  x = 200
  y = 200
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

  render(itemId: string) {
    this.container = this.add.container(this.x, this.y);

    const panel = this.add.image(0, 0, 'panel');

    this.container.add(panel);

    panel.setOrigin(0, 0);
    panel.displayWidth = 300;
    panel.displayHeight = 300;

    const item = api.getItem(itemId);

    if (!item) throw new Error(INVALID_STATE);

    this.write(10, 10, item.name)

    this.itemStats(item);

    this.btn(300,0, 30,30,'X', ()=>this.clearChildren())

    this.btn(150,250, 100, 50, 'Replace', ()=>this.clearChildren())

    //this.renderItemDetails();
  }

  btn(x:number, y:number, width:number, height:number, text:string,onClick:()=>void){

    const btn = this.add.image(x,y, 'panel')
    const text_ = this.add.text(x,y, text, {color:"#000"})
    this.container?.add(btn)
    this.container?.add(text_)
    btn.setInteractive();
    btn.displayWidth = width;
    btn.displayHeight = height;
    btn.on('pointerdown', ()=>{

      onClick();

    })

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

  itemStats(item: Item) {

    const baseX = 10;
    const baseY = 100;

    (Object.keys(item.modifiers) as Modifier[]).filter(key=>{

      const value = item.modifiers[key]
      return value && value !== 0

    }).forEach((key, index)=>{

      const value = item.modifiers[key]

      this.write(baseX, baseY + this.rowHeight * index, key);
      this.write(baseX + 200, baseY + this.rowHeight * index, value.toString());

    })

  }
  
}

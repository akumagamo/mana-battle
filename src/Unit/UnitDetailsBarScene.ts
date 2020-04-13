import * as Phaser from 'phaser';
import {preload} from '../preload';
import * as api from '../DB';
import {Text, Image, Container} from '../Models';
import {Chara} from '../Chara/Chara';
import {Unit} from './Model';
import {INVALID_STATE} from '../errors';
import {ItemSlot} from '../Item/Model';

export class UnitDetailsBarScene extends Phaser.Scene {
  colWidth = 100;
  rowHeight = 30;
  chara: Chara | null = null;
  selectedSlot: ItemSlot | null = null;
  container: Container | null = null;

  constructor() {
    super('EditUnitScene');
  }

  preload = preload;

  create() {}

  clearChildren() {
    this.container?.destroy();
    this.container = this.add.container(0, 0);
  }

  render(unitId: string) {
    this.container = this.add.container(10, 520);

    const panel = this.add.image(0, 0, 'panel');

    this.container.add(panel);

    panel.setOrigin(0, 0);
    panel.displayWidth = 1260;
    panel.displayHeight = 180;

    const unit = api.getUnit(unitId);

    if (!unit) throw new Error(INVALID_STATE);

    //const chara = new Chara('edit-chara', this, unit, 200, 200, 1, true);
    //this.scene.add('edit-chara', chara, true);
    //this.chara = chara;

    this.unitStats(unit);
    this.unitItems(unit);
    //this.renderItemDetails();
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

  unitStats(unit: Unit) {
    const {str, agi, int, wis, vit, dex} = unit;

    const baseX = 10;
    const baseY = 10;

    this.write(baseX, baseY, unit.name);

    this.col(baseX + this.colWidth, baseY, ['STR', 'AGI', 'INT']);
    this.col(baseX + this.colWidth * 2, baseY, [str, agi, int]);

    this.col(baseX + this.colWidth * 3, baseY, ['WIS', 'VIT', 'DEX']);
    this.col(baseX + this.colWidth * 4, baseY, [wis, vit, dex]);
  }

  unitItems(unit: Unit) {
    const baseX = 600;
    const baseY = 50;
    const iconSize = 64;
    const padding = 10;
    const margin = 5;
    const textWidth = 200
    const boxSize = iconSize + padding + margin

    const item = (x: number, y: number, slotId: ItemSlot) => {
      const slot = api.getItem(unit.equips[slotId]);
      if (!slot) throw new Error(INVALID_STATE);
      const bg = this.add.image(x, y, 'panel');

      bg.displayWidth = iconSize + padding;
      bg.displayHeight = iconSize + padding;

      this.container?.add(bg);

      const icon = this.add.image(x, y, slot.id);
      icon.displayWidth = iconSize;
      icon.displayHeight = iconSize;
      icon.setInteractive();
      icon.on('pointerdown', () => {
        console.log(`clicked1!!`, slotId);
        this.selectedSlot = slotId;
        //this.renderItemDetails()
      });

      const itemName = this.add.text(x + iconSize/2 + margin + padding, y,  slot.name)
      this.container?.add(itemName)

      this.container?.add(icon);
    };

    item(baseX, baseY, 'mainHand');
    item(baseX, baseY + boxSize, 'offHand');
    item(baseX + boxSize + textWidth, baseY, 'chest');
    item(baseX + boxSize + textWidth, baseY + boxSize, 'ornament');
  }
}

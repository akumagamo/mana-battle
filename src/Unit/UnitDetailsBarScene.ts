import * as Phaser from 'phaser';
import * as api from '../DB';
import {Container} from '../Models';
import {Chara} from '../Chara/Chara';
import {Unit, unitClassLabels} from './Model';
import {INVALID_STATE} from '../errors';
import {ItemSlot} from '../Item/Model';
import {ItemDetailWindowScene} from '../Item/ItemDetailWindowScene';
import text from '../UI/text';
import {getClassSkills, getUnitAttacks} from './Skills';
import button from '../UI/button';

export class UnitDetailsBarScene extends Phaser.Scene {
  colWidth = 150;
  rowHeight = 40;
  chara: Chara | null = null;
  container: Container | null = null;
  itemDetail: ItemDetailWindowScene | null = null;
  onHatToggle: ((u:Unit)=>void) | null = null

  constructor() {
    super('UnitDetailsBarScene');
  }

  create() {
    this.itemDetail = new ItemDetailWindowScene();
    this.scene.add('item-detail', this.itemDetail, true);
  }

  destroy(parentScene: Phaser.Scene) {
    this.container?.destroy();
    parentScene.scene.remove('ItemDetailWindowScene');
    parentScene.scene.remove('UnitDetailsBarScene');
  }

  clearChildren() {
    this.container?.destroy();
    this.container = this.add.container(10, 480);
  }

  renderBgLayer() {}

  render(unitId: string) {
    this.clearChildren();

    const panel = this.add.image(0, 0, 'panel');

    this.container?.add(panel);

    panel.setOrigin(0, 0);
    panel.displayWidth = 1260;
    panel.displayHeight = 220;

    const unit = api.getUnit(unitId);

    if (!unit) throw new Error(INVALID_STATE);

    //const chara = new Chara('edit-chara', this, unit, 200, 200, 1, true);
    //this.scene.add('edit-chara', chara, true);
    //this.chara = chara;

    this.unitStats(unit);
    this.unitItems(unit);
    this.unitControls(unit);
    //this.renderItemDetails();
  }

  write = (x: number, y: number, str: string | number) =>
    this.container ? text(x, y, str, this.container, this) : null;

  col = (x: number, y: number, strs: (string | number)[]) =>
    strs.forEach((str, index) =>
      this.write(x, y + this.rowHeight * index, str),
    );

  row = (x: number, y: number, strs: (string | number)[]) =>
    strs.forEach((str, index) => this.write(x + this.colWidth * index, y, str));

  unitStats(unit: Unit) {
    const {str, int, dex, lvl, exp, currentHp, hp} = unit;

    const baseX = 20;
    const baseY = 20;

    this.row(baseX, baseY, [
      unit.name,
      unitClassLabels[unit.class],
      `Lvl ${lvl}`,
      `Exp ${exp}`,
      '',
      '',
      '',
      `${currentHp} / ${hp} HP`,
    ]);

    this.scene.remove('pic');
    const pic = new Chara(
      'pic',
      this,
      unit,
      baseX + 80,
      baseY + 130,
      1.3,
      true,
      false,
      true,
    );

    this.container?.add(pic.container);

    this.col(baseX + this.colWidth + 20, baseY + this.rowHeight + 20, [
      `STR ${str}`,
      `DEX ${dex}`,
      `INT ${int}`,
    ]);

    let attacks = getUnitAttacks(unit);

    let front = attacks.front(unit);
    let middle = attacks.middle(unit);
    let back = attacks.back(unit);

    this.col(baseX + this.colWidth * 2 + 20, baseY + this.rowHeight + 20, [
      `Front  - ${front.name} - ${front.damage}x${front.times}`,
      `Middle - ${middle.name} - ${middle.damage}x${middle.times}`,
      `Back   - ${back.name} - ${back.damage}x${back.times}`,
    ]);
  }

  unitItems(unit: Unit) {
    const baseX = 700;
    const baseY = 90;
    const iconSize = 64;
    const padding = 10;
    const margin = 5;
    const textWidth = 200;
    const boxSize = iconSize + padding + margin;

    const item = (x: number, y: number, slotId: ItemSlot) => {
      const itemId = unit.equips[slotId];
      const slot = itemId !== 'none' ? api.getItem(itemId) : null;

      const bg = this.add.image(x, y, 'panel');

      bg.displayWidth = iconSize + padding;
      bg.displayHeight = iconSize + padding;

      this.container?.add(bg);

      // TODO: implement adding a item to an empty slot
      if (slot) {
        const icon = this.add.image(x, y, slot.id);
        icon.displayWidth = iconSize;
        icon.displayHeight = iconSize;
        icon.setInteractive();
        icon.on('pointerdown', () => {
          this.itemDetail?.render(slot.id, unit.id, () => this.render(unit.id));
          //this.renderItemDetails()
        });

        this.container?.add(icon);

        if (this.container)
          text(
            x + iconSize / 2 + margin + padding,
            y,
            slot.name,
            this.container,
            this,
          );
      }
    };

    item(baseX, baseY, 'mainHand');
    item(baseX, baseY + boxSize, 'offHand');
    item(baseX + boxSize + textWidth, baseY, 'chest');
    item(baseX + boxSize + textWidth, baseY + boxSize, 'ornament');
  }

  unitControls(unit: Unit) {
    if (this.container)
      button(600, 20, 'Toggle Hat', this.container, this, () => {

        api.saveUnit({...unit, style: {... unit.style, displayHat: !unit.style.displayHat} })

        if(this.onHatToggle)
          this.onHatToggle(unit);

      });
  }

}

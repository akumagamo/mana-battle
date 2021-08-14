import { Container } from "../Models"
import { Unit } from "./Model"
import { ItemSlot } from "../Item/Model"
import { ItemDetailWindowScene } from "../Item/ItemDetailWindowScene"
import text from "../UI/text"
import button from "../UI/button"
import panel from "../UI/panel"
import { Chara } from "../Chara/Model"
import createChara from "../Chara/createChara"
import { JOBS } from "./Jobs/Jobs"
import { getUnitAttacks } from "./Skills/Skills"

export class UnitDetailsBarScene extends Phaser.Scene {
    colWidth = 150
    rowHeight = 40
    chara: Chara | null = null
    container: Container | null = null
    itemDetail: ItemDetailWindowScene | null = null
    onHatToggle: ((u: Unit) => void) | null = null

    constructor(public showToggleHat = false, public allowReplaceItems = true) {
        super("UnitDetailsBarScene")
    }

    create() {
        this.itemDetail = new ItemDetailWindowScene(this.allowReplaceItems)
        this.scene.add("item-detail", this.itemDetail, true)
    }

    destroy(parentScene: Phaser.Scene) {
        this.container?.destroy()
        parentScene.scene.remove("ItemDetailWindowScene")
        parentScene.scene.remove("UnitDetailsBarScene")
    }

    clearChildren() {
        this.container?.destroy()
        this.container = this.add.container(10, 480)
    }

    renderBgLayer() {}

    render(unit: Unit) {
        if (!this.container) return
        this.clearChildren()

        panel(0, 0, 1200, 220, this.container, this)

        this.unitStats(unit)
        this.unitItems(unit)
    }

    write = (x: number, y: number, str: string | number) =>
        this.container ? text(x, y, str, this.container, this) : null

    col = (x: number, y: number, strs: (string | number)[]) =>
        strs.forEach((str, index) =>
            this.write(x, y + this.rowHeight * index, str)
        )

    row = (x: number, y: number, strs: (string | number)[]) =>
        strs.forEach((str, index) =>
            this.write(x + this.colWidth * index, y, str)
        )

    unitStats(unit: Unit) {
        const { str, int, dex, lvl, exp, currentHp, hp } = unit

        const baseX = 20
        const baseY = 20

        this.row(baseX, baseY, [
            unit.name,
            JOBS[unit.job].name,
            `Lvl ${lvl}`,
            `Exp ${exp}`,
            "",
            "",
            "",
            `${currentHp} / ${hp} HP`,
        ])

        this.scene.remove("pic")
        const pic = createChara({
            scene: this,
            unit,
            x: baseX + 80,
            y: baseY + 130,
            scale: 1.3,
        })

        this.container?.add(pic.container)

        this.col(baseX + this.colWidth + 20, baseY + this.rowHeight + 20, [
            `STR ${str}`,
            `DEX ${dex}`,
            `INT ${int}`,
        ])

        const attacks = getUnitAttacks(unit.job)

        let front = attacks.front
        let middle = attacks.middle
        let back = attacks.back

        this.col(baseX + this.colWidth * 2 + 20, baseY + this.rowHeight + 20, [
            `Front  - ${front.skill.name} - ${front.skill.formula(unit)} x ${
                front.times
            }`,
            `Middle - ${middle.skill.name} - ${middle.skill.formula(unit)} x ${
                middle.times
            }`,
            `Back   - ${back.skill.name} - ${back.skill.formula(unit)} x ${
                back.times
            }`,
        ])
    }

    unitItems(unit: Unit) {
        const baseX = 700
        const baseY = 90
        const iconSize = 64
        const padding = 10
        const margin = 5
        const textWidth = 200
        const boxSize = iconSize + padding + margin

        const item = (x: number, y: number, slotId: ItemSlot) => {
            //const itemId = unit.equips[slotId];
            //const slot = itemId !== "none" ? api.getItemFromDB(itemId) : null;
            //const bg = this.add.image(x, y, "panel");
            //bg.displayWidth = iconSize + padding;
            //bg.displayHeight = iconSize + padding;
            //this.container?.add(bg);
            //// TODO: implement adding a item to an empty slot
            //if (slot) {
            //  const icon = this.add.image(x, y, slot.id);
            //  icon.displayWidth = iconSize;
            //  icon.displayHeight = iconSize;
            //  icon.setInteractive();
            //  icon.on("pointerdown", () => {
            //    this.itemDetail?.render(slot.id, unit.id, () => this.render(unit));
            //    //this.renderItemDetails()
            //  });
            //  this.container?.add(icon);
            //  if (this.container)
            //    text(
            //      x + iconSize / 2 + margin + padding,
            //      y,
            //      slot.name,
            //      this.container,
            //      this
            //    );
            // }
        }

        // item(baseX, baseY, "mainHand");
        // item(baseX, baseY + boxSize, "offHand");
        // item(baseX + boxSize + textWidth, baseY, "chest");
        // item(baseX + boxSize + textWidth, baseY + boxSize, "ornament");
    }
}

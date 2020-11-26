import * as Phaser from "phaser";
import { Chara } from "../Chara/Chara";
import { cartesianToIsometricBattle } from "../utils/isometric";
import { INVALID_STATE } from "../errors";
import { Unit } from "../Unit/Model";
import { Command, runCombat } from "../API/Combat/turns";
import plains from "../Backgrounds/plains";
import { Container } from "../Models";
import fireball from "../Chara/animations/spells/fireball";
import castSpell from "../Chara/animations/castSpell";
import { Squad } from "../Squad/Model";
import { Vector } from "../API/Map/Model";
import { Map } from "immutable";
import { invertBoardPosition } from "../API/Combat/utils";

const COMBAT_CHARA_SCALE = 1;
const WALK_DURATION = 500;
const WALK_FRAMES = 60;

const getBoardCoords = (isTopSquad: boolean) => ({ x, y }: Vector) => {
  return {
    x: isTopSquad ? x : invertBoardPosition(x),
    y: isTopSquad ? y : invertBoardPosition(y),
  };
};

export default class CombatScene extends Phaser.Scene {
  charas: Chara[] = [];
  top = "";
  bottom = "";
  conflictId = "";
  currentTurn = 0;
  container: Container | null = null;
  onCombatFinish: (<CMD>(cmd: CMD[]) => void) | null = null;

  constructor() {
    super("CombatScene");
  }

  updateUnit(unit: Unit) {
    this.charas = this.charas.map((u) => {
      if (u.unit.id === unit.id) {
        u.unit = unit;
      }

      return u;
    });
  }

  // LIFECYCLE METHODS
  create(data: {
    top: string;
    bottom: string;
    conflictId: string;
    squads: Map<string, Squad>;
    units: Map<string, Unit>;
    onCombatFinish: <CMD>(cmd: CMD[]) => void;
  }) {
    if (this.container) this.container.destroy();

    this.onCombatFinish = data.onCombatFinish;

    this.sound.stopAll();
    const music = this.sound.add("combat1");
    music.play();
    this.container = this.add.container(0, 0);

    plains(this, this.container);

    this.top = data.top;
    this.bottom = data.bottom;
    this.conflictId = data.conflictId;
    const combatants = [data.top, data.bottom];

    combatants.forEach((id) => {
      const squad = data.squads.find((s) => s.id === id);

      if (!squad) throw new Error(INVALID_STATE);

      const isTopSquad = id === data.top;
      const getCoords = getBoardCoords(data.top === squad.id);

      Object.values(squad.members)
        .sort((a, b) => getCoords(a).x - getCoords(b).x)
        .forEach((member) => {
          const unit = data.units.find((u) => u.id === member.id);
          if (!unit) throw new Error(INVALID_STATE);

          if (unit.currentHp < 1) return;

          if (!unit.squad) return;

          const { x, y } = cartesianToIsometricBattle(
            isTopSquad,
            isTopSquad ? unit.squad.x : invertBoardPosition(unit.squad.x),
            isTopSquad ? unit.squad.y : invertBoardPosition(unit.squad.y)
          );

          const chara = new Chara(
            `combat-chara-${member.id}`,
            this,
            unit,
            x,
            y,
            COMBAT_CHARA_SCALE,
            isTopSquad
          );

          this.charas.push(chara);
        });
    });

    setTimeout(() => {
      this.turn();
    }, 1000);
  }

  turnOff() {
    this.onCombatFinish = null;
    this.removeChildren();
    this.container?.destroy();
    this.scene.stop();
  }
  removeChildren() {
    this.charas.forEach((chara) => {
      chara.container.destroy();
      this.scene.remove(chara);
    });
    this.charas = [];
  }

  // COMBAT FLOW METHODS

  turn() {
    const commands = runCombat(this.charas.map((u) => u.unit));
    this.execute(commands);
  }

  execute(commands: Command[]) {
    const cmd = commands[0];

    console.log(`CombatScene CMDs:`, cmd);

    const next = (arr: Command[]) => {
      return arr.filter((_, i) => i > 0);
    };

    const step = () => {
      const next_ = next(commands);

      if (next_.length === 0) console.log(`finish!`);
      else this.execute(next_);
    };

    if (cmd.type === "MOVE") {
      this.moveUnit(cmd.source, cmd.target).then(step);
    } else if (cmd.type === "SLASH") {
      this.slash(cmd.source, cmd.target, cmd.damage, cmd.updatedTarget).then(
        step
      );
    } else if (cmd.type === "SHOOT") {
      this.bowAttack(
        cmd.source,
        cmd.target,
        cmd.damage,
        cmd.updatedTarget
      ).then(step);
    } else if (cmd.type === "FIREBALL") {
      this.castFireball(
        cmd.source,
        cmd.target,
        cmd.damage,
        cmd.updatedTarget
      ).then(step);
    } else if (cmd.type === "RETURN") {
      this.returnToPosition(cmd.target).then(step);
    } else if (cmd.type === "END_TURN") {
      this.currentTurn = this.currentTurn + 1;
      this.turn();
    } else if (cmd.type === "RESTART_TURNS") {
      this.currentTurn = 0;
      this.turn();
    } else if (cmd.type === "END_COMBAT") {
      this.retreatUnits().then((updatedUnits: Unit[]) => {
        const units = updatedUnits.map((unit) => ({
          type: "UPDATE_UNIT",
          unit: { ...unit, exp: unit.exp + 40 },
        }));
        //this.scene.start('MapScene', [...units, ]);

        if (this.onCombatFinish) {
          console.log(`onCombatFinish END_COMBAT`);
          this.onCombatFinish([{ type: "END_UNIT_TURN" }].concat(units));
        }

        this.turnOff();
      });
    } else if (cmd.type === "VICTORY") {
      console.log("Winning Team:", cmd.target);

      console.log(`onCombatFinish VICTORY`);

      if (this.onCombatFinish) {
        this.onCombatFinish(
          this.charas
            .map((chara) => chara.unit)
            .map((unit) => ({ type: "UPDATE_UNIT", unit }))
        );
      }

      this.turnOff();
    } else console.error(`Unknown command:`, cmd);
  }

  // UNIT METHODS

  getChara(id: string) {
    const chara = this.charas.find((u) => u.unit.id === id);
    if (!chara || !chara.container) throw new Error(INVALID_STATE);
    return chara;
  }

  moveUnit(sourceId: string, targetId: string) {
    const unit = this.getChara(sourceId);
    const target = this.getChara(targetId);

    unit.clearAnimations();
    unit.run();

    if (!target.unit.squad) throw new Error(INVALID_STATE);

    const targetIsTop = this.top === target.unit.squad.id;

    if (!target.container) throw new Error(INVALID_STATE);

    const pos = target.unit.squad;

    const { x, y } = cartesianToIsometricBattle(
      targetIsTop,
      targetIsTop ? pos.x + 1 : invertBoardPosition(pos.x) - 1,
      targetIsTop ? pos.y : invertBoardPosition(pos.y)
    );

    const config = (onComplete: () => void) => ({
      targets: unit.container,
      x: x,
      y: y,
      duration: WALK_DURATION,
      onComplete: () => {
        onComplete();
      },
    });

    // z-sorting for moving character
    const timeEvents = {
      delay: WALK_DURATION / WALK_FRAMES,
      callback: () => {
        // reordering a list of 10 scenes takes about 0.013ms
        this.charas
          .sort((a, b) =>
            a.container && b.container ? a.container.y - b.container.y : 0
          )
          .forEach((unit) => this.scene.bringToTop(unit.key));
      },
      repeat: WALK_FRAMES,
    };

    return new Promise((resolve: () => void) => {
      this.time.addEvent(timeEvents);
      this.tweens.add(config(resolve));
    });
  }

  retreatUnits() {
    this.charas.forEach((chara) => {
      chara.clearAnimations();
      chara.run();

      if (!chara.unit.squad) throw new Error(INVALID_STATE);

      const charaIsTop = this.top === chara.unit.squad.id;

      const getTargetPos = () => {
        if (!chara.container) throw new Error(INVALID_STATE);
        if (charaIsTop) {
          return { x: chara.container.x - 200, y: chara.container.y - 200 };
        } else
          return { x: chara.container.x + 200, y: chara.container.y + 200 };
      };

      const { x, y } = getTargetPos();

      const config = {
        targets: chara.container,
        x,
        y,
        duration: 1000,
      };

      this.tweens.add(config);
    });

    return new Promise((resolve: (u: Unit[]) => void) => {
      const timeEvents = {
        delay: 1000,
        callback: () => resolve(this.charas.map((u) => u.unit)),
      };

      this.time.addEvent(timeEvents);
    });
  }

  slash(
    sourceId: string,
    targetId: string,
    damage: number,
    updatedTarget: Unit
  ) {
    this.updateUnit(updatedTarget);

    const source = this.getChara(sourceId);
    const target = this.getChara(targetId);

    return new Promise((resolve: () => void) => {
      source.slash(resolve);
      target.flinch(damage, updatedTarget.currentHp === 0);
    });
  }

  bowAttack(
    sourceId: string,
    targetId: string,
    damage: number,
    updatedTarget: Unit
  ) {
    this.updateUnit(updatedTarget);

    const source = this.getChara(sourceId);
    const target = this.getChara(targetId);

    const arrow = this.add.image(
      source.container?.x,
      source.container?.y,
      "arrow"
    );

    arrow.rotation = 0.5;

    if (!source.front) arrow.scaleX = -1;

    return new Promise((resolve: () => void) => {
      source.performBowAttack(resolve);
      this.add.tween({
        targets: arrow,
        x: target.container?.x,
        y: target.container?.y,
        duration: 250,
        onComplete: () => {
          arrow.destroy();

          target.flinch(damage, updatedTarget.currentHp === 0);
        },
      });
    });
  }
  castFireball(
    sourceId: string,
    targetId: string,
    damage: number,
    updatedTarget: Unit
  ) {
    this.updateUnit(updatedTarget);

    const source = this.getChara(sourceId);
    const target = this.getChara(targetId);

    const fb = fireball(this, source.container?.x, source.container?.y);

    fb.rotation = 1.9;

    if (source.front) fb.rotation = -1;

    return new Promise((resolve: () => void) => {
      castSpell(source, resolve);
      this.add.tween({
        targets: fb,
        x: target.container?.x,
        y: target.container?.y,
        duration: 700,
        onComplete: () => {
          fb.destroy();
          target.flinch(damage, updatedTarget.currentHp === 0);
        },
      });
    });
  }

  returnToPosition(id: string) {
    const chara = this.getChara(id);
    chara.clearAnimations();
    chara.run();

    if (!chara.unit.squad) throw new Error(INVALID_STATE);
    const coords = getBoardCoords(this.top === chara.unit.squad.id)(
      chara.unit.squad
    );

    console.log(
      `for`,
      chara.unit.id,
      `return with params`,
      chara.unit.id,
      coords.x,
      coords.y
    );
    const { x, y } = cartesianToIsometricBattle(
      this.top === chara.unit.squad.id,
      coords.x,
      coords.y
    );

    console.log(
      `returning, `,

      this.top === chara.unit.squad.id,
      chara.unit.id,
      x,
      y
    );

    const config = (onComplete: () => void) => ({
      targets: chara.container,
      x: x,
      y: y,
      duration: WALK_DURATION,
      onComplete: () => {
        chara.stand();
        onComplete();
      },
    });

    return new Promise((resolve: () => void) => {
      this.tweens.add(config(resolve));
    });
  }
}

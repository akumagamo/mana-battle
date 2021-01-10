import * as Phaser from "phaser";
import { Chara } from "../Chara/Chara";
import { cartesianToIsometricBattle } from "../utils/isometric";
import { INVALID_STATE } from "../errors";
import { Unit } from "../Unit/Model";
import { Command, runCombat, XPInfo } from "./turns";
import plains from "../Backgrounds/plains";
import { Container } from "../Models";
import fireball from "../Chara/animations/spells/fireball";
import castSpell from "../Chara/animations/castSpell";
import { Squad } from "../Squad/Model";
import { Vector } from "../Map/Model";
import { Map } from "immutable";
import { invertBoardPosition } from "./utils";
import announcement from "../UI/announcement";
import { fadeIn, fadeOut } from "../UI/Transition";
import { displayExperience } from "../Chara/animations/displayExperience";
import { displayLevelUp } from "../Chara/animations/displayLevelUp";
import StaticBoardScene from "../Board/StaticBoardScene";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../constants";
import panel from "../UI/panel";

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
  squads: Squad[] = [];
  miniSquads: {
    top: StaticBoardScene | null;
    bottom: StaticBoardScene | null;
  } = {
    top: null,
    bottom: null,
  };
  miniSquadCharas: Chara[] = [];

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
  async create(data: {
    top: string;
    bottom: string;
    conflictId: string;
    squads: Squad[];
    units: Map<string, Unit>;
    onCombatFinish: <CMD>(cmd: CMD[]) => void;
  }) {
    if (this.container) this.container.destroy();

    this.squads = data.squads;

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

          const { x, y } = cartesianToIsometricBattle(
            isTopSquad,
            isTopSquad ? member.x : invertBoardPosition(member.x),
            isTopSquad ? member.y : invertBoardPosition(member.y)
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

    await fadeIn(this);

    this.renderMiniSquads(data.top, data.bottom, data.squads, data.units);

    await announcement(this, "Fight it out!");

    this.turn();
  }

  renderMiniSquads(
    top: string,
    bottom: string,
    squads: Squad[],
    units: Map<string, Unit>
  ) {
    const pos = {
      [top]: { x: SCREEN_WIDTH - 430, y: -20, top: true },
      [bottom]: { x: -80, y: SCREEN_HEIGHT - 230, top: false },
    };

    const panel_ = (id: string) =>
      panel(pos[id].x + 80, pos[id].y, 360, 230, this.container, this);

    panel_(top).setAlpha(0.3);
    panel_(bottom).setAlpha(0.3);

    const render = (squadId: string) =>
      new StaticBoardScene(
        squads.find((s) => s.id === squadId),
        units
          .filter((u) => u.squad.id === squadId)
          .toList()
          .toJS(),
        pos[squadId].x,
        pos[squadId].y,
        0.4,
        pos[squadId].top
      );

    this.miniSquads.top = render(top);
    this.miniSquads.bottom = render(bottom);

    this.scene.add(this.miniSquadId(top), this.miniSquads.top, true);
    this.scene.add(this.miniSquadId(bottom), this.miniSquads.bottom, true);

    const push = (c: Chara) => this.miniSquadCharas.push(c);

    this.miniSquads.top.unitList.forEach(push);
    this.miniSquads.bottom.unitList.forEach(push);
  }

  private miniSquadId(id: string): string {
    return `minisquad_${id}`;
  }

  turnOff() {
    this.onCombatFinish = null;
    this.removeChildren();
    this.container?.destroy();
    this.scene.stop();
    this.squads = [];
  }
  removeChildren() {
    this.charas.forEach((chara) => {
      chara.container.destroy();
      this.scene.remove(chara);
    });
    this.charas = [];

    this.miniSquads.top.turnOff();
    this.miniSquads.bottom.turnOff();

    this.scene.remove(this.miniSquads.top);
    this.scene.remove(this.miniSquads.bottom);
    this.miniSquadCharas = [];
  }

  // COMBAT FLOW METHODS

  turn() {
    const commands = runCombat(this.charas.map((u) => u.unit));
    this.execute(commands);
  }

  async execute(commands: Command[]) {
    const cmd = commands[0];

    console.log(`CombatScene CMDs:`, cmd);

    const next = (arr: Command[]) => {
      const [, ...rest] = arr;
      return rest;
    };

    const step = () => {
      const next_ = next(commands);

      if (next_.length === 0) console.log(`finish!`);
      else this.execute(next_);
    };

    if (cmd.type === "MOVE") {
      await this.moveUnit(cmd.source, cmd.target);
      step();
    } else if (cmd.type === "SLASH") {
      await this.slash(cmd.source, cmd.target, cmd.damage, cmd.updatedTarget);
      step();
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
    } else if (cmd.type === "DISPLAY_XP") {
      await this.displayExperienceGain(cmd.xpInfo);
      step();
    } else if (cmd.type === "END_COMBAT") {
      console.log(`Combat reached its end`);

      await this.combatEnd(cmd.units);

      console.log(`onCombatFinish END_COMBAT`);

      this.turnOff();
    } else if (cmd.type === "VICTORY") {
      console.log("Winning Team:", cmd.target);

      console.log(`onCombatFinish VICTORY`);

      await this.combatEnd(cmd.units);

      this.turnOff();
    } else console.error(`Unknown command:`, cmd);
  }

  async combatEnd(units: Unit[]) {
    this.retreatUnits();
    await fadeOut(this);

    // TODO add battle result ( who won, who was destroyed)
    if (this.onCombatFinish) {
      this.onCombatFinish(units.map((unit) => ({ type: "UPDATE_UNIT", unit })));
    }
  }
  async displayExperienceGain(xps: XPInfo[]) {
    await Promise.all(
      xps.map(
        async ({ id, xp }) => await displayExperience(this.getChara(id), xp)
      )
    );

    return await Promise.all(
      xps
        .filter(({ lvls }) => lvls > 0)
        .map(async ({ id }) => await displayLevelUp(this.getChara(id)))
    );
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

    const pos = this.squads.find((sqd) => sqd.id === target.unit.squad.id)
      .members[target.unit.id];

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

    return new Promise<void>((resolve) => {
      this.time.addEvent(timeEvents);
      this.tweens.add(config(resolve));
    });
  }

  async retreatUnits() {
    return this.charas.map((chara) => {
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

      return chara;
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

    return new Promise<void>((resolve) => {
      source.slash(resolve);
      target.flinch(damage, updatedTarget.currentHp === 0);
      this.updateMinisquadHP(targetId, updatedTarget.currentHp);
    });
  }

  updateMinisquadHP(id: string, hp: number) {
    const chara = this.miniSquadCharas.find((c) => c.unit.id === id);

    chara.renderHPBar(hp);
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

    return new Promise<void>((resolve) => {
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

    return new Promise<void>((resolve) => {
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

    return new Promise<void>((resolve) => {
      this.tweens.add(config(resolve));
    });
  }
}

import { Chara } from '../Chara/Model';
import { cartesianToIsometricBattle } from '../utils/isometric';
import { INVALID_STATE } from '../errors';
import { Unit, UnitIndex } from '../Unit/Model';
import { Command, runCombat, XPInfo } from './turns';
import plains from '../Backgrounds/plains';
import { Container } from '../Models';
import fireball from '../Chara/animations/spells/fireball';
import castSpell from '../Chara/animations/castSpell';
import * as Squad from '../Squad/Model';
import { Vector } from '../Map/Model';
import { List, Map } from 'immutable';
import announcement from '../UI/announcement';
import { fadeIn, fadeOut } from '../UI/Transition';
import { displayExperience } from '../Chara/animations/displayExperience';
import { displayLevelUp } from '../Chara/animations/displayLevelUp';
import { PUBLIC_URL, SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import panel from '../UI/panel';
import { Scene } from 'phaser';
import hpBar from '../Chara/ui/hpBar';
import defaultPose from '../Chara/animations/defaultPose';
import run from '../Chara/animations/run';
import stand from '../Chara/animations/stand';
import bowAttack from '../Chara/animations/bowAttack';
import slash from '../Chara/animations/slash';
import flinch from '../Chara/animations/flinch';
import createChara from '../Chara/createChara';
import { Board } from '../Board/Model';
import createStaticBoard from '../Board/createBoard';

const COMBAT_CHARA_SCALE = 1;
const WALK_DURATION = 500;
const WALK_FRAMES = 60;

const GAME_SPEED = parseInt(process.env.SPEED);

const getBoardCoords = (isTopSquad: boolean) => ({ x, y }: Vector) => {
  return {
    x: isTopSquad ? x : Squad.invertBoardPosition(x),
    y: isTopSquad ? y : Squad.invertBoardPosition(y),
  };
};
type CombatSceneCreateParams = {
  top: string;
  bottom: string;
  squads: Squad.Index;
  units: UnitIndex;
  onCombatFinish: (cmd: List<Unit>) => void;
};

export default class CombatScene extends Phaser.Scene {
  charas: Chara[] = [];
  top = '';
  bottom = '';
  currentTurn = 0;
  container: Container | null = null;
  onCombatFinish: ((cmd: List<Unit>) => void) | null = null;
  squads: Squad.Index = Map();
  unitIndex: UnitIndex = Map();
  miniSquads: {
    top: Board | null;
    bottom: Board | null;
  } = {
    top: null,
    bottom: null,
  };
  miniSquadCharas: Chara[] = [];

  constructor() {
    super('CombatScene');
  }

  updateUnit(unit: Unit) {
    this.unitIndex = this.unitIndex.set(unit.id, unit);
  }

  preload() {
    [
      'backgrounds/plain',
      'backgrounds/castle',
      'backgrounds/sunset',
      'backgrounds/squad_edit',
    ].forEach((str) => this.load.image(str, PUBLIC_URL + '/' + str + '.svg'));
    ['backgrounds/throne_room'].forEach((str) =>
      this.load.image(str, PUBLIC_URL + '/' + str + '.jpg')
    );

    this.load.spritesheet('fire', `${PUBLIC_URL}/fire.svg`, {
      frameWidth: 50,
      frameHeight: 117,
      endFrame: 7,
    });

    const props = [
      'props/grass',
      'props/bush',
      'props/far_tree_1',
      'props/branch',
    ];
    props.forEach((id: string) => {
      this.load.image(id, `${PUBLIC_URL}/${id}.svg`);
    });

    if (process.env.SOUND_ENABLED) {
      const mp3s = ['combat1', 'sword_hit', 'arrow_critical', 'fireball'];
      mp3s.forEach((id: string) => {
        this.load.audio(id, `${PUBLIC_URL}/music/${id}.mp3`);
      });
    }
  }

  async create(data: CombatSceneCreateParams) {
    if (this.container) this.container.destroy();

    this.squads = data.squads;
    this.unitIndex = data.units;

    this.onCombatFinish = data.onCombatFinish;

    if (process.env.SOUND_ENABLED) {
      this.sound.stopAll();
      const music = this.sound.add('combat1');
      music.play();
    }

    this.container = this.add.container(0, 0);

    plains(this, this.container);

    this.top = data.top;
    this.bottom = data.bottom;

    const combatants = [data.top, data.bottom];

    combatants.forEach((id) => {
      const squad = data.squads.find((s) => s.id === id);

      if (!squad) throw new Error(INVALID_STATE);

      const isTopSquad = id === data.top;
      const getCoords = getBoardCoords(data.top === squad.id);

      squad.members
        .sort((a, b) => getCoords(a).x - getCoords(b).x)
        .forEach((member) => {
          const unit = data.units.find((u) => u.id === member.id);
          if (!unit) throw new Error(INVALID_STATE);

          if (unit.currentHp < 1) return;

          const { x, y } = cartesianToIsometricBattle(
            isTopSquad,
            isTopSquad ? member.x : Squad.invertBoardPosition(member.x),
            isTopSquad ? member.y : Squad.invertBoardPosition(member.y)
          );

          const chara = createChara({
            parent: this,
            unit,
            x: x,
            y: y,
            scale: COMBAT_CHARA_SCALE,
            front: isTopSquad,
          });

          this.charas.push(chara);
        });
    });

    await fadeIn(this, 1000 / GAME_SPEED);

    this.renderMiniSquads(data.top, data.bottom);

    await announcement(this, 'Fight it out!', 2000 / GAME_SPEED);

    this.turn();
  }

  renderMiniSquads(top: string, bottom: string) {
    const pos = {
      [top]: { x: SCREEN_WIDTH - 430, y: -20, top: true },
      [bottom]: { x: -80, y: SCREEN_HEIGHT - 230, top: false },
    };

    const panel_ = (id: string) =>
      panel(pos[id].x + 80, pos[id].y, 360, 230, this.container, this);

    panel_(top).setAlpha(0.3);
    panel_(bottom).setAlpha(0.3);

    const render = (squadId: string) =>
      createStaticBoard(
        this,
        this.squads.find((s) => s.id === squadId),
        this.unitIndex.filter((u) => u.squad === squadId),
        pos[squadId].x,
        pos[squadId].y,
        0.4,
        pos[squadId].top
      );

    this.miniSquads.top = render(top);
    this.miniSquads.bottom = render(bottom);

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
    this.squads = Map();
  }
  removeChildren() {
    this.charas.forEach((chara) => chara.destroy());
    this.charas = [];

    this.miniSquadCharas.forEach((board) => board.destroy());
    this.miniSquadCharas = [];
  }

  // COMBAT FLOW METHODS

  turn() {
    const commands = runCombat(this.squads, this.unitIndex);
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

    if (cmd.type === 'MOVE') {
      await this.moveUnit(cmd.source, cmd.target);
      step();
    } else if (cmd.type === 'SLASH') {
      await this.slash(cmd.source, cmd.target, cmd.damage, cmd.updatedTarget);
      step();
    } else if (cmd.type === 'SHOOT') {
      this.bowAttack(
        cmd.source,
        cmd.target,
        cmd.damage,
        cmd.updatedTarget
      ).then(step);
    } else if (cmd.type === 'FIREBALL') {
      this.castFireball(
        cmd.source,
        cmd.target,
        cmd.damage,
        cmd.updatedTarget
      ).then(step);
    } else if (cmd.type === 'RETURN') {
      this.returnToPosition(cmd.target).then(step);
    } else if (cmd.type === 'END_TURN') {
      this.currentTurn = this.currentTurn + 1;
      this.turn();
    } else if (cmd.type === 'RESTART_TURNS') {
      this.currentTurn = 0;
      this.turn();
    } else if (cmd.type === 'DISPLAY_XP') {
      await this.displayExperienceGain(cmd.xpInfo);
      step();
    } else if (cmd.type === 'END_COMBAT') {
      console.log(`Combat reached its end`);

      await this.combatEnd(cmd.units);

      console.log(`onCombatFinish END_COMBAT`);

      this.turnOff();
    } else if (cmd.type === 'VICTORY') {
      console.log('Winning Team:', cmd.target);

      console.log(`onCombatFinish VICTORY`);

      await this.combatEnd(cmd.units);

      this.turnOff();
    } else console.error(`Unknown command:`, cmd);
  }

  async combatEnd(units: UnitIndex) {
    this.retreatUnits();
    await fadeOut(this, 1000 / GAME_SPEED);

    // TODO add battle result ( who won, who was destroyed)
    if (this.onCombatFinish) {
      this.onCombatFinish(units.toList());
    }
  }
  async displayExperienceGain(xps: List<XPInfo>) {
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
    return this.charas.find((u) => u.props.unit.id === id);
  }

  moveUnit(sourceId: string, targetId: string) {
    const chara = this.getChara(sourceId);
    const target = this.getChara(targetId);

    defaultPose(chara);
    run(chara);

    if (!target.props.unit.squad) throw new Error(INVALID_STATE);

    const targetIsTop = this.top === target.props.unit.squad;

    if (!target.container) throw new Error(INVALID_STATE);

    const pos = this.squads
      .find((sqd) => sqd.id === target.props.unit.squad)
      .members.get(target.props.unit.id);

    const { x, y } = cartesianToIsometricBattle(
      targetIsTop,
      targetIsTop ? pos.x + 1 : Squad.invertBoardPosition(pos.x) - 1,
      targetIsTop ? pos.y : Squad.invertBoardPosition(pos.y)
    );

    const config = (onComplete: () => void) => ({
      targets: chara.container,
      x: x,
      y: y,
      duration: WALK_DURATION / GAME_SPEED,
      onComplete: () => {
        onComplete();
      },
    });

    // z-sorting for moving character
    const timeEvents = {
      delay: WALK_DURATION / WALK_FRAMES / GAME_SPEED,
      callback: () => {
        this.charas.sort((a, b) => a.container.depth - b.container.depth);
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
      run(chara);

      if (!chara.props.unit.squad) throw new Error(INVALID_STATE);

      const charaIsTop = this.top === chara.props.unit.squad;

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
        duration: 1000 / GAME_SPEED,
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
      slash(source, resolve);
      this.damageUnit(target, damage, updatedTarget, targetId);
    });
  }

  private damageUnit(
    chara: Chara,
    damage: number,
    updatedTarget: Unit,
    targetId: string
  ) {
    if (chara.props.showHpBar) hpBar(chara, damage);

    flinch(chara, damage, updatedTarget.currentHp === 0);

    this.updateMinisquadHP(targetId, updatedTarget.currentHp);
  }

  updateMinisquadHP(id: string, hp: number) {
    const chara = this.miniSquadCharas.find((c) => c.props.unit.id === id);

    hpBar(chara, hp);
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
      'arrow'
    );

    arrow.rotation = 0.5;

    if (!source.props.front) arrow.scaleX = -1;

    return new Promise<void>((resolve) => {
      bowAttack(source, resolve);
      this.add.tween({
        targets: arrow,
        x: target.container?.x,
        y: target.container?.y,
        duration: 250 / GAME_SPEED,
        onComplete: () => {
          arrow.destroy();

          this.damageUnit(target, damage, updatedTarget, targetId);
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

    if (source.props.front) fb.rotation = -1;

    return new Promise<void>((resolve) => {
      castSpell(source, resolve);
      this.add.tween({
        targets: fb,
        x: target.container?.x,
        y: target.container?.y,
        duration: 700 / GAME_SPEED,
        onComplete: () => {
          fb.destroy();
          this.damageUnit(target, damage, updatedTarget, targetId);
        },
      });
    });
  }

  returnToPosition(id: string) {
    const chara = this.getChara(id);
    defaultPose(chara);
    run(chara);

    if (!chara.props.unit.squad) throw new Error(INVALID_STATE);
    const coords = getBoardCoords(this.top === chara.props.unit.squad)(
      this.squads.get(chara.props.unit.squad).members.get(id)
    );

    console.log(
      `for`,
      chara.props.unit.id,
      `return with params`,
      chara.props.unit.id,
      coords.x,
      coords.y
    );
    const { x, y } = cartesianToIsometricBattle(
      this.top === chara.props.unit.squad,
      coords.x,
      coords.y
    );

    console.log(
      `returning, `,

      this.top === chara.props.unit.squad,
      chara.props.unit.id,
      x,
      y
    );

    const config = (onComplete: () => void) => ({
      targets: chara.container,
      x: x,
      y: y,
      duration: WALK_DURATION / GAME_SPEED,
      onComplete: () => {
        stand(chara);
        onComplete();
      },
    });

    return new Promise<void>((resolve) => {
      this.tweens.add(config(resolve));
    });
  }
}

export function start(scene: Scene, params: CombatSceneCreateParams) {
  const sceneManager = scene.scene;
  sceneManager.start('CombatScene', params);
}

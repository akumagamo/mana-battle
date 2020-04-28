import * as Phaser from 'phaser';
import {preload} from '../preload';
import {Chara} from '../Chara/Chara';
import * as DB from '../DB';
import {cartesianToIsometricBattle} from '../utils/isometric';
import {INVALID_STATE} from '../errors';
import {SCREEN_WIDTH, SCREEN_HEIGHT} from '../constants';
import {Unit} from '../Unit/Model';
import {runTurn, Command} from '../API/Combat/turns';
import branch from '../Props/branch';
import grass from '../Props/grass';

const COMBAT_CHARA_SCALE = 1;
const WALK_DURATION = 500;
const WALK_FRAMES = 60;
const ATTACK_DURATION = 200;

const invert = (n: number) => {
  if (n === 1) return 3;
  else if (n === 3) return 1;
  else return n;
};

const getBoardCoords = (topSquadId: string) => (unit: Unit) => {
  if (!unit.squad) throw new Error(INVALID_STATE);

  const squad = DB.getSquad(unit.squad);
  if (!squad) throw new Error(INVALID_STATE);
  const {x, y} = squad.members[unit.id];

  return {
    x: squad.id === topSquadId ? x : invert(x),
    y: squad.id === topSquadId ? y : invert(y),
  };
};

export default class CombatScene extends Phaser.Scene {
  units: Chara[] = [];
  top = '';
  bottom = '';
  currentTurn = 0;

  constructor() {
    super('CombatScene');
  }
  preload = preload;

  // LIFECYCLE METHODS
  create(data: {top: string; bottom: string}) {
    this.top = data.top;
    this.bottom = data.bottom;
    const combatants = [data.top, data.bottom];

    combatants.forEach((id) => {
      const members = DB.getSquadMembers(id);
      const isTopSquad = id === data.top;
      const getCoords = getBoardCoords(data.top);

      members
        .sort((a, b) => {
          return getCoords(a).y - getCoords(b).y;
        })
        .forEach((unit) => {
          const coords = getCoords(unit);
          const {x, y} = cartesianToIsometricBattle(
            isTopSquad,
            coords.x,
            coords.y,
          );

          const chara = new Chara(
            `combat-chara-${unit.id}`,
            this,
            unit,
            x,
            y,
            COMBAT_CHARA_SCALE,
            isTopSquad,
          );

          this.units.push(chara);
        });
    });

    const bg = this.add.image(0, 0, 'backgrounds/plain');
    bg.setOrigin(0, 0);
    bg.displayWidth = SCREEN_WIDTH;
    bg.displayHeight = SCREEN_HEIGHT;

    drawGrass(this);

    setTimeout(() => {
      this.turn();
    }, 1000);
  }

  destroy() {
    this.removeChildren();
    this.scene.remove(this);
  }
  removeChildren() {
    this.units.forEach((chara) => {
      chara.container?.destroy();
      this.scene.remove(chara);
    });
  }

  // COMBAT FLOW METHODS

  turn() {
    const commands = runTurn(
      this.currentTurn,
      this.units.map((u) => u.unit),
    );
    console.log(this.units.map((u) => u.unit));
    console.log(`===============`, this.currentTurn, `=============`);
    this.execute(commands);
  }

  execute(commands: Command[]) {
    const cmd = commands[0];

    console.log(`Command:`, cmd);

    const next = (arr: Command[]) => {
      return arr.filter((_, i) => i > 0);
    };

    const step = () => {
      const next_ = next(commands);

      if (next_.length === 0) console.log(`finish!`);
      else this.execute(next_);
    };

    if (cmd.type === 'MOVE') {
      this.moveUnit(cmd.source, cmd.target).then(step);
    } else if (cmd.type === 'ATTACK') {
      this.attack(cmd.source, cmd.target).then(step);
    } else if (cmd.type === 'RETURN') {
      this.return(cmd.target).then(step);
    } else if (cmd.type === 'END_TURN') {
      this.currentTurn = this.currentTurn + 1;
      this.turn();
    } else if (cmd.type === 'RESTART_TURNS') {
      this.currentTurn = 0;
      this.turn();
    } else if (cmd.type === 'VICTORY') {
      console.log('Winning Team:', cmd.target);
    } else console.error(`Unknown command:`, cmd);
  }

  // UNIT METHODS

  getChara(id: string) {
    const chara = this.units.find((u) => u.unit.id === id);
    if (!chara || !chara.container) throw new Error(INVALID_STATE);
    return chara;
  }

  moveUnit(sourceId: string, targetId: string) {
    const unit = this.getChara(sourceId);
    const target = this.getChara(targetId);

    unit.clearAnimations()
    unit.run()

    const targetIsTop = this.top === target.unit.squad;

    if (!target.container) throw new Error(INVALID_STATE);

    const targetSquadPos = DB.getSquadMember(target.unit.id);

    const {x, y} = cartesianToIsometricBattle(
      targetIsTop,
      targetIsTop ? targetSquadPos.x + 1 : invert(targetSquadPos.x) - 1,
      targetIsTop ? targetSquadPos.y : invert(targetSquadPos.y),
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
        this.units
          .sort((a, b) =>
            a.container && b.container ? a.container.y - b.container.y : 0,
          )
          .forEach((unit) => this.scene.bringToTop(unit.key));
      },
      repeat: WALK_FRAMES,
    };

    return new Promise((resolve) => {
      
      this.time.addEvent(timeEvents);
      this.tweens.add(config(resolve));
    });
  }

  attack(sourceId: string, targetId: string) {

    const source = this.getChara(sourceId)
    const target = this.getChara(targetId)

    return new Promise((resolve) => {

      source.attack(resolve)
      target.flinch()
    });
  }

  return(id: string) {
    const chara = this.getChara(id);
    chara.clearAnimations()
    chara.run()
    const coords = getBoardCoords(this.top)(chara.unit);
    const {x, y} = cartesianToIsometricBattle(
      this.top === chara.unit.squad,
      coords.x,
      coords.y,
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

    return new Promise((resolve) => {
      this.tweens.add(config(resolve));
    });
  }
}

function drawGrass(scene: Phaser.Scene) {
  const coords = [
    {x: 350, y: 40},
    {x: 320, y: 60},

    {x: 460, y: 70},
    {x: 420, y: 80},

    {x: 550, y: 110},
    {x: 590, y: 120},

    {x: 680, y: 120},
    {x: 1110, y: 350},
    {x: 1130, y: 370},
  ];
  coords.forEach(grass(scene));

  const bushes = [
    {x: 320, y: 700},
    {x: 390, y: 710},
    {x: 450, y: 750},
    {x: 1250, y: 450},
    {x: 50, y: 410},
  ];

  bushes.forEach(({x, y}) => {
    const bush = scene.add.image(x, y, 'props/bush');
    bush.setScale(1);
    bush.setOrigin(0.5, 1);

    scene.tweens.add({
      targets: bush,
      scaleX: 1.25,
      duration: 2000 * Math.random() + 10000,
      repeat: -1,
      yoyo: true,
      ease: 'Linear',
    });
  });

  const farTree1 = scene.add.image(870, 130, 'props/far_tree_1');

  farTree1.setScale(0.5);
  farTree1.setOrigin(0.5, 1);
  scene.tweens.add({
    targets: farTree1,
    scaleX: 0.55,
    rotation: -0.2,
    duration: 1200 * Math.random() + 4000,
    repeat: -1,
    yoyo: true,
    ease: 'Linear',
  });

  branch(scene)(1000, 250, 0.4);
}

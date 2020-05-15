import * as Phaser from 'phaser';
import {Chara} from '../Chara/Chara';
import * as DB from '../DB';
import {cartesianToIsometricBattle} from '../utils/isometric';
import {INVALID_STATE} from '../errors';
import {Unit} from '../Unit/Model';
import {Command, runCombat} from '../API/Combat/turns';
import plains from '../Backgrounds/plains';

const COMBAT_CHARA_SCALE = 1;
const WALK_DURATION = 500;
const WALK_FRAMES = 60;

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

  updateUnit(unit: Unit) {
    this.units = this.units.map((u) => {
      if (u.unit.id === unit.id) {
        u.unit = unit;
      }

      return u;
    });
  }

  // LIFECYCLE METHODS
  create(data: {top: string; bottom: string}) {
    plains(this);

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
    const commands = runCombat(this.units.map((u) => u.unit));
    console.log(`>>>`, commands);
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
      this.attack(cmd.source, cmd.target, cmd.damage, cmd.updatedTarget).then(
        step,
      );
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

    unit.clearAnimations();
    unit.run();

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

  attack(
    sourceId: string,
    targetId: string,
    damage: number,
    updatedTarget: Unit,
  ) {
    this.updateUnit(updatedTarget);

    const source = this.getChara(sourceId);
    const target = this.getChara(targetId);

    return new Promise((resolve) => {
      source.attack(resolve);
      target.flinch(damage, updatedTarget.currentHp === 0);
    });
  }

  return(id: string) {
    const chara = this.getChara(id);
    chara.clearAnimations();
    chara.run();
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
        console.log(`stand!!`);
        chara.stand();
        onComplete();
      },
    });

    return new Promise((resolve) => {
      this.tweens.add(config(resolve));
    });
  }
}

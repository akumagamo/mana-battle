import * as Phaser from 'phaser';
import {preload} from '../preload';
import {Chara} from '../Chara/Chara';
import * as DB from '../DB';
import {cartesianToIsometricBattle} from '../utils/isometric';
import {INVALID_STATE} from '../errors';
import {SCREEN_WIDTH, SCREEN_HEIGHT} from '../constants';
import {Unit} from '../Unit/Model';

const COMBAT_CHARA_SCALE = 1;
const WALK_DURATION = 1000
const WALK_FRAMES = 60

const invert = (n: number) => {
  if (n === 1) return 3;
  else if (n === 3) return 1;
  else return n;
};

export default class CombatScene extends Phaser.Scene {
  units: Chara[] = [];
  top: string = '';
  bottom: string = '';
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

      const squad = DB.getSquad(id);

      const isTopSquad = id === data.top;

      if (!squad) throw new Error(INVALID_STATE);

      const getBoardCoords = (unit: Unit) => {
        const {x, y} = squad.members[unit.id];

        return {
          x: isTopSquad ? x : invert(x),
          y: isTopSquad ? y : invert(y),
        };
      };

      members
        .sort((a, b) => {
          return getBoardCoords(a).y - getBoardCoords(b).y;
        })
        .forEach((unit) => {
          const coords = getBoardCoords(unit);
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

          chara.onClick(() => {
            this.moveUnit(
              this.units[0],
              this.units.find((un) => un.unit.id === unit.id) as Chara,
            );
          });

          this.units.push(chara);
        });
    });

    const bg = this.add.image(0, 0, 'backgrounds/plain');
    bg.setOrigin(0, 0);
    bg.displayWidth = SCREEN_WIDTH;
    bg.displayHeight = SCREEN_HEIGHT;
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

  // UNIT METHODS

  moveUnit(unit: Chara, target: Chara) {
    const targetIsTop = this.top === target.unit.squad;

    if (!target.container) throw new Error(INVALID_STATE);

    const targetSquadPos = DB.getSquadMember(target.unit.id);

    const {x, y} = cartesianToIsometricBattle(
      targetIsTop,
      targetIsTop ? targetSquadPos.x + 1 : invert(targetSquadPos.x) - 1,
      targetIsTop ? targetSquadPos.y : invert(targetSquadPos.y),
    );

    const config = {
      targets: unit.container,
      x: x,
      y: y,
      duration: WALK_DURATION,
    };
    console.log(config);
    this.tweens.add(config);

    // z-sorting for moving character
    this.time.addEvent({
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
    });
  }
}

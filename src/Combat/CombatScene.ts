import * as Phaser from 'phaser';
import {preload} from '../preload';
import {Chara} from '../Chara/Chara';
import * as DB from '../DB';
import {cartesianToIsometricBattle} from '../utils/isometric';
import {INVALID_STATE} from '../errors';
import {SCREEN_WIDTH, SCREEN_HEIGHT} from '../constants';
import {Unit} from '../Unit/Model';

const TOP_SQUAD_OFFSET_X = 400;
const TOP_SQUAD_OFFSET_Y = 50;

const BOTTOM_SQUAD_OFFSET_X = 600;
const BOTTOM_SQUAD_OFFSET_Y = 350;

const COMBAT_CHARA_SCALE = 1;

export default class CombatScene extends Phaser.Scene {
  units: Chara[] = [];
  constructor() {
    super('CombatScene');
  }
  preload = preload
  create(data:{top:string, bottom:string}) {
    const combatants = [data.top, data.bottom];

    combatants.forEach(id => {
      const members = DB.getSquadMembers(id);

      const squad = DB.getSquad(id);

      const isTopSquad = id === data.top;

      if (!squad) throw new Error(INVALID_STATE);

      const getBoardCoords = (unit: Unit) => {
        const {x, y} = squad.members[unit.id];
        const invert = (n: number) => {
          if (n === 1) return 3;
          else if (n === 3) return 1;
          else return n;
        };
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
          const {x, y} = cartesianToIsometricBattle(coords.x, coords.y);

          const offsetX = isTopSquad
            ? TOP_SQUAD_OFFSET_X
            : BOTTOM_SQUAD_OFFSET_X;
          const offsetY = isTopSquad
            ? TOP_SQUAD_OFFSET_Y
            : BOTTOM_SQUAD_OFFSET_Y;

          const chara = new Chara(
            `combat-chara-${unit.id}`,
            this,
            unit,
            x +  offsetX,
            y +  offsetY,
            COMBAT_CHARA_SCALE,
            isTopSquad
          );

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
}

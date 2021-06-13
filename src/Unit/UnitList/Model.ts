import { List } from 'immutable';
import { Chara } from '../../Chara/Model';
import { Container } from '../../Models';
import { Unit } from '../Model';

export type UnitList = {
  scene: Phaser.Scene;
  container: Container;
  page: number;
  x: number;
  y: number;
  itemsPerPage: number;
  units: List<Unit>;

  onUnitClick: (unit: Unit) => void;
  onDrag: (unit: Unit, x: number, y: number) => void;
  onDragEnd: (chara: Chara, x: number, y: number) => void;
};

export const destroy = (unitList: UnitList) => {
  unitList.container.destroy();
  unitList = null;
};

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
  charas: List<Chara>;
};

export const destroy = (unitList: UnitList) => {
  unitList.container.destroy();
  unitList = null;
};

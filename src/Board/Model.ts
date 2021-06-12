import { Container, Image } from '../Models';
import { Chara } from '../Chara/Model';
import { Graphics } from '../Models';
import { UnitIndex } from '../Unit/Model';
import { SquadRecord } from '../Squad/Model';

export type BoardTile = {
  sprite: Image;
  x: number;
  y: number;
  boardX: number;
  boardY: number;
};

export type StaticBoard = {
  scene: Phaser.Scene;
  container: Container;
  x: number;
  y: number;
  front: boolean;
  scale: number;
  tiles: BoardTile[];
  unitList: Chara[];
  units: UnitIndex;
  squad: SquadRecord;
  isSelected: boolean;
  destroy: () => void;
};

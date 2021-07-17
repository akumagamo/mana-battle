import { Container, Image } from '../Models';
import { Chara } from '../Chara/Model';
import { Unit, UnitIndex } from '../Unit/Model';
import { SquadRecord } from '../Squad/Model';

export type BoardTile = {
  sprite: Image;
  x: number;
  y: number;
  boardX: number;
  boardY: number;
};

export type Board = {
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

export type BoardInteractiveEvents = {
  onSquadUpdated: (
    squad: SquadRecord,
    added: string[],
    removed: string[]
  ) => void;
  onDragStart?: (unit: Unit, x: number, y: number, chara: Chara) => void;
  onDragEnd?: (chara: Chara) => (x: number, y: number) => void;
};

import {Unit} from '../Unit/Model';
import {Container, Image} from '../Models';
import {Map} from 'immutable';

export type Chara = {
  scene: Phaser.Scene;
  id: string;
  unit: Unit;
  container: Container;
  x: number;
  y: number;
  scale: number;
  showHpBar: boolean;
  hpBarContainer: Container;

  sprite: Phaser.GameObjects.Sprite;

  stand: () => void;
  hit: () => void;
  cast: () => void;
  run: () => void;
  die: () => void;

  tint: (value: number) => void;
  destroy: () => void;

  selectedCharaIndicator: Image | null;
};

export type CharaIndex = Map<string, Chara>;
export const emptyIndex = Map() as CharaIndex;

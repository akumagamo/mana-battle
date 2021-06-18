import { Chara } from '../../Chara/Model';
import { Container } from '../../Models';

export type TitleSceneState = {
  music: Phaser.Sound.BaseSound | null;
  charas: Chara[];
  container: Container | null;
};
export const initialState: TitleSceneState = {
  music: null,
  charas: [],
  container: null,
};

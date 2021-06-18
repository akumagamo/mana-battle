import storyManager from '../../storyManager';
import { TitleSceneState } from '../Model';

export function handleNewGameClick(
  scene: Phaser.Scene,
  state: TitleSceneState
): void {
  storyManager(scene, state);
  scene.scene.stop();
}

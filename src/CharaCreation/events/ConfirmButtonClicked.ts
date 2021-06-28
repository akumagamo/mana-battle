import chapter1 from '../../Campaign/chapter1';
import { Unit } from '../../Unit/Model';
import { CharaCreationState } from '../Model';

export default function (scene: Phaser.Scene, state: CharaCreationState) {
  const name: string = (<HTMLInputElement>(
    document.getElementById('new-chara-name')
  )).value;
  const unit: Unit = { ...state.unit, name };

  state.container.destroy();
  scene.scene.stop();

  //console.log(`go`);
  // TEST CODE

  chapter1(scene, unit);
}

import chapter1 from '../../Campaign/chapter1';
import { Unit } from '../../Unit/Model';
import { CharaCreationState } from '../Model';
import { getDOMElementById } from '../../Browser/getDOMElementById';

export default function (scene: Phaser.Scene, state: CharaCreationState) {
  const name: string = (<HTMLInputElement>(
    getDOMElementById('new-chara-name')
  )).value;
  const unit: Unit = { ...state.unit, name };

  state.container.destroy();
  scene.scene.stop();

  // TEST CODE

  chapter1(scene, unit);
}


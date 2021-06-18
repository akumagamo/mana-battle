import { Board } from '../../../Board/Model';
import { destroy, UnitList } from '../../../Unit/UnitList/Model';
import * as Squad from '../../Model';
import { componentEvents } from '../createEditSquadModal';

export function onCloseModal(
  listScene: UnitList,
  boardScene: Board,
  scene: Phaser.Scene,
  onClose: (s: Squad.SquadRecord) => void
) {
  destroy(listScene);
  boardScene.destroy();

  for (const k in componentEvents) scene.events.off(k);

  onClose(boardScene.squad);
}

import {PLAYER_FORCE} from '../../API/Map/Model';
import button from '../../UI/button';
import text from '../../UI/text';
import {MapScene} from '../MapScene';
import playerSquad from './playerSquad';
import {BOTTOM_PANEL_Y} from './index';

export function squadInfo(
  scene: MapScene,
  uiContainer: Phaser.GameObjects.Container,
  baseY: number,
  id: string): void {
  const squad = scene.squadIO(id);


  text(20, baseY, squad.name, uiContainer, scene);
  text(1000, baseY, `${squad.range} cells`, uiContainer, scene);

  if (squad.force !== PLAYER_FORCE) {
    button(200, baseY, 'Squad Details', scene.uiContainer, scene, () => scene.viewSquadDetails(squad.id)
    );
  }

  if (squad.force === PLAYER_FORCE) {
    playerSquad(scene, baseY, squad, uiContainer);
  }
}


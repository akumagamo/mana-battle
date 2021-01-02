import {PLAYER_FORCE} from '../../constants';
import button from '../../UI/button';
import text from '../../UI/text';
import {MapScene} from '../MapScene';
import playerSquad from './playerSquad';

export async  function squadInfo(
  scene: MapScene,
  uiContainer: Phaser.GameObjects.Container,
  baseY: number,
  id: string): Promise<void> {
  const squad = scene.squadIO(id);

  text(20, baseY, squad.name, uiContainer, scene);

  if (squad.force !== PLAYER_FORCE) {
    button(200, baseY, 'Squad Details', scene.uiContainer, scene, () => scene.viewSquadDetails(squad.id)
    );
  }

  if (squad.force === PLAYER_FORCE) {
    playerSquad(scene, baseY, squad, uiContainer);
  }
}


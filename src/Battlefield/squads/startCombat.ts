import createBoard from '../../Board/createBoard';
import {PLAYER_FORCE, SCREEN_WIDTH, SCREEN_HEIGHT} from '../../constants';
import {GAME_SPEED} from '../../env';
import {delay} from '../../Scenes/utils';
import panel from '../../UI/panel';
import speech from '../../UI/speech';
import {disableMapInput} from '../board/input';
import {MapSquad, getSquadUnits, getSquadLeader, MapState} from '../Model';
import {destroyUI} from '../ui';
import attack from './attack';

export default async function (
  scene: Phaser.Scene,
  state: MapState,
  squadA: MapSquad,
  squadB: MapSquad,
) {
  const baseX = 500;
  const baseY = 300;
  const scale = 0.5;

  state.isPaused = true;

  const playerSquad = [squadA, squadB].find(
    (sqd) => sqd.squad.force === PLAYER_FORCE,
  );

  disableMapInput(state);
  destroyUI(state);

  const bg = panel(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, state.uiContainer, scene);
  bg.setAlpha(0.4);

  const leader = getSquadLeader(state, playerSquad.id);

  const enemyUnits = getSquadUnits(state, squadB.id);

  const {board: enemy} = createBoard(
    scene,
    squadB.squad,
    enemyUnits,
    baseX + 10,
    baseY + 5,
    scale,
    true,
  );

  const alliedUnits = state.units.filter((u) => u.squad === squadA.id);

  const {board: ally} = createBoard(
    scene,
    squadA.squad,
    alliedUnits,
    baseX + 200,
    baseY + 100,
    scale,
    false,
  );

  const speechWindow = speech(
    leader,
    450,
    70,
    'Ready for Combat',
    state.uiContainer,
    scene,
  );

  await delay(scene, 3000 / GAME_SPEED);

  speechWindow.destroy();

  ally.destroy();
  enemy.destroy();

  attack(scene, state, squadA, squadB);
}

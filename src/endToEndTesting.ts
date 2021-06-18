import CharaCreationScene from './CharaCreation/CharaCreationScene';
import { MapScene } from './Map/MapScene';
import { PLAYER_FORCE } from './constants';
import { Unit } from './Unit/Model';
import TitleScene from './Scenes/Title/TitleScene';

const assert = (condition: string, a: any, b: any) => {
  if (a !== b)
    throw new Error(
      `❌ ${condition} - ${a.toString()} should equals ${b.toString()}`
    );
  else console.log('✅', condition);
};

export function endToEndTesting(game: Phaser.Game) {
  game.events.once('TitleSceneCreated', (scn: TitleScene) => {
    scn.events.emit('newGameButtonClicked');
  });
  game.events.once(
    'CharaCreationSceneCreated',
    (
      scn: CharaCreationScene,
      onHeroCreated: (value: Unit | PromiseLike<Unit>) => void
    ) => {
      (document.getElementById('new-chara-name') as HTMLInputElement).value =
        'TestHero';
      scn.sceneEvents.ConfirmationButtonClicked(onHeroCreated);
    }
  );
  game.events.once('MapSceneCreated', (scn: MapScene) => {
    const squad = scn.state.squads.find(
      (sqd) => sqd.squad.force === PLAYER_FORCE
    );
    clickCell(scn, 3, 5);
    scn.evs.MovePlayerSquadButonClicked.emit({
      mapScene: scn,
      mapSquad: squad,
    });
    assert("MapScene is paused after clicking 'Move'", scn.isPaused, true);

    clickCell(scn, 7, 5);

    scn.evs.SquadDispatched.once((_id) => {
      assert(
        'MapScene is no longer paused selecting move destination',
        scn.isPaused,
        false
      );
    });

    scn.evs.SquadArrivedInfoMessageCompleted.once((chara) => {
      scn.evs.CloseSquadArrivedInfoMessage.emit(chara);

      scn.evs.MovePlayerSquadButonClicked.emit({
        mapScene: scn,
        mapSquad: squad,
      });

      scn.evs.OrganizeButtonClicked.emit(scn);
    });
  });
}

function clickCell(scn: MapScene, x: number, y: number) {
  scn.evs.CellClicked.emit({
    tile: { x, y },
    pointer: { x: 200, y: 400 },
  });
}

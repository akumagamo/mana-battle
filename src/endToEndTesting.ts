import CharaCreationScene from './CharaCreation/CharaCreationScene';
import { Battlefield } from './Battlefield/MapScene';
import TitleScene from './Scenes/Title/TitleScene';
import { initialState } from './Scenes/Title/Model';
import * as newgamebtn from './Scenes/Title/events/newGameButtonClicked';
import ConfirmButtonClicked from './CharaCreation/events/ConfirmButtonClicked';
import { CharaCreationState } from './CharaCreation/Model';
import mapEvents from './Battlefield/events';
import { initialBattlefieldState } from './Battlefield/Model';

const assert = <A>(condition: string, a: A, b: A) => {
  if (a !== b)
    throw new Error(
      `❌ ${condition} - ${a.toString()} should equals ${b.toString()}`
    );
  else console.log('✅', condition);
};

const event = (eventEmitter: Phaser.Events.EventEmitter) => (event: string) =>
  new Promise((resolve) => {
    eventEmitter.once(event, (...args: any[]) => {
      //@ts-ignore
      resolve(...args);
    });
  });

export async function endToEndTesting(game: Phaser.Game) {
  const titleScene = await getTitleScene(game);
  await startGame(titleScene);

  const charaCreationScene = await getCharaCreationScene(game);
  await createCharacter(charaCreationScene);

  return;
  // const charaCreationScene = (await event(game.events)(
  //   "CharaCreationSceneCreated"
  // )) as { scene: CharaCreationScene; onHeroCreated: (u: Unit) => void };

  // charaCreationScene.scene.sceneEvents.ConfirmationButtonClicked(
  //   charaCreationScene.onHeroCreated
  // );

  // const Phaser.Scene = (await event(game.events)("Phaser.SceneCreated")) as Phaser.Scene;

  // const squad = Phaser.Scene.state.squads.find(
  //   (sqd) => sqd.squad.force === PLAYER_FORCE
  // );
  // clickCell(Phaser.Scene, 3, 5);
  // Phaser.Scene.evs.MovePlayerSquadButonClicked.emit({
  //   Phaser.Scene: Phaser.Scene,
  //   mapSquad: squad,
  // });
  // assert("Phaser.Scene is paused after clicking 'Move'", Phaser.Scene.state.isPaused, true);

  // clickCell(Phaser.Scene, 7, 5);

  // Phaser.Scene.evs.SquadDispatched.once((_id) => {
  //   assert(
  //     "Phaser.Scene is no longer paused selecting move destination",
  //     Phaser.Scene.state.isPaused,
  //     false
  //   );
  // });

  // Phaser.Scene.evs.SquadArrivedInfoMessageCompleted.once((chara) => {
  //   Phaser.Scene.evs.CloseSquadArrivedInfoMessage.emit(chara);

  //   Phaser.Scene.evs.MovePlayerSquadButonClicked.emit({
  //     Phaser.Scene: Phaser.Scene,
  //     mapSquad: squad,
  //   });

  //   Phaser.Scene.evs.OrganizeButtonClicked.emit(Phaser.Scene);
  // });
}

async function getCharaCreationScene(game: Phaser.Game) {
  return (await event(game.events)('CharaCreationSceneCreated')) as {
    scene: CharaCreationScene;
    state: CharaCreationState;
  };
}

async function getTitleScene(game: Phaser.Game) {
  return (await event(game.events)('TitleSceneCreated')) as TitleScene;
}

async function createCharacter({
  scene,
  state,
}: {
  scene: Phaser.Scene;
  state: CharaCreationState;
}) {
  (document.getElementById('new-chara-name') as HTMLInputElement).value =
    'TestHero';

  ConfirmButtonClicked(scene, state);
}

async function startGame(scn: Phaser.Scene) {
  newgamebtn
    .NewGameButtonClicked_(scn)
    .emit({ scene: scn, state: initialState });
}

function clickCell(scn: Phaser.Scene, x: number, y: number) {
  mapEvents()
    .CellClicked(scn)
    .emit({
      // TODO: have props curried
      scene: scn,
      state: initialBattlefieldState,
      tile: { x, y },
      pointer: { x: 200, y: 400 },
    });
}

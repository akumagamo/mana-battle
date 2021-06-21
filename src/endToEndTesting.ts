import CharaCreationScene from "./CharaCreation/CharaCreationScene";
import { MapScene } from "./Map/MapScene";
import TitleScene from "./Scenes/Title/TitleScene";
import { initialState } from "./Scenes/Title/Model";
import * as newgamebtn from "./Scenes/Title/events/newgamebtn";
import ConfirmButtonClicked from "./CharaCreation/events/ConfirmButtonClicked";
import { CharaCreationState } from "./CharaCreation/Model";
import mapEvents from "./Map/events";

const assert = <A>(condition: string, a: A, b: A) => {
  if (a !== b)
    throw new Error(
      `❌ ${condition} - ${a.toString()} should equals ${b.toString()}`
    );
  else console.log("✅", condition);
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

  // const mapScene = (await event(game.events)("MapSceneCreated")) as MapScene;

  // const squad = mapScene.state.squads.find(
  //   (sqd) => sqd.squad.force === PLAYER_FORCE
  // );
  // clickCell(mapScene, 3, 5);
  // mapScene.evs.MovePlayerSquadButonClicked.emit({
  //   mapScene: mapScene,
  //   mapSquad: squad,
  // });
  // assert("MapScene is paused after clicking 'Move'", mapScene.isPaused, true);

  // clickCell(mapScene, 7, 5);

  // mapScene.evs.SquadDispatched.once((_id) => {
  //   assert(
  //     "MapScene is no longer paused selecting move destination",
  //     mapScene.isPaused,
  //     false
  //   );
  // });

  // mapScene.evs.SquadArrivedInfoMessageCompleted.once((chara) => {
  //   mapScene.evs.CloseSquadArrivedInfoMessage.emit(chara);

  //   mapScene.evs.MovePlayerSquadButonClicked.emit({
  //     mapScene: mapScene,
  //     mapSquad: squad,
  //   });

  //   mapScene.evs.OrganizeButtonClicked.emit(mapScene);
  // });
}

async function getCharaCreationScene(game: Phaser.Game) {
  return (await event(game.events)("CharaCreationSceneCreated")) as {
    scene: CharaCreationScene;
    state: CharaCreationState;
  };
}

async function getTitleScene(game: Phaser.Game) {
  return (await event(game.events)("TitleSceneCreated")) as TitleScene;
}

async function createCharacter({
  scene,
  state,
}: {
  scene: Phaser.Scene;
  state: CharaCreationState;
}) {
  (document.getElementById("new-chara-name") as HTMLInputElement).value =
    "TestHero";

  ConfirmButtonClicked(scene, state);
}

async function startGame(scn: Phaser.Scene) {
  newgamebtn
    .NewGameButtonClicked_(scn)
    .emit({ scene: scn, state: initialState });
}

function clickCell(scn: MapScene, x: number, y: number) {
  mapEvents.CellClicked(scn).emit({
    tile: { x, y },
    pointer: { x: 200, y: 400 },
  });
}

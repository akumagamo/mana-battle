import { Map, Set } from "immutable";
import { GAME_SPEED } from "../env";
import { createUnitSquadIndex, getUnitSquad } from "../Squad/Model";
import { fadeIn } from "../UI/Transition";
import { UnitIndex } from "../Unit/Model";
import { enableMapInput } from "./board/input";
import renderMap from "./board/renderMap";
import renderSquads from "./board/renderSquads";
import renderStructures from "./board/renderStructures";
import { makeWorldDraggable, setWorldBounds } from "./dragging";
import destroySquad from "./events/destroySquad";
import { getMapSquad, MapState } from "./Model";
import markSquadForRemoval from "./squads/markSquadForRemoval";
import pushSquad from "./squads/pushSquad";
import startCombat from "./squads/startCombat";
import subscribe from "./subscribe";
import { refreshUI } from "./ui";
import update from "./update";
import { checkCollision } from "./update/checkCollision";

export default async (scene: Phaser.Scene, state: MapState) => {
  subscribe(scene, state);

  scene.events.on("PushLosingSquads", async () => {
    await pushSquad(scene, state);
    state.isPaused = false;
  });

  scene.input.mouse.disableContextMenu();

  scene.events.on("update", () => {
    update(scene, state);
  });

  if (process.env.SOUND_ENABLED) {
    scene.sound.stopAll();
    const music = scene.sound.add("map1");

    //@ts-ignore
    music.setVolume(0.3);
    music.play();
  }

  state.mapContainer = scene.add.container(state.mapX, state.mapY);
  state.uiContainer = scene.add.container();
  state.missionContainer = scene.add.container();

  renderMap(scene, state);
  renderStructures(scene, state);
  renderSquads(scene, state);

  await fadeIn(scene, 1000 / GAME_SPEED);

  makeWorldDraggable(scene, state);
  setWorldBounds(state);

  await Promise.all(state.squadsToRemove.map((id) => destroySquad(state, id)));
  state.squadsToRemove = Set();

  // if (!scene.hasShownVictoryCondition) {
  //   victoryCondition(scene);
  //   scene.hasShownVictoryCondition = true;
  // }

  await pushSquad(scene, state);

  if (state.squadToPush) {
    const collided = checkCollision(state)(state.squadToPush.loser);
    if (collided) {
      const sqd = state.unitSquadIndex.get(collided.id);
      if (sqd)
        startCombat(
          scene,
          state,
          getMapSquad(state, state.squadToPush.loser),
          getMapSquad(state, sqd)
        );
    }

    state.squadToPush = null;
  }

  enableMapInput(scene, state);
  state.isPaused = false;

  refreshUI(scene, state);

  scene.game.events.emit("BattlefieldSceneCreated", { scene, state });
};

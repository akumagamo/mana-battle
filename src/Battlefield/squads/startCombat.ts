import createBoard from "../../Board/createBoard";
import { PLAYER_FORCE, SCREEN_WIDTH, SCREEN_HEIGHT } from "../../constants";
import { GAME_SPEED } from "../../env";
import { delay } from "../../Scenes/utils";
import panel from "../../UI/panel";
import speech from "../../UI/speech";
import { disableMapInput } from "../board/input";
import { MapScene } from "../MapScene";
import { MapSquad, getSquadUnits, getSquadLeader } from "../Model";
import { destroyUI } from "../ui";
import attack from "./attack";

export default async function (
  scene: MapScene,
  squadA: MapSquad,
  squadB: MapSquad,
  direction: string
) {
  const baseX = 500;
  const baseY = 300;
  const scale = 0.5;

  const playerSquad = [squadA, squadB].find(
    (sqd) => sqd.squad.force === PLAYER_FORCE
  );

  disableMapInput(scene);
  destroyUI(scene);

  const bg = panel(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, scene.uiContainer, scene);
  bg.setAlpha(0.4);

  const leader = getSquadLeader(scene.state, playerSquad.id);

  const enemyUnits = getSquadUnits(scene.state, squadB.id);

  const { board: enemy } = createBoard(
    scene,
    squadB.squad,
    enemyUnits,
    baseX + 10,
    baseY + 5,
    scale,
    true
  );

  const alliedUnits = scene.state.units.filter((u) => u.squad === squadA.id);

  const { board: ally } = createBoard(
    scene,
    squadA.squad,
    alliedUnits,
    baseX + 200,
    baseY + 100,
    scale,
    false
  );

  const { portrait } = await speech(
    leader,
    450,
    70,
    "Ready for Combat",
    scene.uiContainer,
    scene,
    GAME_SPEED
  );

  await delay(scene, 3000 / GAME_SPEED);

  portrait.destroy();

  ally.destroy();
  enemy.destroy();

  attack(scene, squadA, squadB, direction);
}

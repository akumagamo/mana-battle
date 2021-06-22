import { Vector } from "matter";
import stand from "../../Chara/animations/stand";
import { screenToCellPosition } from "../board/position";
import SquadArrivedInfoMessageCompleted from "../events/SquadArrivedInfoMessageCompleted";
import { MapScene } from "../MapScene";
import { getChara, MapSquad } from "../Model";
import speak from "../rendering/speak";

export default async function (
  scene: MapScene,
  path: Vector[],
  squad: MapSquad
) {
  const [, ...remaining] = path;

  if (remaining.length > 0) {
    scene.squadsInMovement = scene.squadsInMovement.set(squad.id, {
      path: remaining,
      squad,
    });
  } else {
    scene.squadsInMovement = scene.squadsInMovement.delete(squad.id);

    const isCity = scene.state.cities.some((city) => {
      const { x, y } = screenToCellPosition(squad.pos);

      return city.x === x && city.y === y;
    });

    scene.state.squads = scene.state.squads.update(squad.id, (sqd) => ({
      ...sqd,
      status: isCity ? "guarding_fort" : "standing",
    }));

    const chara = getChara(scene, squad.id);
    stand(chara);
    const portrait = await speak(scene, squad);

    SquadArrivedInfoMessageCompleted(scene).emit(portrait);
  }
}

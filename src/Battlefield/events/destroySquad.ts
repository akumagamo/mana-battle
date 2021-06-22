import fadeOutChara from "../../Chara/animations/fadeOutChara";
import { MapScene } from "../MapScene";

export default async function (scene: MapScene, id: string) {
  const chara = await scene.getChara(id);

  await fadeOutChara(chara);

  await removeSquadFromState(scene, id);
}

async function removeSquadFromState(scene: MapScene, id: string) {
  scene.state.forces = scene.state.forces.map((force) => ({
    ...force,
    squads: force.squads.filter((s) => s !== id),
  }));

  const squadId = scene.state.squads.find((s) => s.id === id).id;

  scene.state.dispatchedSquads = scene.state.dispatchedSquads.remove(id);

  scene.state.squads = scene.state.squads.filter((s) => s.id !== id);
  scene.state.units = scene.state.units.filter((u) => u.squad !== squadId);

  const chara = await scene.getChara(id);
  chara.destroy();

  scene.charas = scene.charas.filter((c) => c.props.unit.squad !== id);
}

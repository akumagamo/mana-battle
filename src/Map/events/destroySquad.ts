import fadeOutChara from "../../Chara/animations/fadeOutChara";
import { MapScene } from "../MapScene";

export default async function (scene: MapScene, id: string) {
  const chara = await scene.getChara(id);

  await fadeOutChara(chara);

  await scene.removeSquadFromState(id);
}

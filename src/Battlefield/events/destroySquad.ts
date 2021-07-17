import fadeOutChara from "../../Chara/animations/fadeOutChara";
import { getChara, MapState } from "../Model";

export default async function (state: MapState, id: string) {
  const chara = getChara(state, id);

  await fadeOutChara(chara);

  await removeSquadFromState(state, id);
}

async function removeSquadFromState(state: MapState, id: string) {
  const chara = getChara(state, id);
  chara.destroy();
  state.charas = state.charas.filter(
    (c) => state.unitSquadIndex.get(c.props.unit.id) !== id
  );

  state.units = state.units.filter(
    (u) => state.unitSquadIndex.get(u.id) !== id
  );

  state.squads = state.squads.filter((s) => s.id !== id);

  state.dispatchedSquads = state.dispatchedSquads.remove(id);

  state.squadsInMovement = state.squadsInMovement.delete(id);

  state.forces = state.forces.map((force) => ({
    ...force,
    squads: force.squads.filter((s) => s !== id),
  }));

  state.squadToPush = null;
}

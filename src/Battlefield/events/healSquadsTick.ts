import healByPercentage from "../../Unit/heal/healByPercentage";
import { getSquadUnits, MapState } from "../Model";

export function healSquads(state: MapState) {
  state.squads
    .filter((sqd) => sqd.status === "guarding_fort")
    .forEach((sqd) => {
      getSquadUnits(state, sqd.id)
        .map((u) => healByPercentage(u, 10))
        .forEach((u) => {
          state.units = state.units.set(u.id, u);
        });
    });
}

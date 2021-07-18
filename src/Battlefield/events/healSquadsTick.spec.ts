import map from "../../maps/green_harbor";
import { getSquadUnits, MapSquadStatus } from "../Model";
import { healSquads } from "./healSquadsTick";

it("Should heal injuried units in towns", () => {
  let state = map();

  state = {
    ...state,
    units: state.units.merge(
      getSquadUnits(state, "squad1").map((u) => ({ ...u, currentHp: 10 }))
    ),
    squads: state.squads.update("squad1", (sqd) => ({
      ...sqd,
      status: "guarding_fort" as MapSquadStatus,
    })),
  };
  healSquads(state);

  getSquadUnits(state, "squad1").forEach((u) => {
    expect(u.currentHp).toEqual(18);
  });
});

it("Should not heal injuried units in squads not guarding towns", () => {
  let state = map();

  state = {
    ...state,
    units: state.units.merge(
      getSquadUnits(state, "squad1").map((u) => ({ ...u, currentHp: 10 }))
    ),
    squads: state.squads.update("squad1", (sqd) => ({
      ...sqd,
      status: "moving" as MapSquadStatus,
    })),
  };
  healSquads(state);

  getSquadUnits(state, "squad1").forEach((u) => {
    expect(u.currentHp).toEqual(10);
  });
});

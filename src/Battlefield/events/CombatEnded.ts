import { Map } from "immutable";
import { createUnitSquadIndex, getUnitSquad } from "../../Squad/Model";
import { UnitIndex } from "../../Unit/Model";
import { createEvent } from "../../utils";
import { getMapSquad, MapState } from "../Model";
import markSquadForRemoval from "../squads/markSquadForRemoval";

export const key = "CombatEnded";

export default (scene: Phaser.Scene) =>
  createEvent<{ units: UnitIndex; squadDamage: Map<string, number> }>(
    scene.events,
    key
  );

export const combatEnded = (state: MapState) => ({
  units,
  squadDamage,
}: {
  units: UnitIndex;
  squadDamage: Map<string, number>;
}) => {
  let squadsTotalHP = units.reduce((xs, unit) => {
    const sqds = state.squads.map((s) => s.squad);
    let sqdId = getUnitSquad(unit.id, sqds, createUnitSquadIndex(sqds)).id;

    if (!xs[sqdId]) {
      xs[sqdId] = 0;
    }

    xs[sqdId] += unit.currentHp;

    return xs;
  }, {} as { [x: string]: number });

  state.units = state.units.merge(units);

  Map(squadsTotalHP)
    .filter((v) => v === 0)
    .keySeq()
    .forEach((target) => markSquadForRemoval(state, target));

  const sortedSquads = squadDamage.sort().keySeq();

  const loser = getMapSquad(state, sortedSquads.first());

  const winner = getMapSquad(state, sortedSquads.last());

  const direction = () => {
    if (winner.posScreen.x < loser.posScreen.x) return "right";
    else if (winner.posScreen.x > loser.posScreen.x) return "left";
    else if (winner.posScreen.y < loser.posScreen.y) return "bottom";
    else if (winner.posScreen.y > loser.posScreen.y) return "top";
    else return "top";
  };

  state.squadToPush = {
    loser: loser.id,
    direction: direction(),
  };
};

import * as Unit from "../../Unit/Model";
import * as Squad from "../../Squad/Model";
import { INVALID_STATE } from "../../errors";
import { displayXPCmd } from "./turns";

export function calcXp(
    squadIndex: Squad.SquadIndex,
    units: Unit.UnitIndex,
    unitSquadIndex: Squad.UnitSquadIndex) {
    const squadXp = squadIndex.map((squad) => {
        const enemyUnits = Squad.getSquadUnits(squad.id, units, unitSquadIndex);

        const deadEnemies = enemyUnits
            .map((u) => (u.currentHp < 1 ? 1 : 0))
            .reduce((xs, x) => xs + x, 0);

        const xpAmount = deadEnemies * 40;

        return { squadId: squad.id, xpAmount };
    });

    const MAX_XP = 100;

    const unitsWithXp = units.map((unit) => {
        const unitSquad = Squad.getUnitSquad(
            unit.id,
            squadIndex,
            unitSquadIndex
        );

        const xp = squadXp.get(unitSquad.id);
        if (!xp)
            throw new Error(INVALID_STATE);

        const { xpAmount } = xp;

        if (xpAmount < 1)
            return { xp: 0, lvls: 0, unit };

        const newXp = unit.exp + xpAmount;

        const lvls = Math.floor(newXp / MAX_XP);

        return {
            unit: {
                ...unit,
                lvl: unit.lvl + lvls,
                xp: newXp,
            },

            xp: xpAmount,
            lvls,
        };
    });

    const xps = unitsWithXp
        .filter(({ xp, lvls }) => xp > 0 || lvls > 0)
        .map(({ unit, xp, lvls }) => ({ id: unit.id, xp, lvls }))
        .toList();

    return {
        unitsWithXp,
        cmds: xps.size > 0 ? [displayXPCmd(xps)] : [],
    };
}

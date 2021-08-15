import { random } from "../../utils/random"
import { Skill } from "./Skills"

export const slash: Skill = {
    id: "slash",
    name: "Slash",
    elem: "neutral",
    formula: (unit) => {
        // const items = getItemsFromDB();
        // const weapon = items.get( unit.equips.mainHand );
        // const str = getActualStat('str', items, unit);
        // const dex = getActualStat('dex', items, unit);
        // return str + dex / 4 + weapon.modifiers.atk;
        return random(11, 14)
    },
}

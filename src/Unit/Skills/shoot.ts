import { Skill } from "./Skills";

export const shoot: Skill = {
  id: "shoot",
  name: "Shoot",
  elem: "neutral",
  formula: (unit) => {
    // const items = getItemsFromDB();
    // const weapon = items.get( unit.equips.mainHand );
    // const str = getActualStat('str', items, unit);
    // const dex = getActualStat('dex', items, unit);
    // return str + dex / 4 + weapon.modifiers.atk;
    return 3;
  },
};

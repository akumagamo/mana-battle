import {getItemFromDB} from "../DB";
import {Unit} from "./Model";

const mods = (unit: Unit) => getItemFromDB(unit.equips.mainHand).modifiers;
export const atk = (unit: Unit) => mods(unit).atk;
export const mAtk = (unit: Unit) => mods(unit).m_atk;
export const attrMod = (attr: number) => Math.floor((attr - 10) / 2);


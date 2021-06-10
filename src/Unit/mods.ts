import {Unit} from "./Model";

const mods = (unit: Unit) => ({atk: 2, m_atk: 2}) ;
export const atk = (unit: Unit) => mods(unit).atk;
export const mAtk = (unit: Unit) => mods(unit).m_atk;
export const attrMod = (attr: number) => Math.floor((attr - 10) / 2);


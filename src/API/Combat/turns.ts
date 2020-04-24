import {Unit} from "../../Unit/Model"


const sortInitiative = (unit:Unit) =>unit.dex + unit.agi 

export const initiativeList = (units:Unit[])=>{
  return units.sort((a,b)=>sortInitiative(b) - sortInitiative(a))
}


import {Unit} from "../../Unit/Model";
import {random} from "../../utils";


export const makeUnit =(override:any):Unit =>{

  return {
    id: random(0, 999999).toString(),
    ...override
  }
}

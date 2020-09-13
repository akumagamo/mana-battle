import {INVALID_STATE} from "../../errors";
import {MapState} from "./Model";


export function getCity(cityId:string, mapState:MapState){

  let city =  mapState.cities.find(city=>city.id === cityId)

  if(!city)
    throw new Error(INVALID_STATE)

  return city

}

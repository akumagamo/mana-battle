import {Map, Set} from "immutable";
import { items } from "../defaultData";
import { ListSquadsScene } from "./ListSquadsScene";
import { getActualStat } from "./Model";
import { fromJSON } from "./serializer";

it.todo('Disables the "Create Squad" button if all units have squads');

it("works", () => {
  const scn = new ListSquadsScene();
  //@ts-ignore
  scn.cameras = {main: {fadeIn: jest.fn()}}

  scn.create({squads: Map(), units: Map(), dispatched: Set(), onReturnClick: ()=>{}})
});

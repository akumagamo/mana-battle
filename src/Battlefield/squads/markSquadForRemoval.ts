import { MapState } from '../Model';

export default function (state: MapState, id: string) {
  state.squadsToRemove = state.squadsToRemove.add(id);
}

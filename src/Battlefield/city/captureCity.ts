import { MapState } from '../Model';

export default function (
  state: MapState,
  cmd: {
    type: 'CAPTURE_CITY';
    id: string;
    force: string;
  }
) {
  state.cities = state.cities.map((city) =>
    city.id === cmd.id ? { ...city, force: cmd.force } : city
  );
}

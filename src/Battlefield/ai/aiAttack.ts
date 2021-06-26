import { Vector } from 'matter';
import { PLAYER_FORCE } from '../../constants';
import { getPathTo } from '../api';
import { screenToCellPosition } from '../board/position';
import {
  getForceCities,
  getForceSquads,
  getMapSquad,
  MapState,
} from '../Model';
import moveSquadTo from '../squads/moveSquadTo';

export default function (scene: Phaser.Scene, state: MapState) {
  state.ai = state.ai.map((cmd, eid) => {
    if (cmd === 'DEFEND') {
      return cmd;
    } else if (cmd === 'ATTACK') {
      const squad = getMapSquad(state, eid);
      const cities = getForceCities(state, PLAYER_FORCE);

      const distances = cities
        .map((city) => {
          const path = getPathTo(state.cells)(screenToCellPosition(squad.pos))({
            x: city.x,
            y: city.y,
          });

          const [x, y] = path[path.length - 1];

          return { id: city.id, target: { x, y }, distance: path.length };
        })
        .sort((a, b) => a.distance - b.distance);

      if (distances.length < 1) return;

      const [target] = distances;

      moveSquadTo(scene, state, squad.id, target.target);

      return 'MOVING';
    }
  });
}

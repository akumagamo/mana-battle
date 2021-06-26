import { Vector } from 'matter';
import { PLAYER_FORCE } from '../../constants';
import { getPathTo } from '../api';
import { screenToCellPosition } from '../board/position';
import { getForceSquads, getMapSquad, MapState } from '../Model';
import moveSquadTo from '../squads/moveSquadTo';

export default function (scene: Phaser.Scene, state: MapState) {
  state.ai = state.ai.map((cmd, eid) => {
    if (cmd === 'DEFEND') {
      return cmd;
    } else if (cmd === 'ATTACK') {
      const squad = getMapSquad(state, eid);
      const sqds = getForceSquads(state, PLAYER_FORCE);
      const distances = sqds
        .map((sqd) => {
          const path = getPathTo(state.cells)(screenToCellPosition(squad.pos))(
            screenToCellPosition(sqd.pos)
          );

          const [x, y] = path[path.length - 1];

          return { id: sqd.id, target: { x, y }, distance: path.length };
        })
        .sort((a, b) => a.distance - b.distance);

      if (distances.size < 1) return;

      const target = (distances.first() as unknown) as {
        id: string;
        target: Vector;
        distance: number;
      };

      moveSquadTo(scene, state, squad.id, target.target);

      return 'MOVING';
    }
  });
}

import { SquadRecord } from '../../Squad/Model';
import { Board } from '../Model';

export default (board: Board, fn: (sqd: SquadRecord) => void) => {
  const width = board.tiles[0].sprite.width * board.scale * 3;
  const height = board.tiles[0].sprite.height * board.scale * 3;
  var clickZone = board.scene.add.zone(
    board.x - width / 2,
    board.y - height / 2,
    width,
    height + height / 3
  );
  clickZone.setInteractive();
  clickZone.setOrigin(0);
  clickZone.on(`pointerup`, () => {
    fn(board.squad);
  });

  //debugCreateOverlay(board);
};

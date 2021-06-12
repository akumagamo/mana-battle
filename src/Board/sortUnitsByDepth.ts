import { StaticBoard } from './Model';

export default (board: StaticBoard) => {
  board.unitList.forEach((chara) =>
    chara.container.setDepth(chara.container?.y)
  );

  board.unitList.sort((a, b) => a.container.depth - b.container.depth);
};

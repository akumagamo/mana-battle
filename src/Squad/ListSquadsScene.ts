import * as Phaser from 'phaser';
import {preload} from '../preload';
import {Squad} from '../Squad/Model';
import {getSquads} from '../DB';
import BoardScene from '../Board/StaticBoardScene';

export class ListSquadsScene extends Phaser.Scene {
  boardScenes: BoardScene[];

  constructor() {
    super('ListSquadsScene');
    console.log('ListSquadScene constructor');
    this.boardScenes = [];
  }

  preload = preload;

  create() {
    const squads = getSquads();

    console.log(`===SQUADS===`);
    console.table(Object.values(squads));

    const rows = this.formatList(Object.values(squads), []);

    rows.forEach((row, y) =>
      row.forEach((col, x) => this.renderBoard(col, x, y)),
    );

    this.renderReturnBtn();
  }

  formatList(squads: Squad[], accumulator: Squad[][]): Squad[][] {
    const cols = 3;
    if (squads.length <= cols) {
      return accumulator.concat([squads]);
    } else {
      const slice = squads.slice(0, cols);
      return this.formatList(
        squads.slice(cols, squads.length),
        accumulator.concat([slice]),
      );
    }
  }

  renderBoard(squad: Squad, x: number, y: number) {
    const boardScene = new BoardScene(squad, x * 300, y * 200, 0.3);
    this.scene.add(`board-squad-${squad.id}`, boardScene, true);

    this.boardScenes.push(boardScene);
  }

  renderReturnBtn() {
    console.log('Rendering return btn');

    const btn = this.add.text(1100, 10, 'Return to title');
    btn.setInteractive();
    btn.on('pointerdown', () => {
      this.scene.transition({
        target: 'TitleScene',
        duration: 0,
        moveBelow: true,
      });
    });
  }
}

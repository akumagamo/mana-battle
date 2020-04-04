import * as Phaser from 'phaser';
import {preload} from '../preload';
import {Squad} from '../Squad/Model';
import {getSquads} from '../DB';
import BoardScene from '../Board/InteractiveBoardScene';

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

    Object.values(squads).forEach((squad, index) =>
      this.renderBoard(squad, index),
    );

    this.renderReturnBtn();
  }


  renderBoard(squad: Squad, index: number) {
    const boardScene = new BoardScene(squad);
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

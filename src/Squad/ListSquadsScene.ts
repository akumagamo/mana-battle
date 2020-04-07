import * as Phaser from 'phaser';
import {preload} from '../preload';
import {Squad} from '../Squad/Model';
import {getSquads, getSquad} from '../DB';
import BoardScene from '../Board/StaticBoardScene';
import {Container} from '../Models';

export class ListSquadsScene extends Phaser.Scene {
  boardScenes: BoardScene[];
  selectedSquadInfo: Container | null;

  constructor() {
    super('ListSquadsScene');
    this.boardScenes = [];
    this.selectedSquadInfo = null;
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

    this.renderControls();
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

  renderSelectSquadInfo(squad: Squad) {
    if (this.selectedSquadInfo) this.selectedSquadInfo.destroy();

    this.selectedSquadInfo = this.add.container(0, 0);

    const squadLeader = this.add.text(10, 680, squad.name);
    this.selectedSquadInfo.add(squadLeader);

    const editBtn = this.add.text(400, 680, 'Edit');
    editBtn.setInteractive();
    editBtn.on(`pointerdown`, () => {
      this.editSquad(squad);
    });
    this.selectedSquadInfo.add(editBtn);
  }

  renderBoard(squad: Squad, x: number, y: number) {
    const boardScene = new BoardScene(squad, x * 320, y * 220, 0.3);
    this.scene.add(`board-squad-${squad.id}`, boardScene, true);

    boardScene.onClick((sqd) => this.renderSelectSquadInfo(sqd));

    this.boardScenes.push(boardScene);
  }

  renderControls() {
    console.log('Rendering return btn');

    const btn = this.add.text(1100, 10, 'Return to title');
    btn.setInteractive();
    btn.on('pointerdown', () => {

      this.removeChildren();

      this.scene.transition({
        target: 'TitleScene',
        duration: 0,
        moveBelow: true,
      });
    });

    const createSquad = this.add.text(1100, 600, 'Create Squad');
    createSquad .setInteractive();
    createSquad .on('pointerdown', () => {

      this.removeChildren();
      this.scene.transition({
        target: 'CreateSquadScene',
        duration: 0,
        moveBelow: true,
      });
    });

  }
  removeChildren(){
    this.boardScenes.forEach((scene) => {
      scene.destroy(this);
    });
  }

  editSquad(squad: Squad) {
  
    this.removeChildren();

    this.scene.transition({
      target: 'EditSquadScene',
      duration: 0,
      moveBelow: true,
      data: {squad},
    });
  }
}

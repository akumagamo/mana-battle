import * as Phaser from 'phaser';
import {preload} from '../preload';
import {Squad} from '../Squad/Model';
import {getSquads, getSquad} from '../DB';
import BoardScene from '../Board/StaticBoardScene';
import {Container, Pointer, Image} from '../Models';

export class ListSquadsScene extends Phaser.Scene {
  boardScenes: BoardScene[] = [];
  controls: Image[] = [];
  selectedSquadInfo: Container | null = null;
  page: number = 0;
  itemsPerPage: number = 9;

  constructor() {
    super('ListSquadsScene');
  }

  preload = preload;

  create() {
    this.renderSquadList();
    this.renderControls();
  }

  renderSquadList() {
    const squads = Object.values(getSquads()).slice(
      this.page * this.itemsPerPage,
      this.page * this.itemsPerPage + this.itemsPerPage,
    );

    console.log(`===SQUADS===`);
    console.table(squads);

    const rows = this.formatList(squads, []);

    rows.forEach((row, y) =>
      row.forEach((col, x) => this.renderBoard(col, x, y)),
    );
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
    createSquad.setInteractive();
    createSquad.on('pointerdown', () => {
      this.removeChildren();

      const squads = Object.keys(getSquads());
      this.scene.transition({
        target: 'EditSquadScene',
        duration: 0,
        moveBelow: true,
        data: {
          squad: {
            id: (squads.length + 1).toString(),
            name: '',
            emblem: '',
            members: {},
          },
        },
      });
    });

    this.renderNavigation();
  }
  renderNavigation() {
    const squads = getSquads();

    const totalSquads = Object.keys(squads).length;

    const next = this.add.image(400, 630, 'arrow_right');

    const isLastPage =
      totalSquads < this.itemsPerPage ||
      this.itemsPerPage * (this.page + 1) >= totalSquads;

    if (!isLastPage) {
      next.setInteractive();
      next.on('pointerdown', () => {
        this.nextPage();
      });
    } else {
      next.setAlpha(0.5);
    }

    const prev = this.add.image(300, 630, 'arrow_right');
    prev.setScale(-1, 1);

    if (this.page === 0) {
      prev.setAlpha(0.5);
    } else {
      prev.setInteractive();
      prev.on('pointerdown', (_: Pointer) => {
        this.prevPage();
      });
    }

    this.controls = [next, prev];
  }

  nextPage() {
    this.page = this.page + 1;
    this.removeChildren();
    this.renderSquadList();
    this.renderControls();
  }

  prevPage() {
    this.page = this.page - 1;
    this.removeChildren();
    this.renderSquadList();
    this.renderControls();
  }

  removeChildren() {
    this.boardScenes.forEach((scene) => {
      scene.destroy(this);
    });
    this.controls.forEach((control) => control.destroy());
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

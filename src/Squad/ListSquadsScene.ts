import * as Phaser from 'phaser';
import {preload} from '../preload';
import {Squad} from '../Squad/Model';
import * as api from '../DB';
import BoardScene from '../Board/StaticBoardScene';
import {Container, Pointer, Image, Text} from '../Models';
import button from '../UI/button';

export class ListSquadsScene extends Phaser.Scene {
  boardScenes: BoardScene[] = [];
  controls: (Image | Text)[] = [];
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
    const squads = Object.values(api.getSquads()).slice(
      this.page * this.itemsPerPage,
      this.page * this.itemsPerPage + this.itemsPerPage,
    );

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

    this.selectedSquadInfo?.destroy();
    this.selectedSquadInfo = this.add.container(0, 0);
    this.selectedSquadInfo.name = squad.id;

    const squadLeader = this.add.text(10, 680, squad.name);
    this.selectedSquadInfo.add(squadLeader);

    button(1100, 350, 'Edit', this.selectedSquadInfo, this, () => {
      this.editSquad(squad);
    });

    button(1100, 400, 'Disband Squad', this.selectedSquadInfo, this, () => {
      if (this.selectedSquadInfo) {
        api.disbandSquad(this.selectedSquadInfo.name);
        this.refresh();
      }
    });
  }

  renderBoard(squad: Squad, x: number, y: number) {
    const boardScene = new BoardScene(squad, x * 320, y * 170, 0.3);
    this.scene.add(`board-squad-${squad.id}`, boardScene, true);

    boardScene.onClick((sqd) => this.renderSelectSquadInfo(sqd));

    this.boardScenes.push(boardScene);
  }

  renderControls() {
    button(1100, 10, 'Return to Title', this.add.container(0, 0), this, () => {
      this.removeChildren();
      this.scene.transition({
        target: 'TitleScene',
        duration: 0,
        moveBelow: true,
      });
    });

    button(1100, 600, 'Create Squad', this.add.container(0, 0), this, () => {
      this.removeChildren();

      const squads = Object.keys(api.getSquads());
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
    const squads = api.getSquads();

    const totalSquads = Object.keys(squads).length;

    const prev = this.add.image(400, 630, 'arrow_right');
    prev.setScale(-1, 1);

    if (this.page === 0) {
      prev.setAlpha(0.5);
    } else {
      prev.setInteractive();
      prev.on('pointerdown', (_pointer: Pointer) => {
        this.prevPage();
      });
    }

    this.controls.push(prev);

    const next = this.add.image(500, 630, 'arrow_right');

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

    this.controls.push(next);
  }

  refresh() {
    this.removeChildren();
    this.renderSquadList();
    this.renderControls();
  }

  nextPage() {
    this.page = this.page + 1;
    this.refresh();
  }

  prevPage() {
    this.page = this.page - 1;
    this.refresh();
  }

  removeChildren() {
    this.boardScenes.forEach((scene) => {
      scene.destroy(this);
    });
    this.boardScenes = [];
    this.controls.forEach((control) => control.destroy());
    this.controls = [];
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

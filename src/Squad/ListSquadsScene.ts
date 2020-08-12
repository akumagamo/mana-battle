import * as Phaser from 'phaser';
import {Squad} from '../Squad/Model';
import * as api from '../DB';
import BoardScene from '../Board/StaticBoardScene';
import {Pointer, Image, Text} from '../Models';
import button from '../UI/button';
import panel from '../UI/panel';
import {SCREEN_WIDTH} from '../constants';
import text from '../UI/text';
import S from 'sanctuary';
import menu from '../Backgrounds/menu';
export class ListSquadsScene extends Phaser.Scene {
  boardScenes: BoardScene[] = [];
  controls: (Image | Text)[] = [];
  page: number = 0;
  itemsPerPage: number = 16;

  constructor() {
    super('ListSquadsScene');
  }

  create() {

    menu(this)
    const squads = this.getSquads();

    this.renderSquadList(squads);
    this.renderControls();
    this.selectSquad(squads[0]);
  }

  getSquads() {
    return Object.values(api.getSquads()).slice(
      this.page * this.itemsPerPage,
      this.page * this.itemsPerPage + this.itemsPerPage,
    );
  }
  renderSquadList(squads:Squad[]) {
    const rows = this.formatList(squads, []);

    rows.forEach((row, y) =>
      row.forEach((col, x) => this.renderBoard(col, x, y)),
    );
  }

  formatList(squads: Squad[], accumulator: Squad[][]): Squad[][] {
    const cols = 4;
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
    const container = this.add.container(0, 670);
    const panel_ = panel(0, 0, SCREEN_WIDTH, 100, container, this);
    container.add([panel_]);

    text(10, 10, squad.name, container, this);

    button(200, 10, 'Edit', container, this, () => {
      this.editSquad(squad);
    });

    button(1000, 10, 'Disband Squad', container, this, () => {
      api.disbandSquad(squad.id);
      container.destroy();
      this.refresh();
    });
  }

  renderBoard(squad: Squad, x: number, y: number) {
    const BOARD_X = x * 250;
    const BOARD_Y = y * 130;
    const boardScene = new BoardScene(squad, BOARD_X, BOARD_Y, 0.3);
    this.scene.add(`board-squad-${squad.id}`, boardScene, true);

    boardScene.onClick((sqd) => {
      this.selectSquad(sqd);
    });

    this.boardScenes.push(boardScene);
  }

  squadSceneIO(id: string, fn: (board: BoardScene) => void) {
    const scene = S.find<BoardScene>((e) => e.squad.id === id)(
      this.boardScenes,
    );

    S.map<BoardScene, void>((board) => {
      fn(board);
    })(scene);
  }
  selectSquad(sqd: Squad) {
    this.squadSceneIO(sqd.id, (squadScene) => {
      this.renderSelectSquadInfo(sqd);
      this.boardScenes
        .filter((scene) => scene.isSelected)
        .forEach((scene) => scene.deselect());
      squadScene.select();
    });
  }

  renderControls() {
    button(1000, 10, 'Return to Title', this.add.container(0, 0), this, () => {
      this.removeChildren();
      this.scene.transition({
        target: 'TitleScene',
        duration: 0,
        moveBelow: true,
      });
    });

    button(1000, 600, 'Create Squad', this.add.container(0, 0), this, () => {
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

    const NAV_X = 500;
    const NAV_Y = 620;

    const totalSquads = Object.keys(squads).length;

    const prev = this.add.image(NAV_X, NAV_Y, 'arrow_right');
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

    const next = this.add.image(NAV_X + 100, NAV_Y, 'arrow_right');

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

    const squads = this.getSquads();
    this.removeChildren();
    this.renderSquadList(squads);
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

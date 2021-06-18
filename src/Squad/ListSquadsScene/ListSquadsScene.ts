import { List, Map, Set } from 'immutable';
import menu from '../../Backgrounds/menu';
import createStaticBoard from '../../Board/createBoard';
import onBoardClicked from '../../Board/events/onBoardClicked';
import onBoardDeselected from '../../Board/events/onBoardDeselected';
import onBoardSelected from '../../Board/events/onBoardSelected';
import { Board } from '../../Board/Model';
import { SCREEN_WIDTH, PLAYER_FORCE } from '../../constants';
import { GAME_SPEED } from '../../env';
import { Container, Pointer } from '../../Models';
import button from '../../UI/button';
import panel from '../../UI/panel';
import text from '../../UI/text';
import { Unit, UnitIndex } from '../../Unit/Model';
import { SceneEventFactory } from '../../utils';
import EditSquadModal, {
  EditSquadModalEvents,
} from '../EditSquadModal/createEditSquadModal';
import * as Squad from '../Model';
import { Chara } from '/Users/leonardofarroco/dev/mana-phaser/src/Chara/Model';

type CreateParams = {
  squads: Squad.Index;
  units: UnitIndex;
  onReturnClick: (scene: ListSquadsScene) => void;
  dispatched: Set<string>;
};

export const key = 'ListSquadsScene';

export const run = (
  params: CreateParams,
  scene: Phaser.Scenes.SceneManager
) => {
  scene.run(key, params);
};

export class ListSquadsScene extends Phaser.Scene {
  evs = {
    SquadEditClicked: SceneEventFactory<Squad.SquadRecord>(
      this,
      'SquadEditClicked'
    ),
    CreateSquadClicked: SceneEventFactory<null>(this, 'CreateSquadClicked'),
    ConfirmButtonClicked: SceneEventFactory<null>(this, 'ConfirmButtonClicked'),
  };

  boards: Board[] = [];
  page: number = 0;
  itemsPerPage: number = 16;
  squads = Map() as Squad.Index;
  units = Map() as UnitIndex;
  dispatched: Set<string> = Set();
  onReturnClick: (scene: ListSquadsScene) => void | null = null;
  inputEnabled = true;
  uiContainer: Container | null = null;
  editSquadModalEvents: EditSquadModalEvents;

  constructor() {
    super(key);
  }

  init() {
    this.evs.SquadEditClicked.on(this.handleSquadEditClicked.bind(this));
    this.evs.CreateSquadClicked.on(this.handleCreateSquadClicked.bind(this));
    this.evs.ConfirmButtonClicked.on(
      this.handleOnConfirmButtonClicked.bind(this)
    );
  }

  create({ squads, units, dispatched, onReturnClick }: CreateParams) {
    this.cameras.main.fadeIn(1000 / GAME_SPEED);

    this.squads = squads;
    this.units = units;
    this.dispatched = dispatched;
    this.onReturnClick = onReturnClick;
    this.uiContainer = this.add.container();

    menu(this);

    this.renderSquadList();
    this.renderControls();
    this.handleSquadClicked(squads.toList().get(0));

    this.game.events.emit('ListSquadsSceneCreated', this);
  }

  getSquads() {
    return this.squads
      .toList()
      .slice(
        this.page * this.itemsPerPage,
        this.page * this.itemsPerPage + this.itemsPerPage
      );
  }
  renderSquadList() {
    const rows = this.formatList(this.squads.toList(), List());

    rows.forEach((row, y) =>
      row.forEach((col, x) => this.renderBoard(col, x, y))
    );
  }

  formatList(
    squads: List<Squad.SquadRecord>,
    accumulator: List<List<Squad.SquadRecord>>
  ): List<List<Squad.SquadRecord>> {
    const cols = 3;
    if (squads.size <= cols) {
      return accumulator.push(squads);
    } else {
      const slice = squads.slice(0, cols);
      return this.formatList(
        squads.slice(cols, squads.size),
        accumulator.push(slice)
      );
    }
  }

  renderSelectSquadInfo(squadId: string) {
    const squad = this.squads.get(squadId);
    const baseY = 650;
    const panel_ = panel(0, baseY, SCREEN_WIDTH, 100, this.uiContainer, this);

    panel_.setAlpha(0.5);

    const leader = this.units.get(squad.leader).name;

    const leaderTitle = text(20, baseY + 10, `Leader`, this.uiContainer, this);
    leaderTitle.setFontSize(16);

    text(20, baseY + 40, leader, this.uiContainer, this);

    const dispatched = this.dispatched.has(squadId);

    button(300, baseY + 20, 'Edit', this.uiContainer, this, () =>
      this.evs.SquadEditClicked.emit(squad)
    );

    button(
      1000,
      baseY + 20,
      'Disband Squad',
      this.uiContainer,
      this,
      () => {
        this.onDisbandSquad(squadId);
        this.refreshBoards();
        this.refreshUI(this.getSquads().first());
      },
      dispatched
    );
  }

  handleSquadEditClicked(squad: Squad.SquadRecord) {
    this.inputEnabled = false;

    this.uiContainer.destroy();
    this.uiContainer = this.add.container();

    this.editSquadModalEvents = EditSquadModal({
      scene: this,
      squad,
      units: this.units,
      addUnitEnabled: !this.dispatched.has(squad.id),
      onSquadUpdated: (sqd, added, removed) => {
        this.squads = this.squads.set(sqd.id, sqd);
        added.forEach((id) => {
          this.units = this.units.update(id, (unit) => ({
            ...unit,
            squad: squad.id,
          }));
        });
        removed.forEach((id) => {
          this.units = this.units.update(id, (unit) => ({
            ...unit,
            squad: null,
          }));
        });
      },
      onClose: (sqd) => {
        this.squads = this.squads.set(sqd.id, sqd);
        sqd.members.forEach((m) => {
          this.units = this.units.update(m.id, (u) => ({
            ...u,
            squad: sqd.id,
          }));
        });
        this.inputEnabled = true;
        this.refreshBoards();
        this.handleSquadClicked(sqd);
        this.editSquadModalEvents = null;
      },
    });
  }
  handleCreateSquadClicked() {
    this.inputEnabled = false;
    this.uiContainer = this.add.container();

    this.editSquadModalEvents = EditSquadModal({
      scene: this,
      squad: Squad.createSquad({
        id: 'squad+' + new Date().getTime(),
        members: Map(),
        force: PLAYER_FORCE,
        leader: '',
      }),
      units: this.units.filter((u) => !u.squad),
      addUnitEnabled: true,
      onSquadUpdated: (sqd, added, removed) => {
        this.squads = this.squads.set(sqd.id, sqd);
        added.forEach((id) => {
          this.units = this.units.update(id, (unit) => ({
            ...unit,
            squad: sqd.id,
          }));
        });
        removed.forEach((id) => {
          this.units = this.units.update(id, (unit) => ({
            ...unit,
            squad: null,
          }));
        });
      },
      onClose: (sqd) => {
        if (sqd.members.size > 0) {
          this.squads = this.squads.set(sqd.id, sqd);
        }
        this.inputEnabled = true;
        this.refreshBoards();

        if (sqd.members.size > 0) {
          this.handleSquadClicked(sqd);
        }
        this.editSquadModalEvents = null;
      },
    });
  }

  renderBoard(squad: Squad.SquadRecord, x: number, y: number) {
    const BOARD_X = 170 + x * 350;
    const BOARD_Y = 110 + y * 250;
    const { board } = createStaticBoard(
      this,
      squad,
      this.units.filter((u) => u.squad === squad.id),
      BOARD_X,
      BOARD_Y,
      0.4,
      true
    );

    onBoardClicked(board, (sqd) => {
      if (this.inputEnabled) this.handleSquadClicked(sqd);
    });

    this.boards.push(board);
  }

  getBoard(id: string, fn: (board: Board) => void) {
    const board = this.boards.find((e) => e.squad.id === id);

    fn(board);
  }

  handleSquadClicked(sqd: Squad.SquadRecord) {
    this.getBoard(sqd.id, (board) => {
      this.boards
        .filter((board) => board.isSelected)
        .forEach(onBoardDeselected);

      onBoardSelected(board);
      this.refreshUI(sqd);
    });
  }

  handleOnConfirmButtonClicked() {
    if (this.onReturnClick) this.onReturnClick(this);

    this.turnOff();
  }

  renderControls() {
    button(
      SCREEN_WIDTH - 200,
      600,
      'Confirm',
      this.uiContainer,
      this,
      this.handleOnConfirmButtonClicked.bind(this),
      !this.inputEnabled
    );

    button(
      SCREEN_WIDTH - 400,
      600,
      'Create Squad',
      this.uiContainer,
      this,
      () => {
        this.evs.CreateSquadClicked.emit(null);
      },
      !this.inputEnabled || this.units.every((u) => !!u.squad)
    );

    this.renderNavigation();
  }
  renderNavigation() {
    const { squads } = this;

    const NAV_X = 500;
    const NAV_Y = 620;

    const totalSquads = Object.keys(squads).length;

    if (this.page !== 0) {
      const prev = this.add.image(NAV_X, NAV_Y, 'arrow_right');
      prev.setScale(-1, 1);
      prev.setInteractive();
      prev.on('pointerdown', (_pointer: Pointer) => {
        if (this.inputEnabled) this.prevPage();
      });

      this.uiContainer.add(prev);
    }

    const isLastPage =
      totalSquads < this.itemsPerPage ||
      this.itemsPerPage * (this.page + 1) >= totalSquads;

    if (!isLastPage) {
      const next = this.add.image(NAV_X + 100, NAV_Y, 'arrow_right');
      next.setInteractive();
      next.on('pointerdown', () => {
        if (this.inputEnabled) this.nextPage();
      });

      this.uiContainer.add(next);
    }
  }

  refreshUI(sqd: Squad.SquadRecord) {
    this.uiContainer.destroy();
    this.uiContainer = this.add.container();

    this.renderControls();

    this.renderSelectSquadInfo(sqd.id);
  }

  refreshBoards() {
    this.boards.forEach((board) => {
      board.destroy();
    });
    this.boards = [];

    this.renderSquadList();
  }

  nextPage() {
    this.page = this.page + 1;
    this.refreshBoards();
    this.selectFirstSquad();
  }

  prevPage() {
    this.page = this.page - 1;
    this.refreshBoards();
    this.handleSquadClicked(this.getSquads().get(0));
  }
  selectFirstSquad() {
    this.handleSquadClicked(this.getSquads().get(0));
  }

  turnOff() {
    this.boards = [];
    this.squads = Map();
    this.units = Map();
    this.uiContainer.destroy();
    this.scene.stop(key);

    for (const ev in this.evs) this.events.off(ev);
  }

  onDisbandSquad: (id: string) => void = (id: string) => {
    this.squads = this.squads.delete(id);
    this.units = this.units.map((u) =>
      u.squad === id ? { ...u, squad: null } : u
    );
  };
}

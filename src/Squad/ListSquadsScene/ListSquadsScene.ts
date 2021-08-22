import { List, Set } from "immutable";
import menu from "../../Backgrounds/menu";
import createStaticBoard from "../../Board/createBoard";
import onBoardClicked from "../../Board/events/onBoardClicked";
import onBoardDeselected from "../../Board/events/onBoardDeselected";
import onBoardSelected from "../../Board/events/onBoardSelected";
import { Board } from "../../Board/Model";
import { SCREEN_WIDTH, PLAYER_FORCE } from "../../constants";
import { GAME_SPEED } from "../../env";
import { Container, Pointer } from "../../Models";
import button from "../../UI/button";
import panel from "../../UI/panel";
import text from "../../UI/text";
import * as Unit from "../../Unit/Model";
import EditSquadModal from "../EditSquadModal/createEditSquadModal";
import * as Squad from "../Model";
import { events } from "./events";
import confirmButtonClicked from "./events/confirmButtonClicked";
import createSquadButtonClicked from "./events/createSquadButtonClicked";
import editSquadButtonClicked from "./events/editSquadButtonClicked";

type CreateParams = {
  squads: Squad.SquadIndex;
  units: Unit.UnitIndex;
  onReturnClick: (scene: ListSquadsScene) => void;
  dispatched: Set<string>;
};

export const key = "ListSquadsScene";

export const run = (
  params: CreateParams,
  scene: Phaser.Scenes.SceneManager
) => {
  scene.run(key, params);
};

export class ListSquadsScene extends Phaser.Scene {
  onReturnClick: (scene: ListSquadsScene) => void = () => {};
  boards: Board[] = [];
  page: number = 0;
  itemsPerPage: number = 16;
  squads = Squad.emptyIndex;
  units = Unit.emptyUnitIndex;
  unitSquadIndex = Squad.emptyUnitSquadIndex;
  dispatched: Set<string> = Set();
  inputEnabled = true;
  uiContainer: Container | null = null;

  constructor() {
    super(key);
  }

  create({ squads, units, dispatched, onReturnClick }: CreateParams) {
    editSquadButtonClicked(this).on(this.handleSquadEditClicked.bind(this));
    createSquadButtonClicked(this).on(this.handleCreateSquadClicked.bind(this));
    confirmButtonClicked(this).on(this.handleOnConfirmButtonClicked.bind(this));
    this.cameras.main.fadeIn(1000 / GAME_SPEED);

    this.squads = squads;
    this.units = units;
    this.unitSquadIndex = Squad.createUnitSquadIndex(squads);
    this.dispatched = dispatched;
    this.onReturnClick = onReturnClick;
    this.uiContainer = this.add.container();

    menu(this);

    this.renderSquadList();
    this.renderControls();
    this.handleSquadClicked(squads.first());

    this.game.events.emit("ListSquadsSceneCreated", this);
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
    if (!this.uiContainer) return;

    const squad = Squad.getSquad(squadId, this.squads);

    const baseX = 20;
    const baseY = 610;
    const panel_ = panel(
      20,
      baseY,
      SCREEN_WIDTH - 40,
      80,
      this.uiContainer,
    );

    panel_.setAlpha(0.5);

    const leader = Unit.getUnit(squad.leader, this.units).name;

    const leaderTitle = text(
      baseX + 20,
      baseY + 10,
      `Leader`,
      this.uiContainer,
    );
    leaderTitle.setFontSize(16);

    text(baseX + 20, baseY + 40, leader, this.uiContainer);

    const dispatched = this.dispatched.has(squadId);
    const isLastSquad = this.squads.size === 1;
    button(
      baseX + 300,
      baseY + 20,
      "Disband Squad",
      this.uiContainer,
      () => {
        this.onDisbandSquad(squadId);
        this.refreshBoards();
        this.refreshUI(this.getSquads().first());
      },
      dispatched || isLastSquad
    );

    button(
      baseX + 1000,
      baseY + 20,
      "Edit",
      this.uiContainer,
      () => editSquadButtonClicked(this).emit(squad)
    );
  }

  handleSquadEditClicked(squad: Squad.SquadRecord) {
    this.inputEnabled = false;

    if (!this.uiContainer) return;
    this.uiContainer.destroy();
    this.uiContainer = this.add.container();

    EditSquadModal({
      scene: this,
      squad,
      units: this.units,
      unitSquadIndex: this.unitSquadIndex,
      addUnitEnabled: !this.dispatched.has(squad.id),
      onSquadUpdated: (sqd, added, removed) => {
        this.squads = this.squads.set(sqd.id, sqd);
        added.forEach((id) => {
          this.unitSquadIndex = this.unitSquadIndex.set(id, squad.id);
        });
        removed.forEach((id) => {
          this.unitSquadIndex = this.unitSquadIndex.delete(id);
        });
      },
      onClose: (sqd) => {
        this.squads = this.squads.set(sqd.id, sqd);
        sqd.members.forEach((m) => {
          this.unitSquadIndex = this.unitSquadIndex.update(m.id, () => sqd.id);
        });
        this.inputEnabled = true;
        this.refreshBoards();
        this.handleSquadClicked(sqd);
      },
    });
  }
  handleCreateSquadClicked() {
    this.inputEnabled = false;
    this.uiContainer = this.add.container();

    EditSquadModal({
      scene: this,
      squad: Squad.createSquad({
        id: "squad+" + new Date().getTime(),
        members: Squad.emptyMemberIndex,
        force: PLAYER_FORCE,
        leader: "",
      }),
      units: Squad.unitsWithoutSquad(this.unitSquadIndex, this.units),
      unitSquadIndex: this.unitSquadIndex,
      addUnitEnabled: true,
      onSquadUpdated: (sqd, added, removed) => {
        this.squads = this.squads.set(sqd.id, sqd);
        added.forEach((id) => {
          this.unitSquadIndex = this.unitSquadIndex.set(id, sqd.id);
        });
        removed.forEach((id) => {
          this.unitSquadIndex = this.unitSquadIndex.delete(id);
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
      },
    });
  }

  renderBoard(squad: Squad.SquadRecord, x: number, y: number) {
    const BOARD_X = 170 + x * 350;
    const BOARD_Y = 130 + y * 250;
    const { board } = createStaticBoard(
      this,
      squad,
      Squad.getSquadUnits(squad.id, this.units, this.unitSquadIndex),
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

    if (board) fn(board);
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
    if (!this.uiContainer) return;

    text(10, 10, "Organize Squads", this.uiContainer);

    button(
      SCREEN_WIDTH - 220,
      10,
      "Confirm",
      this.uiContainer,
      this.handleOnConfirmButtonClicked.bind(this),
      !this.inputEnabled
    );

    button(
      SCREEN_WIDTH - 440,
      10,
      "Create Squad",
      this.uiContainer,
      () => {
        createSquadButtonClicked(this).emit(null);
      },
      !this.inputEnabled || this.unitSquadIndex.size === this.units.size
    );

    this.renderNavigation();
  }
  renderNavigation() {
    const { squads } = this;

    if (!this.uiContainer) return;
    const NAV_X = 500;
    const NAV_Y = 620;

    const totalSquads = Object.keys(squads).length;

    if (this.page !== 0) {
      const prev = this.add.image(NAV_X, NAV_Y, "arrow_right");
      prev.setScale(-1, 1);
      prev.setInteractive();
      prev.on("pointerdown", (_pointer: Pointer) => {
        if (this.inputEnabled) this.prevPage();
      });

      this.uiContainer.add(prev);
    }

    const isLastPage =
      totalSquads < this.itemsPerPage ||
      this.itemsPerPage * (this.page + 1) >= totalSquads;

    if (!isLastPage) {
      const next = this.add.image(NAV_X + 100, NAV_Y, "arrow_right");
      next.setInteractive();
      next.on("pointerdown", () => {
        if (this.inputEnabled) this.nextPage();
      });

      this.uiContainer.add(next);
    }
  }

  refreshUI(sqd: Squad.SquadRecord) {
    if (!this.uiContainer) return;
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
    this.handleSquadClicked(this.getSquads().first());
  }
  selectFirstSquad() {
    this.handleSquadClicked(this.getSquads().first());
  }

  turnOff() {
    this.boards = [];
    this.squads = Squad.emptyIndex;
    this.units = Unit.emptyUnitIndex;
    this.uiContainer?.destroy();
    this.scene.stop(key);
    events.forEach((k) => this.events.off(k));
  }

  onDisbandSquad: (id: string) => void = (id: string) => {
    this.squads = this.squads.delete(id);
    this.unitSquadIndex = this.unitSquadIndex.filter((u) => u !== id);
  };
}

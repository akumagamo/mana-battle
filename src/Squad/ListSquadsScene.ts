import * as Squad from "../Squad/Model";
import Board from "../Board/StaticBoardScene";
import { Pointer, Image, Text } from "../Models";
import button from "../UI/button";
import panel from "../UI/panel";
import { SCREEN_WIDTH } from "../constants";
import text from "../UI/text";
import menu from "../Backgrounds/menu";
import { UnitIndex } from "../Unit/Model";
import { List, Map, Set } from "immutable";
import EditSquadModal, { EditSquadModalEvents } from "./EditSquadModal";
import { SceneEventFactory } from "../utils";

type CreateParams = {
  squads: Squad.Index;
  units: UnitIndex;
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
  evs = {
    SquadClicked: SceneEventFactory<Squad.SquadRecord>(this, "SquadClicked"),
    SquadEditClicked: SceneEventFactory<Squad.SquadRecord>(
      this,
      "SquadEditClicked"
    ),
  };

  boardScenes: Board[] = [];
  controls: (Image | Text)[] = [];
  page: number = 0;
  itemsPerPage: number = 16;
  squads = Map() as Squad.Index;
  units = Map() as UnitIndex;
  dispatched: Set<string> = Set();
  onDisbandSquad: (id: string) => void = () => {};
  onReturnClick: (scene: ListSquadsScene) => void | null = null;
  inputEnabled = true;
  editSquadModalEvents: EditSquadModalEvents;

  constructor() {
    super(key);
  }

  init() {
    for (const ev in this.evs) this.events.off(ev);

    this.evs.SquadClicked.on(this.handleSquadClicked.bind(this));
    this.evs.SquadEditClicked.on(this.handleSquadEditClicked.bind(this));
  }

  create({ squads, units, dispatched, onReturnClick }: CreateParams) {
    this.events.once("shutdown", () => this.turnOff());

    this.squads = squads;
    this.units = units;
    this.dispatched = dispatched;
    this.onReturnClick = onReturnClick;

    menu(this);

    this.renderSquadList(squads);
    this.renderControls();
    this.evs.SquadClicked.emit(squads.toList().get(0));

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
  renderSquadList(squads: Squad.Index) {
    const rows = this.formatList(squads.toList(), List());

    rows.forEach((row, y) =>
      row.forEach((col, x) => this.renderBoard(col, x, y))
    );
  }

  formatList(
    squads: List<Squad.SquadRecord>,
    accumulator: List<List<Squad.SquadRecord>>
  ): List<List<Squad.SquadRecord>> {
    const cols = 4;
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

  renderSelectSquadInfo(squad: Squad.SquadRecord) {
    const container = this.add.container(0, 670);
    const panel_ = panel(0, 0, SCREEN_WIDTH, 100, container, this);

    container.add([panel_]);

    text(
      10,
      10,
      "",
      //squad.name,
      container,
      this
    );

    const dispatched = this.dispatched.has(squad.id);

    container.setAlpha(dispatched ? 0.3 : 1);

    button(
      200,
      10,
      "Edit",
      container,
      this,
      () => this.evs.SquadEditClicked.emit(squad),
      dispatched
    );

    button(
      1000,
      10,
      "Disband Squad",
      container,
      this,
      () => {
        this.onDisbandSquad(squad.id);
        //api.disbandSquad(squad.id);
        container.destroy();
        this.refresh();
      },
      dispatched
    );
  }

  handleSquadEditClicked(squad: Squad.SquadRecord) {
    this.inputEnabled = false;

    this.editSquadModalEvents = EditSquadModal(
      this,
      squad,
      this.units,
      (sqd) => {
        this.squads = this.squads.set(sqd.id, sqd);
      },
      () => {
        this.refresh();
      }
    );
  }

  renderBoard(squad: Squad.SquadRecord, x: number, y: number) {
    const BOARD_X = 20 + x * 350;
    const BOARD_Y = 20 + y * 330;
    const boardScene = new Board(
      squad,
      this.units.filter((u) => u.squad === squad.id),
      BOARD_X,
      BOARD_Y,
      0.4,
      true
    );
    this.scene.add(`board-squad-${squad.id}`, boardScene, true);

    boardScene.onClick((sqd) => {
      if (this.inputEnabled) this.evs.SquadClicked.emit(sqd);
    });

    this.boardScenes.push(boardScene);
  }

  squadSceneIO(id: string, fn: (board: Board) => void) {
    const board = this.boardScenes.find((e) => e.squad.id === id);

    fn(board);
  }
  handleSquadClicked(sqd: Squad.SquadRecord) {
    this.squadSceneIO(sqd.id, (squadScene) => {
      this.renderSelectSquadInfo(sqd);
      this.boardScenes
        .filter((scene) => scene.isSelected)
        .forEach((scene) => scene.deselect());
      squadScene.select();
    });
  }

  renderControls() {
    button(
      SCREEN_WIDTH - 100,
      40,
      "Return",
      this.add.container(0, 0),
      this,
      () => {
        this.turnOff();

        if (this.onReturnClick) this.onReturnClick(this);
      },
      !this.inputEnabled
    );

    button(
      1000,
      600,
      "Create Squad",
      this.add.container(0, 0),
      this,
      () => {
        this.turnOff();
      },

      !this.inputEnabled
    );

    this.renderNavigation();
  }
  renderNavigation() {
    const { squads } = this;

    const NAV_X = 500;
    const NAV_Y = 620;

    const totalSquads = Object.keys(squads).length;

    const prev = this.add.image(NAV_X, NAV_Y, "arrow_right");
    prev.setScale(-1, 1);

    if (this.page === 0) {
      prev.setAlpha(0.5);
    } else {
      prev.setInteractive();
      prev.on("pointerdown", (_pointer: Pointer) => {
        if (this.inputEnabled) this.prevPage();
      });
    }

    this.controls.push(prev);

    const next = this.add.image(NAV_X + 100, NAV_Y, "arrow_right");

    const isLastPage =
      totalSquads < this.itemsPerPage ||
      this.itemsPerPage * (this.page + 1) >= totalSquads;

    if (!isLastPage) {
      next.setInteractive();
      next.on("pointerdown", () => {
        if (this.inputEnabled) this.nextPage();
      });
    } else {
      next.setAlpha(0.5);
    }

    this.controls.push(next);
  }

  refresh() {
    this.boardScenes.forEach((scene) => {
      scene.turnOff();
    });
    this.renderSquadList(this.squads);
    this.renderControls();
  }

  nextPage() {
    this.page = this.page + 1;
    this.refresh();
    this.evs.SquadClicked.emit(this.getSquads().get(0));
  }

  prevPage() {
    this.page = this.page - 1;
    this.refresh();
    this.evs.SquadClicked.emit(this.getSquads().get(0));
  }

  turnOff() {
    console.log("turn off...");
    this.boardScenes.forEach((scene) => {
      scene.turnOff();
    });
    this.boardScenes = [];
    this.controls.forEach((control) => control.destroy());
    this.controls = [];
    this.squads = Map();
    this.units = Map();
    this.scene.stop();
  }
}

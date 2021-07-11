import { create } from "./create";

export default class SaveListScene extends Phaser.Scene {
  constructor() {
    super("SaveListScene");
  }
  create() {
    create(this);
  }
}

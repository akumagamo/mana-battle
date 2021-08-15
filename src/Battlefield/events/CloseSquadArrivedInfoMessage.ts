import { Container } from "../../Models";
import { createEvent } from "../../utils";

export function handleCloseSquadArrivedInfoMessage(container: Container) {
  container.destroy();
}

export const key = "CloseSquadArrivedInfoMessage";

export default (scene: Phaser.Scene) =>
  createEvent<Container>(scene.events, key);

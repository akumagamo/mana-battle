import events from ".";
import { PLAYER_FORCE } from "../../constants";
import { createEvent } from "../../utils";
import { City, MapSquad, MapState } from "../Model";
import speak from "../rendering/speak";

export const key = "SquadConqueredCity";

export default (scene: Phaser.Scene) =>
  createEvent<{ squad: MapSquad; city: City }>(scene.events, key);

export const onSquadConquersCity = (scene: Phaser.Scene, state: MapState) => ({
  city,
  squad,
}: {
  city: City;
  squad: MapSquad;
}) => {
  const events_ = events();

  state.cities = state.cities.map((c) =>
    c.id === city.id ? { ...c, force: squad.squad.force } : c
  );

  if (city.type === "castle") {
    if (squad.squad.force === PLAYER_FORCE) {
      events_.PlayerWins(scene).emit(scene);
    } else {
      events_.PlayerLoses(scene).emit(scene);
    }
  } else {
    if (squad.squad.force === PLAYER_FORCE) {
      speak(scene, state, squad, `We liberated ${city.name}`);
    } else {
      // NOTify player -> enemy squad conquered city
    }
  }
};

import { PUBLIC_URL } from "../constants";

export default function (this: Phaser.Scene) {
  if (process.env.SOUND_ENABLED) {
    const mp3s = ["map1"];
    mp3s.forEach((id: string) => {
      this.load.audio(id, `${PUBLIC_URL}/music/${id}.mp3`);
    });
  }
  const tiles = [
    "tiles/grass",
    "tiles/woods",
    "tiles/mountain",
    "tiles/castle",
    "tiles/water",
    "tiles/beach-r",
    "tiles/beach-l",
    "tiles/beach-t",
    "tiles/beach-b",
    "tiles/beach-tr",
    "tiles/beach-tl",
    "tiles/beach-br",
    "tiles/beach-bl",

    "tiles/beach-b-and-r",
    "tiles/beach-t-and-r",
    "tiles/beach-b-and-l",
    "tiles/beach-t-and-l",
  ];
  tiles.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/${id}.svg`);
  });

  const structures = ["tiles/town"];
  structures.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/${id}.svg`);
  });
  const mapElems = ["ally_emblem", "enemy_emblem"];
  mapElems.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/map/${id}.svg`);
  });

  // merano - Alois_Kirnig_-_Forst_Castle_on_the_Adige_near_Merano

  const castles = ["merano"];
  castles.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/art/castles/${id}.jpg`);
  });
}

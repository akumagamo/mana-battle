import { Chara } from "../../Chara/Chara";
import { Unit } from "../../Unit/Model";
import TheaterScene from "../TheaterScene";

export type CreateUnitCmd = {
  type: "CREATE_UNIT";
  unit: Unit;
  x: number;
  y: number;
  front: boolean;
  pose: string;
  showWeapon: boolean;
};
export const createUnit = (
  scene: TheaterScene,
  { unit, x, y, front, showWeapon }: CreateUnitCmd
) => {
  const key = scene.charaKey(unit.id);
  const chara = new Chara(
    key,
    scene,
    unit,
    x,
    y,
    1,
    front,
    true,
    false,
    false,
    showWeapon
  );

  scene.charas = scene.charas.set(key, chara);
};

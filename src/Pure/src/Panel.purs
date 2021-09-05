module UI.Panel where

import Prelude
import Effect (Effect)
import Graphics.Phaser.Container as Container
import Graphics.Phaser.ForeignTypes as PhaserModels
import Graphics.Phaser.GameObject (Vector, Dimensions, getScene)
import Graphics.Phaser.Graphics as Graphics

create :: Vector -> Dimensions -> PhaserModels.PhaserContainer -> Effect PhaserModels.PhaserContainer
create position size container =
  getScene container
    >>= Graphics.create
    >>= Graphics.fillStyle "0x000000" 0.9
    >>= Graphics.fillRect position size
    >>= flip Container.addChild container

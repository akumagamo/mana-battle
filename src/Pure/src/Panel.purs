module UI.Panel where

import Prelude
import Effect (Effect)
import Graphics.Phaser.Container as Container
import Graphics.Phaser.ForeignTypes as PhaserModels
import Graphics.Phaser.GameObject (Dimensions, getScene)
import Graphics.Phaser.GameObject as GO
import Graphics.Phaser.Image as Image

create :: Dimensions -> PhaserModels.PhaserContainer -> Effect PhaserModels.PhaserContainer
create size container = do
  background <-
    Image.create "panel" (getScene container)
      >>= GO.setSize size
  Container.addChild background container

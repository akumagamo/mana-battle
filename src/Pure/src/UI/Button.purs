module UI.Button where

import Prelude
import Effect (Effect)
import Graphics.Phaser.Container as Container
import Graphics.Phaser.Events as Events
import Graphics.Phaser.ForeignTypes as Types
import Graphics.Phaser.GameObject as GO
import Graphics.Phaser.Image as Image
import Graphics.Phaser.Text as Text

_DEFAULT_TEXT_COLOR :: String
_DEFAULT_TEXT_COLOR = "#ffffff"

activeFill :: String
activeFill = "0x222222"

activeTextColor :: String
activeTextColor = "#ffffff"

create :: forall a. String -> { data :: a, key :: String } -> Types.PhaserScene -> Effect Types.PhaserContainer
create label event scene = do
  background <-
    Image.create "button" scene
      >>= GO.onClick (\_ _ _ _ -> Events.emitSceneEvent event.key event.data scene)
  Container.create scene
    >>= Container.addChild background
    >>= renderText
  where
  renderText cont =
    Text.create label scene
     >>= Text.setColor _DEFAULT_TEXT_COLOR
     >>= Text.setFontFamily "sans-serif"
     >>= Text.setFontSize 24.0
     >>= GO.setOrigin { x: 0.5, y: 0.5 }
     >>= flip Container.addChild cont

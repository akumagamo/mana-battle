module UI.Button where

import Prelude
import Effect (Effect)
import Graphics.Phaser.Container as Container
import Graphics.Phaser.Events as Events
import Graphics.Phaser.ForeignTypes as Types
import Graphics.Phaser.GameObject as GO
import Graphics.Phaser.Image as Image
import Graphics.Phaser.Text as Text

defaultTextColor :: String
defaultTextColor = "#ffffff"

activeFill :: String
activeFill = "0x222222"

activeTextColor :: String
activeTextColor = "#ffffff"

create :: forall a. String -> { data :: a, key :: String } -> Types.PhaserScene -> Effect Types.PhaserContainer
create label event scene = do
  background <-
    Image.create "button" pos scene
      >>= GO.setSize { width: 250.0, height: 50.0 }
      >>= GO.onClick (\_ _ _ _ -> Events.emitSceneEvent event.key event.data scene)
  Container.create scene
    >>= Container.addChild background
    >>= GO.setSize { width: 250.0, height: 50.0 }
    >>= renderText
  where
  renderText cont =
    Text.create
      { config:
          { color: "#fff", fontFamily: "arial", fontSize: 24
          }
      , pos: { x: 0.0, y: 0.0 }
      , text: label
      }
      scene
      >>= GO.setOrigin { x: 0.5, y: 0.5 }
      >>= flip Container.addChild cont

  pos = { x: 0.0, y: 0.0 }

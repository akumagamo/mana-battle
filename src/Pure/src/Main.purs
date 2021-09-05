module Main where

import Prelude
import Effect (Effect)
import Effect.Console (log)
import Graphics.Phaser.Container as Container
import Graphics.Phaser.ForeignTypes (PhaserContainer)
import Graphics.Phaser.GameObject as GO
import Graphics.Phaser.Text as Text
import Graphics.Phaser.Events as Events
import UI.Panel as Panel

main :: Effect Unit
main = do
  log "🍝"

textConfig ::
  { config ::
      { color :: String
      , fontFamily :: String
      , fontSize :: Int
      }
  , pos ::
      { x :: Number
      , y :: Number
      }
  , text :: String
  }
textConfig =
  { pos: { x: 0.0, y: 0.0 }
  , text: "Are you sure?"
  , config: { color: "#FFF", fontSize: 22, fontFamily: "sans-serif" }
  }

confirmModal :: PhaserContainer -> String -> Effect Unit
confirmModal parent squadId =
  void do
    scene <- GO.getScene parent
    text <-
      Text.create textConfig scene
        >>= GO.setPosition { x: x + 60.0, y: y + 20.0 }
    Container.create scene
      >>= Panel.create { x, y } { width: 300.0, height: 200.0 }
      >>= Container.addChild text
      >>= confirmButton scene
      >>= cancelButton scene
      >>= flip Container.addChild parent
  where
  x = 600.0

  y = 300.0

  confirmButton scene cont =
    Text.create (textConfig { text = "Confirm" }) scene
      >>= GO.setPosition { x: x + 60.0, y: y + 100.0 }
      >>= GO.onClick (\_ _ _ _ -> Events.emitSceneEvent "disband_squad" squadId scene)
      >>= flip Container.addChild cont

  cancelButton scene cont =
    Text.create (textConfig { text = "Cancel" }) scene
      >>= GO.setPosition { x: x + 200.0, y: y + 100.0 }
      >>= GO.onClick (\_ _ _ _ -> GO.destroy cont)
      >>= flip Container.addChild cont

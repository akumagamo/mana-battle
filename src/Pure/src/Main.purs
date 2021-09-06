module Main where

import Prelude
import Effect (Effect)
import Effect.Console (log)
import Graphics.Phaser.Container as Container
import Graphics.Phaser.Events as Events
import Graphics.Phaser.ForeignTypes (PhaserContainer)
import Graphics.Phaser.GameObject as GO
import Graphics.Phaser.GameObject as Go
import Graphics.Phaser.Text as Text
import UI.Button as Button
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
  , config: { color: "#000", fontSize: 34, fontFamily: "sans-serif" }
  }

confirmModal :: forall a. PhaserContainer -> { key :: String, data :: a } -> Effect Unit
confirmModal parent event =
  void do
    scene <- GO.getScene parent
    container <- Container.create scene
    _ <-
      Events.createSceneListener "CLOSE_CONFIRM_MODAL"
        ( \_ -> do
            GO.destroy container
        )
        scene
    btn <-
      Button.create "Confirm" event scene
        >>= Go.setPosition { x: 160.0, y: 110.0 }
    cancel <-
      Button.create "Cancel" { key: "CLOSE_CONFIRM_MODAL", data: {} } scene
        >>= Go.setPosition { x: -150.0, y: 110.0 }
    text <-
      Text.create textConfig scene
        >>= GO.setPosition { x: 0.0, y: -120.0 }
        >>= Go.setOrigin { x: 0.5, y: 0.5 }
    GO.setPosition { x, y } container
      >>= Panel.create { width: 600.0, height: 400.0 }
      >>= Container.addChild text
      >>= Container.addChild btn
      >>= Container.addChild cancel
      >>= flip Container.addChild parent
  where
  x = 1280.0 / 2.0

  y = 720.0 / 2.0

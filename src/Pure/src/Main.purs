module Main where

import Prelude
import Effect (Effect)
import Effect.Console (log)
import Graphics.Phaser.Container as Container
import Graphics.Phaser.Events as Events
import Graphics.Phaser.ForeignTypes (PhaserContainer)
import Graphics.Phaser.GameObject as GO
import Graphics.Phaser.Text as Text
import UI.Button as Button
import UI.Panel as Panel

main :: Effect Unit
main = do
  log "🍝"

confirmModal :: forall a. PhaserContainer -> { key :: String, data :: a } -> Effect Unit
confirmModal parent event =
  void do
    container <- Container.create scene
    _ <-
      Events.createSceneListener "CLOSE_CONFIRM_MODAL"
        ( \_ -> do
            GO.destroy container
        )
        scene
    btn <-
      Button.create "Confirm" event scene
        >>= GO.setPosition { x: 160.0, y: 110.0 }
    cancel <-
      Button.create "Cancel" { key: "CLOSE_CONFIRM_MODAL", data: {} } scene
        >>= GO.setPosition { x: -150.0, y: 110.0 }
    text <-
      Text.create "Are you sure?" scene
        >>= GO.setPosition { x: 0.0, y: -120.0 }
        >>= GO.setOrigin { x: 0.5, y: 0.5 }
        >>= Text.setColor "#000"
        >>= Text.setFontFamily "sans-serif"
        >>= Text.setFontSize 36.0

    GO.setPosition { x, y } container
      >>= Panel.create { width: 600.0, height: 400.0 }
      >>= Container.addChild text
      >>= Container.addChild btn
      >>= Container.addChild cancel
      >>= flip Container.addChild parent
  where
  scene = GO.getScene parent
  x = 1280.0 / 2.0

  y = 720.0 / 2.0

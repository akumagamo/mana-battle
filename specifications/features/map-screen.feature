Feature: Map Screen

  Background: User has opened Map Screen
    Given User has opened Map Screen

  Scenario: Map Creation
    Given User has nothing selected
    Then Screen presents a map
    Then Screen presents all dispatched squads
    Then Screen presents all cities
    Then Game is unpaused

  Scenario: Friendly Squad Selection
    Given User has nothing selected
    When User selects a friendly squad
    Then Game is paused
    Then Option "View Squad Details" is visible
    Then Option "Move Squad" is visible

  Scenario: Enemy Squad Selection
    Given User has nothing selected
    When User selects an enemy squad
    Then Game is paused
    Then Option "View Squad Details" is visible
    Then Option "Move Squad" is not visible

  Scenario: Open Friendly Squad Details
    Given User has nothing selected
    When User selects a friendly squad
    When User selects option "View Squad Details"
    Then Modal "View Squad Details" is visible

  Scenario: Open Enemy Squad Details
    Given User has nothing selected
    When User selects an enemy squad
    When User selects option "View Squad Details"
    Then Modal "View Squad Details" is visible

  Scenario: Squad Movement
    Given User has nothing selected
    When User selects a friendly squad
    When User selects option "Move Squad"
    When User selects a location in the map
    Then Game is unpaused
    Then Unit moves to that location

  Scenario: Squad Movement on Plains terrain
    Given User issued a move order to a squad over "plains" terrain
    When Squad walks over "plains" terrain
    Then Squad move speed is 100

  Scenario: Squad Movement on Mountain terrain
    Given User issued a move order to a squad over "mountain" terrain
    When Squad walks over "mountain" terrain
    Then Squad move speed is 20

  Scenario: Squad Movement on Forest terrain
    Given User issued a move order to a squad over "forest" terrain
    When Squad walks over "forest" terrain
    Then Squad move speed is 40

  Scenario: Squad Collision (friendly on enemies)
    Given User issued a move order to a squad
    When Squad collides with enemy
    Then The "Enemy Encountered" modal is displayed

  Scenario: Squad Collision (enemy on friendly)
    Given An enemy squad walks toward a friendly unit
    When Enemy squad collides with friendly squad
    Then The "Enemy Encountered" modal is displayed

  Scenario: Squad Collision (enemy on friendly)
    Given An enemy squad walks toward a friendly unit
    When Enemy squad collides with friendly squad
    Then The "Enemy Encountered" modal is displayed

  Scenario: Enemy Encountered Modal
    Given The "Enemy Encountered" modal is opened
    When User selects option "Start Combat"
    Then The next screen should be "Combat Screen"


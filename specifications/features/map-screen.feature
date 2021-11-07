Feature: Map Screen

  Background: User has opened Map Screen
    Given User has opened Map Screen

  Scenario: Map Creation
    Given User has nothing selected
    Then Screen presents a map
    Then Screen presents all dispatched squads
    Then Screen presents all cities
    Then Game is unpaused

  Scenario: Squad Selection
    Given User has nothing selected
    When User selects a <Squad Type>
    Then Game is paused
    Then the option View Squad Details is <View Squad Details>
    Then the option View Move Squad is <Move Squad>

    Examples:
      | Squad Type | View Squad Details  | Move Squad |
      | allied     | visible             | visible    |
      | enemy      | visible             | hidden     |

  Scenario: Open Squad Details
    Given User has nothing selected
    When User selects a <Squad Type>
    When User selects option "View Squad Details"
    Then Modal "View Squad Details" is visible

    Examples:
      | Squad Type |
      | allied     |
      | enemy      |

  Scenario: Squad Movement
    Given User has nothing selected
    When User selects a friendly squad
    When User selects option "Move Squad"
    When User selects a location in the map
    Then Game is unpaused
    Then Unit moves to that location

  Scenario: Squad Collision (friendly on enemy)
    Given User issued a move order to a squad
    When Squad collides with enemy
    Then The "Enemy Encountered" modal is displayed

  Scenario: Squad Collision (enemy on friendly)
    Given An enemy squad walks toward a friendly unit
    When Enemy squad collides with friendly squad
    Then The "Enemy Encountered" modal is displayed

  Scenario: Enemy Encountered Modal
    Given The "Enemy Encountered" modal is opened
    When User selects option "Start Combat"
    Then The next screen should be "Combat Screen"


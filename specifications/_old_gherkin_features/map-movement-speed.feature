Feature: Map Screen

  Background: User has opened Map Screen
    Given User has opened Map Screen

  Scenario: Squad Movement Speed on <Terrain Type>
    Given User issued a move order over <Terrain Type>
    When Squad moves over <Terrain Type>
    Then Squad move speed is <Movement Speed>

    Examples: 
    | Terrain Type | Movement Speed |
    | plains       | 100            |
    | mountain     | 20             |
    | forest       | 40             |

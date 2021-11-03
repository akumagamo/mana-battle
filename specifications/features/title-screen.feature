Feature: Title Screen

  Scenario: Opening the Title Screen
    Given I have started the game
    Then I should see the title screen
    Then I should see a "New Game" option
    Then I should see another option called "Credits"
  
  Scenario: View Credits
    Given I have started the game
    When I choose the "Credits" option
    Then I should see the credits listed
    Then I should see a "Close Credits" option
    When I choose the "Close Credits" option
    Then I should no longer see the credits listed

  Scenario: Start a New Game
    Given I have started the game
    When I choose the "New Game" option
    Then The next screen should be the Map Screen

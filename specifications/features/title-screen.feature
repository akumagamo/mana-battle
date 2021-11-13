Feature: Title Screen

  Background: I have started the game


  Scenario: Opening the Title Screen
    Then I should see the title screen
    Then I should see a "New Game" option
    Then I should see another option called "Credits"
  
  Scenario: View Credits
    When I choose the "Credits" option
    Then I should see the credits listed
    Then I should see a "Close Credits" option
    When I choose the "Close Credits" option
    Then I should no longer see the credits listed

  Scenario: Start a New Game
    When I choose the "New Game" option
    Then The next screen should be the Map Screen

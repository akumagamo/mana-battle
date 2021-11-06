Feature: Map List Screen

  Background: Map List Screen is active
    Given The user has the map screen active

    Scenario: Initial State
      Then all maps are listed
      Then first map is selected
      Then option "Select Map" is visible
      Then option "Return" is visible

    Scenario: Item Selection
      When the user selects the second map in the list
      Then the second map should be marked as selected
      
    Scenario: Selecting Map
      When the user selects the option "Select Map"
      Then the next screen should be the Map Scene

    Scenario: Selecting Return
      When the user selects the option "Return"
      Then the next screen should be the Title Scene

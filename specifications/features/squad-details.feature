Feature: Squad Details

  Scenario: Visible Edit Options
    Given User opened a Squad Details modal for a squad
    Then all units in the squad should be listed in the squad
    Then user should see a "Close Details Modal" option

  Scenario: Display Unit List
    Given Squad Details modal has been opened for a <Squad>
    Then a Unit List should be displayed, if user <Can Add/Remove>
    Then if user <Can Add/Remove>, units in the squad should be highlighted in
    the beginning of the Unit List
    Then if user <Can change leader>, a "Change Leader" option should be displayed

    Examples:
      | Squad                   |  Can Edit | Can change leader |
      | allied, dispatched      |  no       | yes               |
      | allied, non-dispatched  |  yes      | yes               |
      | enemy                   |  no       | no                |

  Scenario: Add Unit to Squad
    Given Squad Details modal has been opened for a allied, non-dispatch squad
    Given Squad has at least one empty space
    When user selects one non-highlighted unit in "Unit List"
    Then unit is added into an empty space
    Then unit should be highlighted in the unit list
    Then unit should be moved to the beginning of the unit list

  Scenario: No slots remaining
    Given Squad Details modal has been opened for a allied, non-dispatch squad
    Given Squad has no empty space remaining
    Then units in the unit list should be disabled
    When selecting a highlighted unit
    Then unit should be removed from the squad
    Then unit should no longer be highlighted
    Then unit should no longer be displayed in the beginning of the unit list
    Then non highlighted units in the unit list should not be disabled

   Scenario: Disband Squad
    Given Squad Details modal has been opened for a allied, non-dispatch squad
    Then user deselects all highlighted units
    Then user selects the "Close Details Modal" option
    Then squad should be removed

   Scenario: Removing leader
    Given Squad Details modal has been opened for a allied, non-dispatch squad
    Then user deselects squad leader
    Then leader is removed from squad
    Then higher level remaining unit in the squad becomes the leader

   Scenario: Changing leader
    Given Squad Details modal has been opened for a allied squad
    When user selects the "Change Leader" option
    Then leader indication is no longer displayed on leader
    Then the Unit List is not displayed
    Then a "Select Leader" text is displayed
    Then a "Cancel" option is displayed
    When user selects <Option>
    Then <Action> is performed
    Then the Unit List is displayed
    Then a "Select Leader" text is not displayed
    Then a "Cancel" option is not displayed

    Examples:
      | Option    |  Action                  |
      | unit      |  make it the leader      |
      | cancel    |  restore previous leader |


Feature: Automatic formations

  Scenario: Toggling automation formations on/off
    Given I am viewing details for an allied squad with auto formation with
    value <Initial value>
    Then I should see a "Automatc Formation" switch with value <Initial Value>
    When I select the "Automatic Formation" switch
    Then I should see a "Automatc Formation" switch with value <Target Value>

    Examples:
    | Initial value | Target value |
    | on            | off          |
    | off           | on           |

  Scenario: Adding new units
    Given I am viewing details for an allied squad with auto formation
    When I add a new unit to the squad
    Then the squad formation should be recalculated

  Scenario: Removing units
    Given I am viewing details for an allied squad with auto formation
    When I remove one of the squad units
    Then the squad formation should be recalculated





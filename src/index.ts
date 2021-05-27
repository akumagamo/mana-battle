import { SCREEN_WIDTH, SCREEN_HEIGHT } from "./constants";
import TitleScene from "./Scenes/TitleScene";
import OptionsScene from "./Scenes/OptionsScene";
import WorldScene from "./Scenes/World";
import defaultData from "./defaultData";
import { EditSquadScene } from "./Squad/EditSquadScene";
import { ListSquadsScene } from "./Squad/ListSquadsScene";
import { ListUnitsScene } from "./Unit/ListUnits";
import MapListScene from "./Map/MapListScene";
import CombatScene from "./Combat/CombatScene";

(() => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: "#000000",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [
      TitleScene,
      EditSquadScene,
      ListSquadsScene,
      ListUnitsScene,
      MapListScene,
      CombatScene,
      OptionsScene,
      WorldScene,
    ],
    dom: {
      createContainer: true,
    },
    parent: "content",
  };

  if (localStorage.getItem("player") === null) {
    defaultData(true);
  }

  const game = new Phaser.Game(config);
  game.scale.lockOrientation(Phaser.Scale.PORTRAIT);

  if (process.env.NODE_ENV === "development") {
    const runScript = (script: any[]) => {
      let startTime = new Date().getTime();

      function event(type: string, x: number, y: number) {
        console.log(type, x, y);
        document.getElementById("content").dispatchEvent(
          new MouseEvent(type, {
            clientX: x,
            clientY: y,
            bubbles: true,
          })
        );
      }

      setInterval(() => {
        if (script.length) {
          const { x, y, time, type } = script[0];

          const now = new Date().getTime() - startTime;

          if (now >= time) {
            event(type, x, y);
            script.shift();
          }
        }
      }, 16);
    };
    const inputs = [
      {
        type: "mousedown",
        x: 721,
        y: 602,
        time: 30388,
      },
      {
        type: "mouseup",
        x: 722,
        y: 602,
        time: 30536,
      },
      {
        type: "mousedown",
        x: 1052,
        y: 136,
        time: 32408,
      },
      {
        type: "mouseup",
        x: 1052,
        y: 136,
        time: 32546,
      },
      {
        type: "mousedown",
        x: 931,
        y: 131,
        time: 33310,
      },
      {
        type: "mouseup",
        x: 931,
        y: 132,
        time: 33448,
      },
      {
        type: "mousedown",
        x: 1035,
        y: 146,
        time: 33987,
      },
      {
        type: "mouseup",
        x: 1036,
        y: 146,
        time: 34082,
      },
      {
        type: "mousedown",
        x: 914,
        y: 137,
        time: 34487,
      },
      {
        type: "mouseup",
        x: 914,
        y: 137,
        time: 34577,
      },
      {
        type: "mousedown",
        x: 1246,
        y: 679,
        time: 35558,
      },
      {
        type: "mouseup",
        x: 1246,
        y: 678,
        time: 35615,
      },
      {
        type: "mousedown",
        x: 372,
        y: 597,
        time: 38476,
      },
      {
        type: "mouseup",
        x: 372,
        y: 596,
        time: 38687,
      },
      {
        type: "mousedown",
        x: 558,
        y: 724,
        time: 39254,
      },
      {
        type: "mouseup",
        x: 559,
        y: 724,
        time: 39408,
      },
      {
        type: "mousedown",
        x: 904,
        y: 511,
        time: 40289,
      },
      {
        type: "mouseup",
        x: 905,
        y: 510,
        time: 40605,
      },
      {
        type: "mousedown",
        x: 1041,
        y: 202,
        time: 42970,
      },
      {
        type: "mouseup",
        x: 1041,
        y: 202,
        time: 43104,
      },
      {
        type: "mousedown",
        x: 590,
        y: 721,
        time: 43926,
      },
      {
        type: "mouseup",
        x: 589,
        y: 721,
        time: 44072,
      },
      {
        type: "mousedown",
        x: 185,
        y: 507,
        time: 44978,
      },
      {
        type: "mouseup",
        x: 185,
        y: 507,
        time: 45276,
      },
      {
        type: "mousedown",
        x: 1033,
        y: 218,
        time: 47858,
      },
      {
        type: "mouseup",
        x: 1033,
        y: 216,
        time: 48034,
      },
      {
        type: "mousedown",
        x: 707,
        y: 717,
        time: 49122,
      },
      {
        type: "mouseup",
        x: 707,
        y: 717,
        time: 49228,
      },
      {
        type: "mousedown",
        x: 701,
        y: 462,
        time: 50066,
      },
      {
        type: "mouseup",
        x: 701,
        y: 461,
        time: 50109,
      },
      {
        type: "mousedown",
        x: 983,
        y: 321,
        time: 51598,
      },
      {
        type: "mouseup",
        x: 983,
        y: 320,
        time: 51599,
      },
      {
        type: "mousedown",
        x: 684,
        y: 304,
        time: 53532,
      },
      {
        type: "mouseup",
        x: 684,
        y: 303,
        time: 53571,
      },
      {
        type: "mousedown",
        x: 687,
        y: 263,
        time: 54365,
      },
      {
        type: "mouseup",
        x: 687,
        y: 262,
        time: 54395,
      },
      {
        type: "mousedown",
        x: 1206,
        y: 353,
        time: 55788,
      },
      {
        type: "mouseup",
        x: 1206,
        y: 353,
        time: 56040,
      },
      {
        type: "mousedown",
        x: 564,
        y: 726,
        time: 57524,
      },
      {
        type: "mouseup",
        x: 564,
        y: 726,
        time: 57649,
      },
      {
        type: "mousedown",
        x: 679,
        y: 318,
        time: 58490,
      },
      {
        type: "mouseup",
        x: 679,
        y: 317,
        time: 58815,
      },
      {
        type: "mousedown",
        x: 1030,
        y: 206,
        time: 90684,
      },
      {
        type: "mouseup",
        x: 1030,
        y: 206,
        time: 90942,
      },
      {
        type: "mousedown",
        x: 697,
        y: 287,
        time: 92331,
      },
      {
        type: "mouseup",
        x: 697,
        y: 287,
        time: 92542,
      },
      {
        type: "mousedown",
        x: 714,
        y: 723,
        time: 93566,
      },
      {
        type: "mouseup",
        x: 714,
        y: 723,
        time: 93694,
      },
      {
        type: "mousedown",
        x: 689,
        y: 466,
        time: 95588,
      },
      {
        type: "mouseup",
        x: 689,
        y: 465,
        time: 95610,
      },
      {
        type: "mousedown",
        x: 965,
        y: 354,
        time: 97427,
      },
      {
        type: "mouseup",
        x: 965,
        y: 353,
        time: 97526,
      },
      {
        type: "mousedown",
        x: 964,
        y: 340,
        time: 98295,
      },
      {
        type: "mouseup",
        x: 964,
        y: 339,
        time: 98336,
      },
      {
        type: "mousedown",
        x: 697,
        y: 289,
        time: 100000,
      },
      {
        type: "mouseup",
        x: 697,
        y: 289,
        time: 100002,
      },
      {
        type: "mousedown",
        x: 1218,
        y: 341,
        time: 101528,
      },
      {
        type: "mouseup",
        x: 1218,
        y: 340,
        time: 101994,
      },
    ].map(ev=>({...ev,time: ev.time-27000}));

    runScript(inputs);

    // record user actions
    // let bootTime = new Date().getTime();
    // window.userEvents = [];
    // window.onmousedown = (ev: any) => {
    //   window.userEvents.push({
    //     type: "mousedown",
    //     x: ev.clientX,
    //     y: ev.clientY,
    //     time: new Date().getTime() - bootTime,
    //   });
    // };
    // window.onmouseup = (ev: any) => {
    //   window.userEvents.push({
    //     type: "mouseup",
    //     x: ev.clientX,
    //     y: ev.clientY,
    //     time: new Date().getTime() - bootTime,
    //   });
    // };
  }
})();

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
        x: 740,
        y: 598,
        time: 7667,
      },
      {
        type: "mouseup",
        x: 740,
        y: 598,
        time: 7758,
      },
      {
        type: "mousedown",
        x: 936,
        y: 118,
        time: 15134,
      },
      {
        type: "mouseup",
        x: 936,
        y: 117,
        time: 15284,
      },
      {
        type: "mousedown",
        x: 1027,
        y: 135,
        time: 16491,
      },
      {
        type: "mouseup",
        x: 1027,
        y: 134,
        time: 16609,
      },
      {
        type: "mousedown",
        x: 952,
        y: 145,
        time: 17629,
      },
      {
        type: "mouseup",
        x: 952,
        y: 145,
        time: 17841,
      },
      {
        type: "mousedown",
        x: 708,
        y: 257,
        time: 19589,
      },
      {
        type: "mouseup",
        x: 708,
        y: 257,
        time: 19722,
      },
      {
        type: "mousedown",
        x: 574,
        y: 282,
        time: 20389,
      },
      {
        type: "mouseup",
        x: 574,
        y: 282,
        time: 20521,
      },
      {
        type: "mousedown",
        x: 574,
        y: 282,
        time: 20705,
      },
      {
        type: "mouseup",
        x: 574,
        y: 282,
        time: 20804,
      },
      {
        type: "mousedown",
        x: 567,
        y: 382,
        time: 21543,
      },
      {
        type: "mouseup",
        x: 568,
        y: 382,
        time: 21650,
      },
      {
        type: "mousedown",
        x: 568,
        y: 382,
        time: 21787,
      },
      {
        type: "mouseup",
        x: 568,
        y: 382,
        time: 21885,
      },
      {
        type: "mousedown",
        x: 568,
        y: 382,
        time: 21999,
      },
      {
        type: "mouseup",
        x: 568,
        y: 382,
        time: 22113,
      },
      {
        type: "mousedown",
        x: 568,
        y: 382,
        time: 22211,
      },
      {
        type: "mouseup",
        x: 568,
        y: 382,
        time: 22311,
      },
      {
        type: "mousedown",
        x: 568,
        y: 382,
        time: 22407,
      },
      {
        type: "mouseup",
        x: 568,
        y: 382,
        time: 22529,
      },
      {
        type: "mousedown",
        x: 568,
        y: 382,
        time: 22603,
      },
      {
        type: "mouseup",
        x: 568,
        y: 382,
        time: 22728,
      },
      {
        type: "mousedown",
        x: 568,
        y: 382,
        time: 22821,
      },
      {
        type: "mouseup",
        x: 568,
        y: 382,
        time: 22977,
      },
      {
        type: "mousedown",
        x: 568,
        y: 382,
        time: 23027,
      },
      {
        type: "mouseup",
        x: 568,
        y: 382,
        time: 23161,
      },
      {
        type: "mousedown",
        x: 569,
        y: 497,
        time: 24353,
      },
      {
        type: "mouseup",
        x: 569,
        y: 498,
        time: 24483,
      },
      {
        type: "mousedown",
        x: 569,
        y: 498,
        time: 24571,
      },
      {
        type: "mouseup",
        x: 569,
        y: 498,
        time: 24661,
      },
      {
        type: "mousedown",
        x: 569,
        y: 498,
        time: 24761,
      },
      {
        type: "mouseup",
        x: 569,
        y: 498,
        time: 24851,
      },
      {
        type: "mousedown",
        x: 569,
        y: 498,
        time: 24957,
      },
      {
        type: "mouseup",
        x: 569,
        y: 498,
        time: 25042,
      },
      {
        type: "mousedown",
        x: 569,
        y: 498,
        time: 25153,
      },
      {
        type: "mouseup",
        x: 569,
        y: 498,
        time: 25238,
      },
      {
        type: "mousedown",
        x: 566,
        y: 518,
        time: 25873,
      },
      {
        type: "mouseup",
        x: 566,
        y: 518,
        time: 25960,
      },
      {
        type: "mousedown",
        x: 566,
        y: 518,
        time: 26109,
      },
      {
        type: "mouseup",
        x: 566,
        y: 518,
        time: 26172,
      },
      {
        type: "mousedown",
        x: 566,
        y: 518,
        time: 26313,
      },
      {
        type: "mouseup",
        x: 566,
        y: 518,
        time: 26398,
      },
      {
        type: "mousedown",
        x: 566,
        y: 518,
        time: 26549,
      },
      {
        type: "mouseup",
        x: 566,
        y: 518,
        time: 26626,
      },
      {
        type: "mousedown",
        x: 577,
        y: 264,
        time: 27381,
      },
      {
        type: "mouseup",
        x: 577,
        y: 264,
        time: 27459,
      },
      {
        type: "mousedown",
        x: 577,
        y: 264,
        time: 27587,
      },
      {
        type: "mouseup",
        x: 577,
        y: 264,
        time: 27663,
      },
      {
        type: "mousedown",
        x: 577,
        y: 264,
        time: 27803,
      },
      {
        type: "mouseup",
        x: 577,
        y: 264,
        time: 27883,
      },
      {
        type: "mousedown",
        x: 577,
        y: 264,
        time: 28031,
      },
      {
        type: "mouseup",
        x: 577,
        y: 264,
        time: 28109,
      },
      {
        type: "mousedown",
        x: 577,
        y: 264,
        time: 28313,
      },
      {
        type: "mouseup",
        x: 577,
        y: 264,
        time: 28406,
      },
      {
        type: "mousedown",
        x: 722,
        y: 256,
        time: 29593,
      },
      {
        type: "mouseup",
        x: 722,
        y: 256,
        time: 29701,
      },
      {
        type: "mousedown",
        x: 720,
        y: 385,
        time: 30613,
      },
      {
        type: "mouseup",
        x: 720,
        y: 385,
        time: 30687,
      },
      {
        type: "mousedown",
        x: 717,
        y: 506,
        time: 31932,
      },
      {
        type: "mouseup",
        x: 717,
        y: 506,
        time: 32058,
      },
      {
        type: "mousedown",
        x: 720,
        y: 649,
        time: 33861,
      },
      {
        type: "mouseup",
        x: 720,
        y: 649,
        time: 33987,
      },
      {
        type: "mousedown",
        x: 827,
        y: 651,
        time: 34793,
      },
      {
        type: "mouseup",
        x: 827,
        y: 651,
        time: 34947,
      },
      {
        type: "mousedown",
        x: 755,
        y: 648,
        time: 35696,
      },
      {
        type: "mouseup",
        x: 754,
        y: 648,
        time: 35834,
      },
      {
        type: "mousedown",
        x: 647,
        y: 655,
        time: 36504,
      },
      {
        type: "mouseup",
        x: 647,
        y: 654,
        time: 36633,
      },
      {
        type: "mousedown",
        x: 1248,
        y: 662,
        time: 38150,
      },
      {
        type: "mouseup",
        x: 1248,
        y: 661,
        time: 38217,
      },
      {
        type: "mousedown",
        x: 359,
        y: 608,
        time: 47312,
      },
      {
        type: "mouseup",
        x: 359,
        y: 608,
        time: 47624,
      },
      {
        type: "mousedown",
        x: 564,
        y: 719,
        time: 50182,
      },
      {
        type: "mouseup",
        x: 564,
        y: 719,
        time: 50301,
      },
      {
        type: "mousedown",
        x: 570,
        y: 493,
        time: 51500,
      },
      {
        type: "mouseup",
        x: 571,
        y: 493,
        time: 52011,
      },
      {
        type: "mousedown",
        x: 1040,
        y: 219,
        time: 54553,
      },
      {
        type: "mouseup",
        x: 1040,
        y: 219,
        time: 54777,
      },
      {
        type: "mousedown",
        x: 693,
        y: 741,
        time: 56042,
      },
      {
        type: "mouseup",
        x: 693,
        y: 741,
        time: 56307,
      },
      {
        type: "mousedown",
        x: 678,
        y: 459,
        time: 57352,
      },
      {
        type: "mouseup",
        x: 678,
        y: 459,
        time: 57398,
      },
      {
        type: "mousedown",
        x: 949,
        y: 338,
        time: 59810,
      },
      {
        type: "mouseup",
        x: 949,
        y: 338,
        time: 59837,
      },
      {
        type: "mousedown",
        x: 690,
        y: 170,
        time: 61782,
      },
      {
        type: "mouseup",
        x: 690,
        y: 170,
        time: 61860,
      },
      {
        type: "mousedown",
        x: 426,
        y: 283,
        time: 64116,
      },
      {
        type: "mouseup",
        x: 426,
        y: 283,
        time: 64174,
      },
      {
        type: "mousedown",
        x: 691,
        y: 111,
        time: 66285,
      },
      {
        type: "mouseup",
        x: 691,
        y: 111,
        time: 66403,
      },
      {
        type: "mousedown",
        x: 1215,
        y: 344,
        time: 69296,
      },
      {
        type: "mouseup",
        x: 1215,
        y: 344,
        time: 69606,
      },
      {
        type: "mousedown",
        x: 577,
        y: 728,
        time: 72481,
      },
      {
        type: "mouseup",
        x: 577,
        y: 728,
        time: 72610,
      },
      {
        type: "mousedown",
        x: 920,
        y: 490,
        time: 74897,
      },
      {
        type: "mouseup",
        x: 920,
        y: 490,
        time: 75330,
      },
      {
        type: "mousedown",
        x: 1021,
        y: 214,
        time: 77117,
      },
      {
        type: "mouseup",
        x: 1021,
        y: 214,
        time: 77332,
      },
      {
        type: "mousedown",
        x: 345,
        y: 62,
        time: 82497,
      },
      {
        type: "mouseup",
        x: 345,
        y: 61,
        time: 82623,
      },
      {
        type: "mousedown",
        x: 477,
        y: 168,
        time: 84555,
      },
      {
        type: "mouseup",
        x: 477,
        y: 168,
        time: 84794,
      },
      {
        type: "mousedown",
        x: 390,
        y: 414,
        time: 86889,
      },
      {
        type: "mouseup",
        x: 390,
        y: 414,
        time: 87163,
      },
      {
        type: "mousedown",
        x: 588,
        y: 726,
        time: 89241,
      },
      {
        type: "mouseup",
        x: 588,
        y: 726,
        time: 89349,
      },
      {
        type: "mousedown",
        x: 581,
        y: 184,
        time: 90543,
      },
      {
        type: "mouseup",
        x: 581,
        y: 183,
        time: 90969,
      },
      {
        type: "mousedown",
        x: 1016,
        y: 212,
        time: 93337,
      },
      {
        type: "mouseup",
        x: 1016,
        y: 212,
        time: 93570,
      },
      {
        type: "mousedown",
        x: 139,
        y: 61,
        time: 97446,
      },
      {
        type: "mouseup",
        x: 139,
        y: 61,
        time: 97930,
      },
      {
        type: "mousedown",
        x: 615,
        y: 150,
        time: 99343,
      },
      {
        type: "mouseup",
        x: 615,
        y: 150,
        time: 99446,
      },
      {
        type: "mousedown",
        x: 963,
        y: 139,
        time: 100568,
      },
      {
        type: "mouseup",
        x: 963,
        y: 138,
        time: 100694,
      },
      {
        type: "mousedown",
        x: 1271,
        y: 63,
        time: 103104,
      },
      {
        type: "mouseup",
        x: 1271,
        y: 63,
        time: 103269,
      },
      {
        type: "mousedown",
        x: 926,
        y: 479,
        time: 105955,
      },
      {
        type: "mouseup",
        x: 926,
        y: 479,
        time: 106191,
      },
      {
        type: "mousedown",
        x: 573,
        y: 733,
        time: 107657,
      },
      {
        type: "mouseup",
        x: 573,
        y: 733,
        time: 107789,
      },
      {
        type: "mousedown",
        x: 553,
        y: 187,
        time: 108921,
      },
      {
        type: "mouseup",
        x: 553,
        y: 187,
        time: 109371,
      },
      {
        type: "mousedown",
        x: 1045,
        y: 206,
        time: 148195,
      },
      {
        type: "mouseup",
        x: 1045,
        y: 206,
        time: 148345,
      },
      {
        type: "mousedown",
        x: 461,
        y: 198,
        time: 150815,
      },
      {
        type: "mouseup",
        x: 461,
        y: 198,
        time: 151041,
      },
      {
        type: "mousedown",
        x: 581,
        y: 725,
        time: 153309,
      },
      {
        type: "mouseup",
        x: 581,
        y: 725,
        time: 153534,
      },
      {
        type: "mousedown",
        x: 693,
        y: 387,
        time: 155686,
      },
      {
        type: "mouseup",
        x: 693,
        y: 387,
        time: 155748,
      },
      {
        type: "mousedown",
        x: 778,
        y: 335,
        time: 157098,
      },
      {
        type: "mouseup",
        x: 778,
        y: 334,
        time: 157160,
      },
      {
        type: "mousedown",
        x: 887,
        y: 282,
        time: 158231,
      },
      {
        type: "mouseup",
        x: 887,
        y: 282,
        time: 158312,
      },
      {
        type: "mousedown",
        x: 1134,
        y: 280,
        time: 160346,
      },
      {
        type: "mouseup",
        x: 1134,
        y: 280,
        time: 160656,
      },
    ];

    runScript(inputs);

    // TODO: crashing when attempts to render experience of killed unit

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

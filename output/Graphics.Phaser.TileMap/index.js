// Generated by purs version 0.14.4
"use strict";
var $foreign = require("./foreign.js");
var Data_Nullable = require("../Data.Nullable/index.js");
var Effect_Uncurried = require("../Effect.Uncurried/index.js");
var makeTileMap = Effect_Uncurried.runEffectFn2($foreign.makeTileMapImpl);
var defaultTilesetDesc = {
    key: Data_Nullable["null"],
    tileWidth: Data_Nullable["null"],
    tileHeight: Data_Nullable["null"],
    tileMargin: Data_Nullable["null"],
    tileSpacing: Data_Nullable["null"],
    gid: Data_Nullable["null"]
};
var createLayer = function (dictShow) {
    return Effect_Uncurried.runEffectFn3($foreign.createLayerImpl);
};
var addTilesetImage = Effect_Uncurried.runEffectFn3($foreign.addTilesetImageImpl);
module.exports = {
    makeTileMap: makeTileMap,
    defaultTilesetDesc: defaultTilesetDesc,
    createLayer: createLayer,
    addTilesetImage: addTilesetImage,
    tilesets: $foreign.tilesets
};

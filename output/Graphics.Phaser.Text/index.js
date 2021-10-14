// Generated by purs version 0.14.4
"use strict";
var $foreign = require("./foreign.js");
var Effect_Uncurried = require("../Effect.Uncurried/index.js");
var updateText = Effect_Uncurried.runEffectFn2($foreign.updateTextImpl);
var setText = Effect_Uncurried.runEffectFn2($foreign.setTextImpl);
var setStyle = Effect_Uncurried.runEffectFn2($foreign.setStyleImpl);
var setStroke = Effect_Uncurried.runEffectFn3($foreign.setStrokeImpl);
var setShadowStroke = Effect_Uncurried.runEffectFn2($foreign.setShadowStrokeImpl);
var setShadowOffset = Effect_Uncurried.runEffectFn2($foreign.setShadowOffsetImpl);
var setShadowFill = Effect_Uncurried.runEffectFn2($foreign.setShadowFillImpl);
var setShadowColor = Effect_Uncurried.runEffectFn2($foreign.setShadowColorImpl);
var setShadowBlur = Effect_Uncurried.runEffectFn2($foreign.setShadowBlurImpl);
var setShadow = Effect_Uncurried.runEffectFn2($foreign.setShadowImpl);
var setPadding = Effect_Uncurried.runEffectFn2($foreign.setPaddingImpl);
var setMaxLines = Effect_Uncurried.runEffectFn2($foreign.setMaxLinesImpl);
var setLineSpacing = Effect_Uncurried.runEffectFn2($foreign.setLineSpacingImpl);
var setFontStyle = Effect_Uncurried.runEffectFn2($foreign.setFontStyleImpl);
var setFontSize = Effect_Uncurried.runEffectFn2($foreign.setFontSizeImpl);
var setFontFamily = Effect_Uncurried.runEffectFn2($foreign.setFontFamilyImpl);
var setFont = Effect_Uncurried.runEffectFn2($foreign.setFontImpl);
var setColor = Effect_Uncurried.runEffectFn2($foreign.setColorImpl);
var create = Effect_Uncurried.runEffectFn2($foreign.createImpl);
module.exports = {
    create: create,
    setText: setText,
    setColor: setColor,
    setFontFamily: setFontFamily,
    setFont: setFont,
    setFontSize: setFontSize,
    setFontStyle: setFontStyle,
    setLineSpacing: setLineSpacing,
    setMaxLines: setMaxLines,
    setPadding: setPadding,
    setShadowBlur: setShadowBlur,
    setShadowColor: setShadowColor,
    setShadowFill: setShadowFill,
    setShadow: setShadow,
    setShadowOffset: setShadowOffset,
    setShadowStroke: setShadowStroke,
    setStroke: setStroke,
    setStyle: setStyle,
    updateText: updateText
};

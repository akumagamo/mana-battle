// Generated by purs version 0.14.4
"use strict";
var Data_Functor = require("../Data.Functor/index.js");
var Data_Void = require("../Data.Void/index.js");
var contravariantConst = {
    cmap: function (v) {
        return function (v1) {
            return v1;
        };
    }
};
var cmap = function (dict) {
    return dict.cmap;
};
var cmapFlipped = function (dictContravariant) {
    return function (x) {
        return function (f) {
            return cmap(dictContravariant)(f)(x);
        };
    };
};
var coerce = function (dictContravariant) {
    return function (dictFunctor) {
        return function (a) {
            return Data_Functor.map(dictFunctor)(Data_Void.absurd)(cmap(dictContravariant)(Data_Void.absurd)(a));
        };
    };
};
var imapC = function (dictContravariant) {
    return function (v) {
        return function (f) {
            return cmap(dictContravariant)(f);
        };
    };
};
module.exports = {
    cmap: cmap,
    cmapFlipped: cmapFlipped,
    coerce: coerce,
    imapC: imapC,
    contravariantConst: contravariantConst
};

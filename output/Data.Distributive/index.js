// Generated by purs version 0.14.4
"use strict";
var Control_Category = require("../Control.Category/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Identity = require("../Data.Identity/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Tuple = require("../Data.Tuple/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Type_Equality = require("../Type.Equality/index.js");
var distributiveIdentity = {
    distribute: function (dictFunctor) {
        var $16 = Data_Functor.map(dictFunctor)(Data_Newtype.unwrap());
        return function ($17) {
            return Data_Identity.Identity($16($17));
        };
    },
    collect: function (dictFunctor) {
        return function (f) {
            var $18 = Data_Functor.map(dictFunctor)((function () {
                var $20 = Data_Newtype.unwrap();
                return function ($21) {
                    return $20(f($21));
                };
            })());
            return function ($19) {
                return Data_Identity.Identity($18($19));
            };
        };
    },
    Functor0: function () {
        return Data_Identity.functorIdentity;
    }
};
var distribute = function (dict) {
    return dict.distribute;
};
var distributiveFunction = {
    distribute: function (dictFunctor) {
        return function (a) {
            return function (e) {
                return Data_Functor.map(dictFunctor)(function (v) {
                    return v(e);
                })(a);
            };
        };
    },
    collect: function (dictFunctor) {
        return function (f) {
            var $22 = distribute(distributiveFunction)(dictFunctor);
            var $23 = Data_Functor.map(dictFunctor)(f);
            return function ($24) {
                return $22($23($24));
            };
        };
    },
    Functor0: function () {
        return Data_Functor.functorFn;
    }
};
var cotraverse = function (dictDistributive) {
    return function (dictFunctor) {
        return function (f) {
            var $25 = Data_Functor.map(dictDistributive.Functor0())(f);
            var $26 = distribute(dictDistributive)(dictFunctor);
            return function ($27) {
                return $25($26($27));
            };
        };
    };
};
var collectDefault = function (dictDistributive) {
    return function (dictFunctor) {
        return function (f) {
            var $28 = distribute(dictDistributive)(dictFunctor);
            var $29 = Data_Functor.map(dictFunctor)(f);
            return function ($30) {
                return $28($29($30));
            };
        };
    };
};
var distributiveTuple = function (dictTypeEquals) {
    return {
        collect: function (dictFunctor) {
            return collectDefault(distributiveTuple(dictTypeEquals))(dictFunctor);
        },
        distribute: function (dictFunctor) {
            var $31 = Data_Tuple.Tuple.create(Type_Equality.from(dictTypeEquals)(Data_Unit.unit));
            var $32 = Data_Functor.map(dictFunctor)(Data_Tuple.snd);
            return function ($33) {
                return $31($32($33));
            };
        },
        Functor0: function () {
            return Data_Tuple.functorTuple;
        }
    };
};
var collect = function (dict) {
    return dict.collect;
};
var distributeDefault = function (dictDistributive) {
    return function (dictFunctor) {
        return collect(dictDistributive)(dictFunctor)(Control_Category.identity(Control_Category.categoryFn));
    };
};
module.exports = {
    collect: collect,
    distribute: distribute,
    distributeDefault: distributeDefault,
    collectDefault: collectDefault,
    cotraverse: cotraverse,
    distributiveIdentity: distributiveIdentity,
    distributiveFunction: distributiveFunction,
    distributiveTuple: distributiveTuple
};

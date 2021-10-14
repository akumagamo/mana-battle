// Generated by purs version 0.14.4
"use strict";
var Data_Eq = require("../Data.Eq/index.js");
var Data_Functor_Invariant = require("../Data.Functor.Invariant/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Show = require("../Data.Show/index.js");
var Const = function (x) {
    return x;
};
var showConst = function (dictShow) {
    return {
        show: function (v) {
            return "(Const " + (Data_Show.show(dictShow)(v) + ")");
        }
    };
};
var semiringConst = function (dictSemiring) {
    return dictSemiring;
};
var semigroupoidConst = {
    compose: function (v) {
        return function (v1) {
            return v1;
        };
    }
};
var semigroupConst = function (dictSemigroup) {
    return dictSemigroup;
};
var ringConst = function (dictRing) {
    return dictRing;
};
var ordConst = function (dictOrd) {
    return dictOrd;
};
var newtypeConst = {
    Coercible0: function () {
        return undefined;
    }
};
var monoidConst = function (dictMonoid) {
    return dictMonoid;
};
var heytingAlgebraConst = function (dictHeytingAlgebra) {
    return dictHeytingAlgebra;
};
var functorConst = {
    map: function (f) {
        return function (m) {
            return m;
        };
    }
};
var invariantConst = {
    imap: Data_Functor_Invariant.imapF(functorConst)
};
var euclideanRingConst = function (dictEuclideanRing) {
    return dictEuclideanRing;
};
var eqConst = function (dictEq) {
    return dictEq;
};
var eq1Const = function (dictEq) {
    return {
        eq1: function (dictEq1) {
            return Data_Eq.eq(eqConst(dictEq));
        }
    };
};
var ord1Const = function (dictOrd) {
    return {
        compare1: function (dictOrd1) {
            return Data_Ord.compare(ordConst(dictOrd));
        },
        Eq10: function () {
            return eq1Const(dictOrd.Eq0());
        }
    };
};
var commutativeRingConst = function (dictCommutativeRing) {
    return dictCommutativeRing;
};
var boundedConst = function (dictBounded) {
    return dictBounded;
};
var booleanAlgebraConst = function (dictBooleanAlgebra) {
    return dictBooleanAlgebra;
};
var applyConst = function (dictSemigroup) {
    return {
        apply: function (v) {
            return function (v1) {
                return Data_Semigroup.append(dictSemigroup)(v)(v1);
            };
        },
        Functor0: function () {
            return functorConst;
        }
    };
};
var applicativeConst = function (dictMonoid) {
    return {
        pure: function (v) {
            return Data_Monoid.mempty(dictMonoid);
        },
        Apply0: function () {
            return applyConst(dictMonoid.Semigroup0());
        }
    };
};
module.exports = {
    Const: Const,
    newtypeConst: newtypeConst,
    eqConst: eqConst,
    eq1Const: eq1Const,
    ordConst: ordConst,
    ord1Const: ord1Const,
    boundedConst: boundedConst,
    showConst: showConst,
    semigroupoidConst: semigroupoidConst,
    semigroupConst: semigroupConst,
    monoidConst: monoidConst,
    semiringConst: semiringConst,
    ringConst: ringConst,
    euclideanRingConst: euclideanRingConst,
    commutativeRingConst: commutativeRingConst,
    heytingAlgebraConst: heytingAlgebraConst,
    booleanAlgebraConst: booleanAlgebraConst,
    functorConst: functorConst,
    invariantConst: invariantConst,
    applyConst: applyConst,
    applicativeConst: applicativeConst
};

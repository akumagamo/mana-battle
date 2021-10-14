// Generated by purs version 0.14.4
"use strict";
var Control_Alt = require("../Control.Alt/index.js");
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Control_Monad_Cont_Class = require("../Control.Monad.Cont.Class/index.js");
var Control_Monad_Error_Class = require("../Control.Monad.Error.Class/index.js");
var Control_Monad_Reader_Class = require("../Control.Monad.Reader.Class/index.js");
var Control_Monad_Rec_Class = require("../Control.Monad.Rec.Class/index.js");
var Control_Monad_State_Class = require("../Control.Monad.State.Class/index.js");
var Control_Monad_Trans_Class = require("../Control.Monad.Trans.Class/index.js");
var Control_Monad_Writer_Class = require("../Control.Monad.Writer.Class/index.js");
var Control_Plus = require("../Control.Plus/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Tuple = require("../Data.Tuple/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Effect_Class = require("../Effect.Class/index.js");
var StateT = function (x) {
    return x;
};
var withStateT = function (f) {
    return function (v) {
        return function ($106) {
            return v(f($106));
        };
    };
};
var runStateT = function (v) {
    return v;
};
var newtypeStateT = {
    Coercible0: function () {
        return undefined;
    }
};
var monadTransStateT = {
    lift: function (dictMonad) {
        return function (m) {
            return function (s) {
                return Control_Bind.bind(dictMonad.Bind1())(m)(function (x) {
                    return Control_Applicative.pure(dictMonad.Applicative0())(new Data_Tuple.Tuple(x, s));
                });
            };
        };
    }
};
var mapStateT = function (f) {
    return function (v) {
        return function ($107) {
            return f(v($107));
        };
    };
};
var lazyStateT = {
    defer: function (f) {
        return function (s) {
            var v = f(Data_Unit.unit);
            return v(s);
        };
    }
};
var functorStateT = function (dictFunctor) {
    return {
        map: function (f) {
            return function (v) {
                return function (s) {
                    return Data_Functor.map(dictFunctor)(function (v1) {
                        return new Data_Tuple.Tuple(f(v1.value0), v1.value1);
                    })(v(s));
                };
            };
        }
    };
};
var execStateT = function (dictFunctor) {
    return function (v) {
        return function (s) {
            return Data_Functor.map(dictFunctor)(Data_Tuple.snd)(v(s));
        };
    };
};
var evalStateT = function (dictFunctor) {
    return function (v) {
        return function (s) {
            return Data_Functor.map(dictFunctor)(Data_Tuple.fst)(v(s));
        };
    };
};
var monadStateT = function (dictMonad) {
    return {
        Applicative0: function () {
            return applicativeStateT(dictMonad);
        },
        Bind1: function () {
            return bindStateT(dictMonad);
        }
    };
};
var bindStateT = function (dictMonad) {
    return {
        bind: function (v) {
            return function (f) {
                return function (s) {
                    return Control_Bind.bind(dictMonad.Bind1())(v(s))(function (v1) {
                        var v3 = f(v1.value0);
                        return v3(v1.value1);
                    });
                };
            };
        },
        Apply0: function () {
            return applyStateT(dictMonad);
        }
    };
};
var applyStateT = function (dictMonad) {
    return {
        apply: Control_Monad.ap(monadStateT(dictMonad)),
        Functor0: function () {
            return functorStateT(((dictMonad.Bind1()).Apply0()).Functor0());
        }
    };
};
var applicativeStateT = function (dictMonad) {
    return {
        pure: function (a) {
            return function (s) {
                return Control_Applicative.pure(dictMonad.Applicative0())(new Data_Tuple.Tuple(a, s));
            };
        },
        Apply0: function () {
            return applyStateT(dictMonad);
        }
    };
};
var semigroupStateT = function (dictMonad) {
    return function (dictSemigroup) {
        return {
            append: Control_Apply.lift2(applyStateT(dictMonad))(Data_Semigroup.append(dictSemigroup))
        };
    };
};
var monadAskStateT = function (dictMonadAsk) {
    return {
        ask: Control_Monad_Trans_Class.lift(monadTransStateT)(dictMonadAsk.Monad0())(Control_Monad_Reader_Class.ask(dictMonadAsk)),
        Monad0: function () {
            return monadStateT(dictMonadAsk.Monad0());
        }
    };
};
var monadReaderStateT = function (dictMonadReader) {
    return {
        local: (function () {
            var $108 = Control_Monad_Reader_Class.local(dictMonadReader);
            return function ($109) {
                return mapStateT($108($109));
            };
        })(),
        MonadAsk0: function () {
            return monadAskStateT(dictMonadReader.MonadAsk0());
        }
    };
};
var monadContStateT = function (dictMonadCont) {
    return {
        callCC: function (f) {
            return function (s) {
                return Control_Monad_Cont_Class.callCC(dictMonadCont)(function (c) {
                    var v = f(function (a) {
                        return function (s$prime) {
                            return c(new Data_Tuple.Tuple(a, s$prime));
                        };
                    });
                    return v(s);
                });
            };
        },
        Monad0: function () {
            return monadStateT(dictMonadCont.Monad0());
        }
    };
};
var monadEffectState = function (dictMonadEffect) {
    return {
        liftEffect: (function () {
            var $110 = Control_Monad_Trans_Class.lift(monadTransStateT)(dictMonadEffect.Monad0());
            var $111 = Effect_Class.liftEffect(dictMonadEffect);
            return function ($112) {
                return $110($111($112));
            };
        })(),
        Monad0: function () {
            return monadStateT(dictMonadEffect.Monad0());
        }
    };
};
var monadRecStateT = function (dictMonadRec) {
    return {
        tailRecM: function (f) {
            return function (a) {
                var f$prime = function (v) {
                    var v1 = f(v.value0);
                    return Control_Bind.bind((dictMonadRec.Monad0()).Bind1())(v1(v.value1))(function (v2) {
                        return Control_Applicative.pure((dictMonadRec.Monad0()).Applicative0())((function () {
                            if (v2.value0 instanceof Control_Monad_Rec_Class.Loop) {
                                return new Control_Monad_Rec_Class.Loop(new Data_Tuple.Tuple(v2.value0.value0, v2.value1));
                            };
                            if (v2.value0 instanceof Control_Monad_Rec_Class.Done) {
                                return new Control_Monad_Rec_Class.Done(new Data_Tuple.Tuple(v2.value0.value0, v2.value1));
                            };
                            throw new Error("Failed pattern match at Control.Monad.State.Trans (line 88, column 16 - line 90, column 40): " + [ v2.value0.constructor.name ]);
                        })());
                    });
                };
                return function (s) {
                    return Control_Monad_Rec_Class.tailRecM(dictMonadRec)(f$prime)(new Data_Tuple.Tuple(a, s));
                };
            };
        },
        Monad0: function () {
            return monadStateT(dictMonadRec.Monad0());
        }
    };
};
var monadStateStateT = function (dictMonad) {
    return {
        state: function (f) {
            return StateT((function () {
                var $113 = Control_Applicative.pure(dictMonad.Applicative0());
                return function ($114) {
                    return $113(f($114));
                };
            })());
        },
        Monad0: function () {
            return monadStateT(dictMonad);
        }
    };
};
var monadTellStateT = function (dictMonadTell) {
    return {
        tell: (function () {
            var $115 = Control_Monad_Trans_Class.lift(monadTransStateT)(dictMonadTell.Monad1());
            var $116 = Control_Monad_Writer_Class.tell(dictMonadTell);
            return function ($117) {
                return $115($116($117));
            };
        })(),
        Semigroup0: dictMonadTell.Semigroup0,
        Monad1: function () {
            return monadStateT(dictMonadTell.Monad1());
        }
    };
};
var monadWriterStateT = function (dictMonadWriter) {
    return {
        listen: function (m) {
            return function (s) {
                return Control_Bind.bind(((dictMonadWriter.MonadTell1()).Monad1()).Bind1())(Control_Monad_Writer_Class.listen(dictMonadWriter)(m(s)))(function (v) {
                    return Control_Applicative.pure(((dictMonadWriter.MonadTell1()).Monad1()).Applicative0())(new Data_Tuple.Tuple(new Data_Tuple.Tuple(v.value0.value0, v.value1), v.value0.value1));
                });
            };
        },
        pass: function (m) {
            return function (s) {
                return Control_Monad_Writer_Class.pass(dictMonadWriter)(Control_Bind.bind(((dictMonadWriter.MonadTell1()).Monad1()).Bind1())(m(s))(function (v) {
                    return Control_Applicative.pure(((dictMonadWriter.MonadTell1()).Monad1()).Applicative0())(new Data_Tuple.Tuple(new Data_Tuple.Tuple(v.value0.value0, v.value1), v.value0.value1));
                }));
            };
        },
        Monoid0: dictMonadWriter.Monoid0,
        MonadTell1: function () {
            return monadTellStateT(dictMonadWriter.MonadTell1());
        }
    };
};
var monadThrowStateT = function (dictMonadThrow) {
    return {
        throwError: function (e) {
            return Control_Monad_Trans_Class.lift(monadTransStateT)(dictMonadThrow.Monad0())(Control_Monad_Error_Class.throwError(dictMonadThrow)(e));
        },
        Monad0: function () {
            return monadStateT(dictMonadThrow.Monad0());
        }
    };
};
var monadErrorStateT = function (dictMonadError) {
    return {
        catchError: function (v) {
            return function (h) {
                return function (s) {
                    return Control_Monad_Error_Class.catchError(dictMonadError)(v(s))(function (e) {
                        var v1 = h(e);
                        return v1(s);
                    });
                };
            };
        },
        MonadThrow0: function () {
            return monadThrowStateT(dictMonadError.MonadThrow0());
        }
    };
};
var monoidStateT = function (dictMonad) {
    return function (dictMonoid) {
        return {
            mempty: Control_Applicative.pure(applicativeStateT(dictMonad))(Data_Monoid.mempty(dictMonoid)),
            Semigroup0: function () {
                return semigroupStateT(dictMonad)(dictMonoid.Semigroup0());
            }
        };
    };
};
var altStateT = function (dictMonad) {
    return function (dictAlt) {
        return {
            alt: function (v) {
                return function (v1) {
                    return function (s) {
                        return Control_Alt.alt(dictAlt)(v(s))(v1(s));
                    };
                };
            },
            Functor0: function () {
                return functorStateT(dictAlt.Functor0());
            }
        };
    };
};
var plusStateT = function (dictMonad) {
    return function (dictPlus) {
        return {
            empty: function (v) {
                return Control_Plus.empty(dictPlus);
            },
            Alt0: function () {
                return altStateT(dictMonad)(dictPlus.Alt0());
            }
        };
    };
};
var alternativeStateT = function (dictMonad) {
    return function (dictAlternative) {
        return {
            Applicative0: function () {
                return applicativeStateT(dictMonad);
            },
            Plus1: function () {
                return plusStateT(dictMonad)(dictAlternative.Plus1());
            }
        };
    };
};
var monadPlusStateT = function (dictMonadPlus) {
    return {
        Monad0: function () {
            return monadStateT(dictMonadPlus.Monad0());
        },
        Alternative1: function () {
            return alternativeStateT(dictMonadPlus.Monad0())(dictMonadPlus.Alternative1());
        }
    };
};
var monadZeroStateT = function (dictMonadZero) {
    return {
        Monad0: function () {
            return monadStateT(dictMonadZero.Monad0());
        },
        Alternative1: function () {
            return alternativeStateT(dictMonadZero.Monad0())(dictMonadZero.Alternative1());
        },
        MonadZeroIsDeprecated2: function () {
            return undefined;
        }
    };
};
module.exports = {
    StateT: StateT,
    runStateT: runStateT,
    evalStateT: evalStateT,
    execStateT: execStateT,
    mapStateT: mapStateT,
    withStateT: withStateT,
    newtypeStateT: newtypeStateT,
    functorStateT: functorStateT,
    applyStateT: applyStateT,
    applicativeStateT: applicativeStateT,
    altStateT: altStateT,
    plusStateT: plusStateT,
    alternativeStateT: alternativeStateT,
    bindStateT: bindStateT,
    monadStateT: monadStateT,
    monadRecStateT: monadRecStateT,
    monadZeroStateT: monadZeroStateT,
    monadPlusStateT: monadPlusStateT,
    monadTransStateT: monadTransStateT,
    lazyStateT: lazyStateT,
    monadEffectState: monadEffectState,
    monadContStateT: monadContStateT,
    monadThrowStateT: monadThrowStateT,
    monadErrorStateT: monadErrorStateT,
    monadAskStateT: monadAskStateT,
    monadReaderStateT: monadReaderStateT,
    monadStateStateT: monadStateStateT,
    monadTellStateT: monadTellStateT,
    monadWriterStateT: monadWriterStateT,
    semigroupStateT: semigroupStateT,
    monoidStateT: monoidStateT,
    get: Control_Monad_State_Class.get,
    gets: Control_Monad_State_Class.gets,
    modify: Control_Monad_State_Class.modify,
    modify_: Control_Monad_State_Class.modify_,
    put: Control_Monad_State_Class.put,
    state: Control_Monad_State_Class.state,
    lift: Control_Monad_Trans_Class.lift
};

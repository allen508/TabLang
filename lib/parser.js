"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var chevrotain_1 = require("chevrotain");
var pitch_1 = require("./../pitch");
var matchInteger = function (text, startOffset) {
    var endOffset = startOffset;
    var charCode = text.charCodeAt(endOffset);
    // 0-9 digits
    while (charCode >= 48 && charCode <= 57) {
        endOffset++;
        charCode = text.charCodeAt(endOffset);
    }
    // No match, must return null to conform with the RegExp.prototype.exec signature
    if (endOffset === startOffset) {
        return null;
    }
    else {
        var matchedString = text.substring(startOffset, endOffset);
        // according to the RegExp.prototype.exec API the first item in the returned array must be the whole matched string.
        return [matchedString];
    }
};
var whiteSpace = (0, chevrotain_1.createToken)({ name: "WhiteSpace", pattern: /\s+/, group: chevrotain_1.Lexer.SKIPPED });
var newline = (0, chevrotain_1.createToken)({ name: "Newline", pattern: /\n|\r\n?/, group: "nl" });
var title = (0, chevrotain_1.createToken)({ name: "Title", pattern: /title(\s+)?:/ });
var staff = (0, chevrotain_1.createToken)({ name: "Staff", pattern: /staff(\s+)?:/ });
var chords = (0, chevrotain_1.createToken)({ name: "Chords", pattern: /chords(\s+)?:/ });
var notes = (0, chevrotain_1.createToken)({ name: "Notes", pattern: /notes(\s+)?:/ });
var words = (0, chevrotain_1.createToken)({ name: "Words", pattern: /words(\s+)?:/ });
var leftBracket = (0, chevrotain_1.createToken)({ name: "LeftBracket", pattern: /\(/ });
var rightBracket = (0, chevrotain_1.createToken)({ name: "RightBracket", pattern: /\)/ });
var leftBracketSquare = (0, chevrotain_1.createToken)({ name: "LeftBracketSquare", pattern: /\[/ });
var rightBracketSquare = (0, chevrotain_1.createToken)({ name: "RightBracketSquare", pattern: /\]/ });
var sep = (0, chevrotain_1.createToken)({ name: "Sep", pattern: /\// });
var numberLiteral = (0, chevrotain_1.createToken)({ name: "NumberLiteral", pattern: { exec: matchInteger }, line_breaks: true });
var fretNoteModeIndicator = (0, chevrotain_1.createToken)({ name: "FretNoteModeIndicator", pattern: /f/ });
var hammerPick = (0, chevrotain_1.createToken)({ name: "HammerPick", pattern: /[hp]/ });
var barIndicator = (0, chevrotain_1.createToken)({ name: "BarIndicator", pattern: /\|/ });
var repeatSymbol = (0, chevrotain_1.createToken)({ name: "RepeatSymbol", pattern: /\*/ });
var restSymbol = (0, chevrotain_1.createToken)({ name: "RestSymbol", pattern: /\-/ });
var durationUnit = (0, chevrotain_1.createToken)({ name: "DurationUnit", pattern: /[whq]/ });
var bendSymbol = (0, chevrotain_1.createToken)({ name: "BendSymbol", pattern: /\^/ });
var doubleQuote = (0, chevrotain_1.createToken)({ name: "DoubleQuote", pattern: /\"/ });
var stringLiteral = (0, chevrotain_1.createToken)({ name: "StringLiteral", pattern: /[^"]+/ });
var chordName = (0, chevrotain_1.createToken)({ name: "ChordName", pattern: /[A-G][#b]?(?:m|maj|aug|dim|sus)?\d*(?:\/[A-G][#b]?)?/ });
var allTokens = [
    whiteSpace,
    newline,
    title,
    staff,
    chords,
    notes,
    words,
    leftBracket,
    rightBracket,
    numberLiteral,
    sep,
    doubleQuote,
    fretNoteModeIndicator,
    hammerPick,
    barIndicator,
    leftBracketSquare,
    rightBracketSquare,
    repeatSymbol,
    durationUnit,
    restSymbol,
    bendSymbol,
    chordName,
    stringLiteral,
];
var tabLexer = new chevrotain_1.Lexer(allTokens);
var TabCstParser = /** @class */ (function (_super) {
    __extends(TabCstParser, _super);
    function TabCstParser() {
        var _this = _super.call(this, allTokens) || this;
        _this.tab = _this.RULE("tab", function () {
            _this.OPTION(function () {
                _this.SUBRULE(_this.title);
            });
            _this.MANY({
                DEF: function () {
                    _this.SUBRULE(_this.staff);
                }
            });
        });
        _this.title = _this.RULE("title", function () {
            _this.CONSUME(title);
            _this.CONSUME(doubleQuote);
            _this.CONSUME(stringLiteral);
            _this.CONSUME2(doubleQuote);
        });
        _this.staff = _this.RULE("staff", function () {
            _this.CONSUME(staff);
            _this.OPTION(function () {
                _this.SUBRULE(_this.chords);
            });
            _this.SUBRULE(_this.notes);
            _this.OPTION2(function () {
                _this.SUBRULE(_this.words);
            });
        });
        _this.chords = _this.RULE("chords", function () {
            _this.CONSUME(chords);
            _this.MANY({
                DEF: function () {
                    _this.SUBRULE(_this.chordInstructions);
                }
            });
        });
        _this.chordInstructions = _this.RULE("chordInstructions", function () {
            _this.MANY({
                DEF: function () {
                    _this.SUBRULE(_this.chordInstruction);
                }
            });
        });
        _this.chordInstruction = _this.RULE("chordInstruction", function () {
            _this.OR([
                { ALT: function () { return _this.CONSUME(chordName); } },
                { ALT: function () { return _this.SUBRULE(_this.rest); } },
            ]);
        });
        _this.notes = _this.RULE("notes", function () {
            _this.CONSUME(notes);
            _this.MANY({
                DEF: function () {
                    _this.SUBRULE(_this.musicInstructions);
                }
            });
        });
        _this.words = _this.RULE("words", function () {
            _this.CONSUME(words);
        });
        _this.musicInstructions = _this.RULE("musicInstructions", function () {
            _this.MANY({
                DEF: function () {
                    _this.SUBRULE(_this.musicInstruction);
                }
            });
        });
        _this.musicInstruction = _this.RULE("musicInstruction", function () {
            _this.OR([
                { ALT: function () { return _this.SUBRULE(_this.timing); } },
                { ALT: function () { return _this.SUBRULE(_this.note); } },
                { ALT: function () { return _this.SUBRULE(_this.transition); } },
                { ALT: function () { return _this.SUBRULE(_this.bar); } },
                { ALT: function () { return _this.SUBRULE(_this.chord); } },
                { ALT: function () { return _this.SUBRULE(_this.rest); } },
                { ALT: function () { return _this.SUBRULE(_this.bend); } },
            ]);
        });
        _this.timing = _this.RULE("timing", function () {
            _this.CONSUME(leftBracket);
            _this.CONSUME(numberLiteral);
            _this.CONSUME(sep);
            _this.CONSUME2(numberLiteral);
            _this.CONSUME(rightBracket);
        });
        _this.note = _this.RULE("note", function () {
            _this.CONSUME(numberLiteral);
            _this.CONSUME(fretNoteModeIndicator);
            _this.CONSUME2(numberLiteral);
            _this.OPTION(function () {
                _this.CONSUME(sep);
                _this.CONSUME(durationUnit);
            });
        });
        _this.transition = _this.RULE("transition", function () {
            _this.CONSUME(hammerPick);
        });
        _this.bar = _this.RULE("bar", function () {
            _this.CONSUME(barIndicator);
            _this.OPTION(function () {
                _this.CONSUME(repeatSymbol);
                _this.CONSUME(numberLiteral);
            });
        });
        _this.chord = _this.RULE("chord", function () {
            _this.CONSUME(leftBracketSquare);
            _this.MANY({
                DEF: function () {
                    _this.SUBRULE(_this.note);
                }
            });
            _this.CONSUME(rightBracketSquare);
        });
        _this.rest = _this.RULE("rest", function () {
            _this.CONSUME(restSymbol);
            _this.OPTION(function () {
                _this.CONSUME(sep);
                _this.CONSUME(durationUnit);
            });
        });
        _this.bend = _this.RULE("bend", function () {
            _this.CONSUME(bendSymbol);
            _this.OPTION(function () {
                _this.CONSUME(sep);
                _this.CONSUME(durationUnit);
            });
        });
        _this.performSelfAnalysis();
        return _this;
    }
    return TabCstParser;
}(chevrotain_1.CstParser));
var tabCstParser = new TabCstParser();
var BaseCstVisitor = tabCstParser.getBaseCstVisitorConstructor();
var TabInterpreter = /** @class */ (function (_super) {
    __extends(TabInterpreter, _super);
    function TabInterpreter() {
        var _this = _super.call(this) || this;
        _this.validateVisitor();
        return _this;
    }
    TabInterpreter.prototype.tab = function (ctx) {
        var _this = this;
        var title = this.visit(ctx.title);
        var staves = [];
        ctx.staff.forEach(function (item, idx) {
            var staff = _this.visit(item);
            staves = __spreadArray(__spreadArray([], staves, true), [staff], false);
        });
        return { tab: { title: title, staves: staves } };
    };
    TabInterpreter.prototype.title = function (ctx) {
        if (ctx.StringLiteral) {
            return ctx.StringLiteral[0].image;
        }
        return "";
    };
    TabInterpreter.prototype.staff = function (ctx) {
        var chords = this.visit(ctx.chords);
        var notes = this.visit(ctx.notes);
        var words = this.visit(ctx.words);
        return { staff: { chords: chords, notes: notes, words: words } };
        //TODO: Words
    };
    TabInterpreter.prototype.chords = function (ctx) {
        var result = this.visit(ctx.chordInstructions);
        return { chords: result };
    };
    TabInterpreter.prototype.chordInstructions = function (ctx) {
        var _this = this;
        var instructions = [];
        this.visit(ctx.chordInstruction.forEach(function (instruction, idx) {
            instructions = __spreadArray(__spreadArray([], instructions, true), [_this.visit(instruction)], false);
        }));
        return instructions;
    };
    TabInterpreter.prototype.chordInstruction = function (ctx) {
        var rest = this.visit(ctx.rest);
        var instruction = {};
        if (ctx.ChordName) {
            instruction = { chordName: ctx.ChordName[0].image };
        }
        if (rest) {
            instruction = rest;
        }
        return instruction;
    };
    TabInterpreter.prototype.notes = function (ctx) {
        var result = this.visit(ctx.musicInstructions);
        return { instructions: result };
    };
    TabInterpreter.prototype.musicInstructions = function (ctx) {
        var _this = this;
        var instructions = [];
        this.visit(ctx.musicInstruction.forEach(function (instruction, idx) {
            instructions = __spreadArray(__spreadArray([], instructions, true), [_this.visit(instruction)], false);
        }));
        return instructions;
    };
    TabInterpreter.prototype.musicInstruction = function (ctx) {
        var timing = this.visit(ctx.timing);
        var note = this.visit(ctx.note);
        var transition = this.visit(ctx.transition);
        var bar = this.visit(ctx.bar);
        var chord = this.visit(ctx.chord);
        var fret = this.visit(ctx.rest);
        var bend = this.visit(ctx.bend);
        var instruction = {};
        if (timing) {
            instruction = timing;
        }
        ;
        if (note) {
            instruction = note;
        }
        ;
        if (transition) {
            instruction = transition;
        }
        ;
        if (bar) {
            instruction = bar;
        }
        ;
        if (chord) {
            instruction = chord;
        }
        ;
        if (fret) {
            instruction = fret;
        }
        ;
        if (bend) {
            instruction = bend;
        }
        ;
        return instruction;
    };
    TabInterpreter.prototype.timing = function (ctx) {
        var top = Number.parseInt(ctx.NumberLiteral[0].image);
        var bottom = Number.parseInt(ctx.NumberLiteral[1].image);
        return { timing: { top: top, bottom: bottom } };
    };
    TabInterpreter.prototype.note = function (ctx) {
        var string = Number.parseInt(ctx.NumberLiteral[0].image);
        var fret = Number.parseInt(ctx.NumberLiteral[1].image);
        var duration = "w";
        var durationPercent = 1;
        if (ctx.DurationUnit) {
            duration = ctx.DurationUnit[0].image;
            durationPercent = this.durationToPercentage(duration);
        }
        var pitch = this.getPitch(string, fret);
        return { note: { string: string, fret: fret, pitch: pitch, duration: duration, durationPercent: durationPercent } };
    };
    TabInterpreter.prototype.transition = function (ctx) {
        return { transition: { type: ctx.HammerPick[0].image } };
    };
    TabInterpreter.prototype.bar = function (ctx) {
        var result = { bar: { type: "single", repeat: 0 } };
        if (ctx.RepeatSymbol && ctx.NumberLiteral) {
            result = { bar: { type: "single", repeat: ctx.NumberLiteral[0].image } };
        }
        return result;
    };
    TabInterpreter.prototype.chord = function (ctx) {
        var _this = this;
        var notes = [];
        ctx.note.forEach(function (note, idx) {
            var string = Number.parseInt(note.children.NumberLiteral[0].image);
            var fret = Number.parseInt(note.children.NumberLiteral[1].image);
            var pitch = _this.getPitch(string, fret);
            notes = __spreadArray(__spreadArray([], notes, true), [{ note: { string: string, fret: fret, pitch: pitch } }], false);
        });
        var duration = "w";
        var durationPercent = 1;
        return { chord: { notes: notes, duration: duration, durationPercent: durationPercent } };
    };
    TabInterpreter.prototype.rest = function (ctx) {
        var duration = "";
        if (ctx.DurationUnit) {
            duration = ctx.DurationUnit[0].image;
        }
        return { rest: { duration: duration, durationPercent: this.durationToPercentage(duration) } };
    };
    TabInterpreter.prototype.bend = function (ctx) {
        var amount = "";
        if (ctx.DurationUnit) {
            amount = ctx.DurationUnit[0].image;
        }
        return { bend: { amount: amount, amountPercent: this.durationToPercentage(amount) } };
    };
    TabInterpreter.prototype.words = function (ctx) {
        //return this.visit(ctx.musicInstructions);
        return { words: {} };
    };
    TabInterpreter.prototype.durationToPercentage = function (durationUnit) {
        var percentValue = 0;
        if (durationUnit == "q") {
            percentValue = 0.25;
        }
        if (durationUnit == "h") {
            percentValue = 0.5;
        }
        if (durationUnit == "w") {
            percentValue = 1;
        }
        return percentValue;
    };
    TabInterpreter.prototype.getPitch = function (string, fret) {
        //Assume Standard Tuning
        var matrix = pitch_1.fretboardModel.createPitchMatrix(6, 21, "E2,A2,D3,G3,B3,E4");
        return pitch_1.fretboardModel.filterToString(matrix, string)[fret];
    };
    return TabInterpreter;
}(BaseCstVisitor));
var validate = function (tab) {
    var errors = [];
    if (tab.staves.length > 0) {
        errors = __spreadArray(__spreadArray([], errors, true), ["Must have at least 1 stave"], false);
    }
    return errors;
};
var parse = function (tab) {
    //Tokenize
    var lexingResult = tabLexer.tokenize(tab);
    //Parse
    tabCstParser.input = lexingResult.tokens;
    var cst = tabCstParser.tab();
    //Interpret
    var interpreter = new TabInterpreter();
    var result = interpreter.visit(cst);
    //const validationErrors = validate(result);
    return { parsingResult: result, parserErrors: tabCstParser.errors, validationErrors: [] };
};
exports.default = parse;
//# sourceMappingURL=parser.js.map
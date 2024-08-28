import { createToken, Lexer, CstParser } from "chevrotain";
import { fretboardModel } from './../pitch';

const matchInteger = (text: string, startOffset: number) : any | RegExpExecArray | null => {

    let endOffset = startOffset;
    let charCode = text.charCodeAt(endOffset);

    // 0-9 digits
    while (charCode >= 48 && charCode <= 57) {
      endOffset++;
      charCode = text.charCodeAt(endOffset);
    }
  
    // No match, must return null to conform with the RegExp.prototype.exec signature
    if (endOffset === startOffset) {
      return null;
    } else {
      let matchedString = text.substring(startOffset, endOffset);
      // according to the RegExp.prototype.exec API the first item in the returned array must be the whole matched string.
      return [matchedString];
    }
}


const whiteSpace = createToken({ name: "WhiteSpace", pattern: /\s+/, group: Lexer.SKIPPED })
const newline = createToken({ name: "Newline", pattern: /\n|\r\n?/, group: "nl" });

const title = createToken({ name: "Title", pattern:/title(\s+)?:/ });
const staff = createToken({ name: "Staff", pattern:/staff(\s+)?:/ });
const chords = createToken({ name: "Chords", pattern:/chords(\s+)?:/ });
const notes = createToken({ name: "Notes", pattern:/notes(\s+)?:/ });
const words = createToken({ name: "Words", pattern:/words(\s+)?:/ });

const leftBracket = createToken({ name: "LeftBracket", pattern: /\(/ });
const rightBracket = createToken({ name: "RightBracket", pattern: /\)/ });

const leftBracketSquare = createToken({ name: "LeftBracketSquare", pattern: /\[/ });
const rightBracketSquare = createToken({ name: "RightBracketSquare", pattern: /\]/ });

const sep = createToken({ name: "Sep", pattern: /\// });

const numberLiteral = createToken({ name: "NumberLiteral", pattern: { exec : matchInteger }, line_breaks: true });

const fretNoteModeIndicator = createToken({ name: "FretNoteModeIndicator", pattern: /f/ });
const hammerPick = createToken({ name: "HammerPick", pattern: /[hp]/ });

const barIndicator = createToken({ name: "BarIndicator", pattern: /\|/ });

const repeatSymbol = createToken({ name: "RepeatSymbol", pattern: /\*/ });

const restSymbol = createToken({ name: "RestSymbol", pattern: /\-/ });
const durationUnit = createToken({ name: "DurationUnit", pattern: /[whq]/ });
const bendSymbol = createToken({ name: "BendSymbol", pattern: /\^/ });

const doubleQuote = createToken({ name: "DoubleQuote", pattern: /\"/ });
const stringLiteral = createToken({ name: "StringLiteral", pattern: /[^"]+/ });

const chordName =  createToken({ name: "ChordName", pattern: /[A-G][#b]?(?:m|maj|aug|dim|sus)?\d*(?:\/[A-G][#b]?)?/ });

let allTokens = [
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
]

const tabLexer = new Lexer(allTokens);

class TabCstParser extends CstParser {
    constructor() {
      super(allTokens);
      this.performSelfAnalysis();
    }

    public tab = this.RULE("tab", () => {

        this.OPTION(() => {      
            this.SUBRULE(this.title);
        });

        this.MANY({
            DEF: () => {
                this.SUBRULE(this.staff);
            }
        })
    });

    private title = this.RULE("title", () => {
        this.CONSUME(title);
        this.CONSUME(doubleQuote);
        this.CONSUME(stringLiteral);
        this.CONSUME2(doubleQuote);
    })

    private staff = this.RULE("staff", () => {
        this.CONSUME(staff);

        this.OPTION(() => {      
            this.SUBRULE(this.chords);
        });

        this.SUBRULE(this.notes);

        this.OPTION2(() => {      
            this.SUBRULE(this.words);
        });
        
    })

    private chords = this.RULE("chords", () => {

        this.CONSUME(chords);

        this.MANY({
            DEF: () => {
                this.SUBRULE(this.chordInstructions);
            }
        });

    });


    private chordInstructions = this.RULE("chordInstructions", () => {
        this.MANY({
            DEF: () => {
                this.SUBRULE(this.chordInstruction);
            }
        });
    });

    private chordInstruction = this.RULE("chordInstruction", () => {

        this.OR([
            { ALT: () => this.CONSUME(chordName) },
            { ALT: () => this.SUBRULE(this.rest) },
        ])

    });


    private notes = this.RULE("notes", () => {

        this.CONSUME(notes);

        this.MANY({
            DEF: () => {
                this.SUBRULE(this.musicInstructions);
            }
        });

    });

    private words = this.RULE("words", () => {
        this.CONSUME(words);
    })

    private musicInstructions = this.RULE("musicInstructions", () => {
        this.MANY({
            DEF: () => {
                this.SUBRULE(this.musicInstruction);
            }
        });
    });
    
    private musicInstruction = this.RULE("musicInstruction", () => {

        this.OR([
            { ALT: () => this.SUBRULE(this.timing) },
            { ALT: () => this.SUBRULE(this.note) },
            { ALT: () => this.SUBRULE(this.transition) },
            { ALT: () => this.SUBRULE(this.bar) },
            { ALT: () => this.SUBRULE(this.chord) },
            { ALT: () => this.SUBRULE(this.rest) },
            { ALT: () => this.SUBRULE(this.bend) },
        ])

    });

    private timing = this.RULE("timing", () => {
        this.CONSUME(leftBracket);
        this.CONSUME(numberLiteral);
        this.CONSUME(sep);
        this.CONSUME2(numberLiteral);
        this.CONSUME(rightBracket);
    });

    private note = this.RULE("note", () => {
        this.CONSUME(numberLiteral);
        this.CONSUME(fretNoteModeIndicator);
        this.CONSUME2(numberLiteral);
        this.OPTION(() => {      
            this.CONSUME(sep);
            this.CONSUME(durationUnit);
        });
    });

    private transition = this.RULE("transition", () => {
        this.CONSUME(hammerPick);
    });

    private bar = this.RULE("bar", () => {
        this.CONSUME(barIndicator);
        this.OPTION(() => {      
            this.CONSUME(repeatSymbol);
            this.CONSUME(numberLiteral);
        });
    });

    private chord = this.RULE("chord", () => {

        this.CONSUME(leftBracketSquare);
        this.MANY({
            DEF: () => {
                this.SUBRULE(this.note);
            }
        });
        this.CONSUME(rightBracketSquare);
    });


    private rest = this.RULE("rest", () => {
        this.CONSUME(restSymbol);
        this.OPTION(() => {      
            this.CONSUME(sep);
            this.CONSUME(durationUnit);
        });

    });

    private bend = this.RULE("bend", () => {
        this.CONSUME(bendSymbol);
        this.OPTION(() => {      
            this.CONSUME(sep);
            this.CONSUME(durationUnit);
        });

    });

}


const tabCstParser = new TabCstParser();
const BaseCstVisitor = tabCstParser.getBaseCstVisitorConstructor();

class TabInterpreter extends BaseCstVisitor {
    constructor() {
      super();
      this.validateVisitor();
    }
  
    tab(ctx: any) {

        let title = this.visit(ctx.title);

        let staves : any[] = [];

        ctx.staff.forEach((item: any, idx: number) => {
            const staff = this.visit(item);
            staves = [...staves, staff];
        });
        
        return {tab: {title: title, staves: staves}};
    }


    title(ctx: any) {

        if(ctx.StringLiteral) {
            return ctx.StringLiteral[0].image;
        }

        return "";
    }

    staff(ctx: any) {

        const chords = this.visit(ctx.chords);
        const notes = this.visit(ctx.notes);
        const words = this.visit(ctx.words);

        return {staff: {chords: chords, notes: notes, words: words }};

        //TODO: Words
    }

    chords(ctx: any){
        const result = this.visit(ctx.chordInstructions);
        return {chords: result};

    }

    chordInstructions(ctx: any){

        let instructions : any[] = [];

        this.visit(ctx.chordInstruction.forEach((instruction: any, idx : number) => {
            instructions = [...instructions, this.visit(instruction)];
        }));
        
        return instructions;
    }

    chordInstruction(ctx: any){
        
        const rest = this.visit(ctx.rest);

        let instruction: any = {}

        if(ctx.ChordName) {
            instruction = { chordName : ctx.ChordName[0].image };
        }

        if(rest) {
            instruction = rest;
        }

        return instruction;


    }

    notes(ctx: any) {
        const result = this.visit(ctx.musicInstructions);
        return {instructions: result};
    }

    musicInstructions(ctx: any) {

        let instructions : any[] = [];

        this.visit(ctx.musicInstruction.forEach((instruction: any, idx : number) => {
            instructions = [...instructions, this.visit(instruction)];
        }));
        
        return instructions;

    }

    musicInstruction(ctx: any) {

        const timing = this.visit(ctx.timing);
        const note = this.visit(ctx.note);
        const transition = this.visit(ctx.transition);
        const bar = this.visit(ctx.bar);
        const chord = this.visit(ctx.chord);
        const fret = this.visit(ctx.rest);
        const bend = this.visit(ctx.bend);

        let instruction : any = {};

        if(timing) {instruction = timing};
        if(note) {instruction = note};
        if(transition) {instruction = transition};
        if(bar) {instruction = bar};
        if(chord) {instruction = chord};
        if(fret) {instruction = fret};
        if(bend) {instruction = bend};

        return instruction;

    }


    timing(ctx: any) {

        const top = Number.parseInt(ctx.NumberLiteral[0].image);
        const bottom = Number.parseInt(ctx.NumberLiteral[1].image);

        return {timing: {top:top, bottom:bottom} };

    }

    note(ctx: any) {

        const string =  Number.parseInt(ctx.NumberLiteral[0].image);
        const fret =  Number.parseInt(ctx.NumberLiteral[1].image);

        let duration = "w";
        let durationPercent = 1;

        if(ctx.DurationUnit) {
            duration = ctx.DurationUnit[0].image;
            durationPercent = this.durationToPercentage(duration)
        }

        const pitch = this.getPitch(string, fret);

        return  {note: {string:string, fret:fret, pitch: pitch, duration: duration, durationPercent: durationPercent } };

    }

    transition(ctx: any) {

        return  {transition: {type: ctx.HammerPick[0].image} };
    }

    bar(ctx: any) {

        let result = {bar: { type: "single", repeat: 0 }};

        if(ctx.RepeatSymbol && ctx.NumberLiteral) {
            result = {bar: { type: "single", repeat: ctx.NumberLiteral[0].image }}
        }

        return result;
    }

    chord(ctx: any) {

        let notes : any[] = []

        ctx.note.forEach((note: any, idx: number) => {
            const string =  Number.parseInt(note.children.NumberLiteral[0].image);
            const fret =  Number.parseInt(note.children.NumberLiteral[1].image);
    
            const pitch = this.getPitch(string, fret);

            notes = [...notes, {note: {string:string, fret:fret, pitch: pitch} }];
        });


        let duration = "w";
        let durationPercent = 1;

        return {chord: { notes: notes, duration: duration, durationPercent: durationPercent }};

    }


    rest(ctx: any) {

        let duration = "";

        if(ctx.DurationUnit) {
            duration = ctx.DurationUnit[0].image;
        }

        return {rest: { duration: duration, durationPercent: this.durationToPercentage(duration) }};
    }

    bend(ctx: any) {

        let amount = "";

        if(ctx.DurationUnit) {
            amount = ctx.DurationUnit[0].image;
        }

        return {bend: { amount: amount, amountPercent: this.durationToPercentage(amount) }};
    }


    words(ctx: any) {
        //return this.visit(ctx.musicInstructions);
        return {words: {}};
    }


    durationToPercentage(durationUnit: string) {

        let percentValue = 0;

        if(durationUnit == "q") {
            percentValue = 0.25;
        }

        if(durationUnit == "h") {
            percentValue = 0.5;
        }

        if(durationUnit == "w") {
            percentValue = 1;
        }

        return percentValue;

    }


    getPitch(string: number, fret: number) {
        
        //Assume Standard Tuning
        const matrix = fretboardModel.createPitchMatrix(6, 21, "E2,A2,D3,G3,B3,E4")
        return fretboardModel.filterToString(matrix, string)[fret];
    }


}


const validate = (tab: any) => {

    let errors: string[] = [];

    if(tab.staves.length > 0) {
        errors = [...errors, "Must have at least 1 stave"] ;
    }

    return errors;

}


const parse : any = (tab: string) => {
 
    //Tokenize
    const lexingResult = tabLexer.tokenize(tab);

    //Parse
    tabCstParser.input = lexingResult.tokens;
    const cst = tabCstParser.tab();

    //Interpret
    const interpreter = new TabInterpreter();
    const result = interpreter.visit(cst);
  
    //const validationErrors = validate(result);

    return { parsingResult: result, parserErrors: tabCstParser.errors, validationErrors: [] };
}

export default parse;

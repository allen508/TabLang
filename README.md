# TabLang
Guitar Tab Language Parser - Developed by Gary Allen

# Overview

This package provides a language parser for the TabLang language (developed by Gary Allen). The language supports parsing a plain text string into a Tabular output result model.

# Syntax

The language syntax is designed to be intuitive and fast to create tabs. The tab language support:
- Title
- Staffs
- Time signatures
- Chords
- Notes (represented by location on fretboard i.e. 3f4 is 3rd string 4th fret)
- Note groups (i.e. [4f6 3f3 2f8])
- Bars
- Bar repetition
- Rests
- Durations (whole, quarter)


## Example: 

THe following string will result in an object model that can be interpreted by visual library

```

title: "Song one"

staff: 
chords: - -  C  - - - - - - E
notes: (4/4) 1f0 3f5 | (2/4) 4f5/w - - 3f4/q 4f2|*4 [4f6 3f3 2f8]

```

Using the TabLang-Svg library, the following output would be

![image](https://github.com/user-attachments/assets/e7852fdb-7bc6-4fc7-934a-906390745d4c)




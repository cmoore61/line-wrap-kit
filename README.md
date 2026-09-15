# line-wrap-kit

A small library (and CLI) for wrapping plain text to a fixed column width.
Piping man-page-style prose through `fold` or `fmt` mostly works until you
need the result as structured data - counting lines, checking the longest
line, feeding it into another tool. This does the wrapping in TypeScript so
you can either call it as a library or shell out to it and read JSON back.

## Library usage

```ts
import { wrapText } from "line-wrap-kit";

const lines = wrapText(
  "The quick brown fox jumps over the lazy dog, again and again.",
  { width: 20 }
);

console.log(lines.join("\n"));
// The quick brown fox
// jumps over the lazy
// dog, again and
// again.
```

`wrapText` treats existing newlines in the input as hard paragraph breaks
and wraps each one independently, so multi-paragraph text keeps its shape.
Words longer than the target width are split rather than left overflowing
(pass `hardBreakLongWords: false` to disable that and let them overflow
instead).

## CLI usage

```sh
echo "The quick brown fox jumps over the lazy dog" | linewrap --width 20
```

```
The quick brown fox
jumps over the lazy
dog
```

Pass `--json` to get the same result as structured output, useful when
another script needs to know the line count or the longest line without
re-parsing plain text:

```sh
echo "The quick brown fox jumps over the lazy dog" | linewrap --width 20 --json
```

```json
{
  "width": 20,
  "lineCount": 3,
  "longestLine": 19,
  "lines": [
    "The quick brown fox",
    "jumps over the lazy",
    "dog"
  ]
}
```

Run `linewrap --help` for the full option list.

## Building

```sh
npm install
npm run build
```

This compiles `src/` to `dist/` with `tsc`. There are no runtime
dependencies - only the TypeScript compiler itself is needed to build.

Run `npm test` to build and run the unit tests with Node's built-in test
runner (`node --test`) - no test framework dependency needed.

## Known limitations

Width is measured in Unicode code points, not display columns, so wide
characters (most CJK text) will wrap narrower than they visually appear.
Fixing that properly means implementing East Asian Width, which is planned
but not done yet.

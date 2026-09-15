import { test } from "node:test";
import assert from "node:assert/strict";
import { wrapParagraph, wrapText, longestLineLength } from "./wrap.js";

test("rejects non-positive width", () => {
  assert.throws(() => wrapParagraph("hello", { width: 0 }));
  assert.throws(() => wrapParagraph("hello", { width: -5 }));
});

test("rejects non-integer width", () => {
  assert.throws(() => wrapParagraph("hello", { width: 4.5 }));
});

test("empty input produces a single empty line", () => {
  assert.deepEqual(wrapParagraph("", { width: 10 }), [""]);
  assert.deepEqual(wrapParagraph("   ", { width: 10 }), [""]);
});

test("collapses runs of whitespace between words", () => {
  assert.deepEqual(wrapParagraph("a   b\tc", { width: 80 }), ["a b c"]);
});

test("word exactly matching the width fills its own line", () => {
  assert.deepEqual(wrapParagraph("abcde fg", { width: 5 }), ["abcde", "fg"]);
});

test("splits words longer than width by default", () => {
  assert.deepEqual(wrapParagraph("abcdefgh", { width: 3 }), ["abc", "def", "gh"]);
});

test("keeps overlong words intact when hardBreakLongWords is false", () => {
  assert.deepEqual(
    wrapParagraph("abcdefgh short", { width: 3, hardBreakLongWords: false }),
    ["abcdefgh", "short"],
  );
});

test("an overlong word after a partial line flushes the partial line first", () => {
  assert.deepEqual(wrapParagraph("hi abcdefgh", { width: 3 }), ["hi", "abc", "def", "gh"]);
});

test("counts astral code points as single columns, not UTF-16 units", () => {
  // U+1F600 is a surrogate pair in UTF-16 but one code point.
  const emoji = "\u{1F600}";
  const word = emoji.repeat(4);
  assert.deepEqual(wrapParagraph(word, { width: 2 }), [emoji + emoji, emoji + emoji]);
});

test("wrapText treats newlines as hard paragraph breaks", () => {
  const text = "one two three\nfour five six";
  assert.deepEqual(wrapText(text, { width: 9 }), ["one two", "three", "four five", "six"]);
});

test("wrapText preserves blank lines", () => {
  const text = "first paragraph\n\nsecond paragraph";
  assert.deepEqual(wrapText(text, { width: 80 }), [
    "first paragraph",
    "",
    "second paragraph",
  ]);
});

test("longestLineLength on an empty list is zero", () => {
  assert.equal(longestLineLength([]), 0);
});

test("longestLineLength counts code points, not string length", () => {
  const emoji = "\u{1F600}";
  assert.equal(longestLineLength(["ab", emoji + emoji + emoji]), 3);
});

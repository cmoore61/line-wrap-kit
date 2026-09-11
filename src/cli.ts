#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { wrapText, longestLineLength } from "./wrap.js";

const HELP = `linewrap - wrap text to a fixed column width

Usage:
  linewrap [options] [file]

  Reads from <file> if given, otherwise from stdin.

Options:
  -w, --width <n>   Line width in columns (default: 80)
      --json        Emit a JSON object instead of plain text
  -h, --help        Show this help text
`;

interface ParsedArgs {
  width: number;
  json: boolean;
  file: string | null;
  help: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
  let width = 80;
  let json = false;
  let file: string | null = null;
  let help = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      help = true;
    } else if (arg === "--json") {
      json = true;
    } else if (arg === "-w" || arg === "--width") {
      const value = argv[++i];
      if (value === undefined) {
        throw new Error(`${arg} requires a value`);
      }
      width = Number(value);
      if (!Number.isInteger(width) || width <= 0) {
        throw new Error(`--width must be a positive integer, got ${value}`);
      }
    } else if (!arg.startsWith("-")) {
      file = arg;
    } else {
      throw new Error(`unrecognized option: ${arg}`);
    }
  }

  return { width, json, file, help };
}

function readInput(file: string | null): string {
  if (file !== null) {
    return readFileSync(file, "utf8");
  }
  return readFileSync(0, "utf8");
}

function main(): void {
  let args: ParsedArgs;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(`${(err as Error).message}\n`);
    process.exit(1);
  }

  if (args.help) {
    process.stdout.write(HELP);
    return;
  }

  let input: string;
  try {
    input = readInput(args.file);
  } catch (err) {
    process.stderr.write(`could not read input: ${(err as Error).message}\n`);
    process.exit(1);
  }

  const lines = wrapText(input, { width: args.width });

  if (args.json) {
    const output = {
      width: args.width,
      lineCount: lines.length,
      longestLine: longestLineLength(lines),
      lines,
    };
    process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  } else {
    process.stdout.write(`${lines.join("\n")}\n`);
  }
}

main();

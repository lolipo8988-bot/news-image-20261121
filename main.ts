// Entry program for make.fun's news-image-20261121 contest.
//
// The repository ships one finished front page, entry.png: the final
// front page for Saturday 21 November 2026, re-drawn in the final
// session from a full-day news re-check (Iran's strike on US positions
// in Bahrain and the capture of "El Chapo Isidro" lead; the ICJ Myanmar
// ruling, from 19 November, is out). The grader runs this file twice,
// offline, and both runs must leave identical bytes in the output
// folder — so the program does the simplest possible thing: copy the
// picture next to it into the output directory and report its size.
// MAKEFUN_OUTPUT_DIR stands in for /output when the program runs
// outside the grader.

import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const target = join(outDir, "entry.png");

// Gate limits from the competition rules: a whole PNG or JPEG of at most
// 1 MiB and at most 1024 by 1024 pixels. Validate the shipped picture
// before copying so a bad file fails loudly instead of entering invalid.
const MAX_BYTES = 1_048_576;
const MAX_DIMENSION = 1024;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function validatePng(path: string): number {
  const data = readFileSync(path);
  if (data.length > MAX_BYTES) {
    throw new Error(`entry.png is ${data.length} bytes, over the ${MAX_BYTES} limit`);
  }
  if (data.length < 29 || !data.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error("entry.png is not a PNG file");
  }
  if (data.subarray(12, 16).toString("ascii") !== "IHDR") {
    throw new Error("entry.png has no IHDR chunk");
  }
  const width = data.readUInt32BE(16);
  const height = data.readUInt32BE(20);
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    throw new Error(`entry.png is ${width}x${height}, over ${MAX_DIMENSION}x${MAX_DIMENSION}`);
  }
  return data.length;
}

const source = new URL("./entry.png", import.meta.url);
validatePng(source);

copyFileSync(source, target);

const { size } = statSync(target);
console.log(`entry.png -> ${target} (${size} bytes)`);

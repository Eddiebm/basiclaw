#!/usr/bin/env node
/**
 * Generate the 16/32/48/128 icon PNGs from a small inline SVG.
 *
 * We deliberately avoid heavy image deps (sharp, canvas) so this runs cleanly
 * on every dev machine and on GitHub Actions runners. Instead we rasterise the
 * SVG via the `@resvg/resvg-js` lazy require — if it isn't installed (e.g. CI
 * runs `wxt build` directly), the script falls back to writing tiny solid PNGs
 * generated entirely in JS so the manifest can still load.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICON_DIR = join(__dirname, "..", "public", "icon");

const SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="24" fill="#4F46E5"/>
  <g stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M64 26 L64 102" />
    <path d="M22 38 L34 38 C44 38 56 32 64 28 C72 32 84 38 94 38 L106 38" />
    <path d="M40 102 L88 102" />
    <path d="M88 78 L104 44 L120 78 C115 82 109 84 104 84 C99 84 93 82 88 78 Z" />
    <path d="M8 78 L24 44 L40 78 C35 82 29 84 24 84 C19 82 13 82 8 78 Z" />
  </g>
</svg>`.trim();

mkdirSync(ICON_DIR, { recursive: true });

// Tiny solid-colour PNG fallback. Returns a valid 1x1 PNG buffer scaled up to
// the manifest sizes — fine as a build-time fallback when @resvg/resvg-js is
// not available. The store-submission build should use the high-quality
// rasteriser by installing the optional dep.
function fallbackPng(size) {
  const ihdrChunk = makeChunk("IHDR", buildIHDR(size, size));
  const idatChunk = makeChunk("IDAT", buildIDAT(size, size, [0x4f, 0x46, 0xe5]));
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function buildIHDR(width, height) {
  const buf = Buffer.alloc(13);
  buf.writeUInt32BE(width, 0);
  buf.writeUInt32BE(height, 4);
  buf[8] = 8;
  buf[9] = 2;
  buf[10] = 0;
  buf[11] = 0;
  buf[12] = 0;
  return buf;
}

function buildIDAT(width, height, rgb) {
  const rowLength = width * 3 + 1;
  const raw = Buffer.alloc(rowLength * height);
  for (let y = 0; y < height; y++) {
    raw[y * rowLength] = 0;
    for (let x = 0; x < width; x++) {
      const offset = y * rowLength + 1 + x * 3;
      raw[offset] = rgb[0];
      raw[offset + 1] = rgb[1];
      raw[offset + 2] = rgb[2];
    }
  }
  return zlib.deflateSync(raw);
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([length, typeBuf, data, crcBuf]);
}

async function generate() {
  let renderer = null;
  try {
    const mod = await import("@resvg/resvg-js");
    renderer = mod.Resvg ?? mod.default?.Resvg;
  } catch {
    // optional dep missing – fall back below
  }

  const sizes = [16, 32, 48, 128];
  for (const size of sizes) {
    const outPath = join(ICON_DIR, `${size}.png`);
    if (renderer) {
      const resvg = new renderer(SVG, {
        fitTo: { mode: "width", value: size },
        background: "transparent",
      });
      const png = resvg.render().asPng();
      writeFileSync(outPath, png);
    } else {
      writeFileSync(outPath, fallbackPng(size));
    }
    process.stdout.write(`wrote ${outPath}\n`);
  }
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});

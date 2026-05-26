#!/usr/bin/env node
/* eslint-disable */
// Converts config.json → base58-encoded JSON subscription file.
// Encodes the entire config.json as a single base58 string, then wraps in JSON.
// Usage: node scripts/generate-config-base58.js

const fs = require('fs');
const path = require('path');

// Base58 alphabet (Bitcoin-style, no 0/O/I/l)
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const BASE = BigInt(ALPHABET.length);

function base58Encode(str) {
  const bytes = Buffer.from(str, 'utf8');
  let num = 0n;
  for (const byte of bytes) {
    num = (num << 8n) | BigInt(byte);
  }

  if (num === 0n) return ALPHABET[0];

  let encoded = '';
  while (num > 0n) {
    const remainder = Number(num % BASE);
    encoded = ALPHABET[remainder] + encoded;
    num = num / BASE;
  }

  // Handle leading zeros
  for (const byte of bytes) {
    if (byte === 0) {
      encoded = ALPHABET[0] + encoded;
    } else {
      break;
    }
  }

  return encoded;
}

const projectRoot = path.resolve(__dirname, '..');
const configPath = path.join(projectRoot, 'config.json');
const outputPath = path.join(projectRoot, 'config_base58.json');

let rawConfig;
try {
  rawConfig = fs.readFileSync(configPath, 'utf8');
} catch (err) {
  console.error(`无法读取 ${configPath}:`, err);
  process.exit(1);
}

// Validate JSON
try {
  JSON.parse(rawConfig);
} catch (err) {
  console.error('config.json 不是有效的 JSON:', err);
  process.exit(1);
}

// Base58-encode the entire config.json content as one string
const encoded = base58Encode(rawConfig);

// Wrap in JSON and output
const output = { data: encoded };

try {
  fs.writeFileSync(outputPath, JSON.stringify(output), 'utf8');
  console.log('已生成 config_base58.json');
} catch (err) {
  console.error('写入 config_base58.json 失败:', err);
  process.exit(1);
}

#!/usr/bin/env node
/* eslint-disable */
// AUTO-GENERATED SCRIPT: Converts config.json to base58-encoded config_base58.json.
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

function encodeValues(obj) {
  if (typeof obj === 'string') {
    return base58Encode(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(encodeValues);
  }
  if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = encodeValues(value);
    }
    return result;
  }
  return obj;
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

let config;
try {
  config = JSON.parse(rawConfig);
} catch (err) {
  console.error('config.json 不是有效的 JSON:', err);
  process.exit(1);
}

const encoded = encodeValues(config);

try {
  fs.writeFileSync(outputPath, JSON.stringify(encoded, null, 2), 'utf8');
  console.log('已生成 config_base58.json');
} catch (err) {
  console.error('写入 config_base58.json 失败:', err);
  process.exit(1);
}

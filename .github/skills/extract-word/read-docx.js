#!/usr/bin/env node
// Zero-dependency .docx -> plain text extractor.
// .docx is a ZIP container around XML parts; this reads the ZIP central
// directory directly (no npm install required) to pull out word/document.xml,
// then strips it down to paragraph text, marking heading-styled paragraphs
// with a leading "## ".
'use strict';
const fs = require('fs');
const zlib = require('zlib');

function readZipEntry(buf, entryName) {
  const eocdSig = 0x06054b50;
  let eocdOffset = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === eocdSig) { eocdOffset = i; break; }
  }
  if (eocdOffset === -1) throw new Error('Not a valid zip/docx file (no EOCD record found)');

  const cdOffset = buf.readUInt32LE(eocdOffset + 16);
  const cdEntries = buf.readUInt16LE(eocdOffset + 10);

  let pos = cdOffset;
  for (let i = 0; i < cdEntries; i++) {
    const sig = buf.readUInt32LE(pos);
    if (sig !== 0x02014b50) throw new Error('Malformed central directory entry');
    const method = buf.readUInt16LE(pos + 10);
    const compSize = buf.readUInt32LE(pos + 20);
    const nameLen = buf.readUInt16LE(pos + 28);
    const extraLen = buf.readUInt16LE(pos + 30);
    const commentLen = buf.readUInt16LE(pos + 32);
    const localHeaderOffset = buf.readUInt32LE(pos + 42);
    const name = buf.toString('utf8', pos + 46, pos + 46 + nameLen);

    if (name === entryName) {
      const lhNameLen = buf.readUInt16LE(localHeaderOffset + 26);
      const lhExtraLen = buf.readUInt16LE(localHeaderOffset + 28);
      const dataStart = localHeaderOffset + 30 + lhNameLen + lhExtraLen;
      const raw = buf.subarray(dataStart, dataStart + compSize);
      return method === 0 ? raw : zlib.inflateRawSync(raw);
    }
    pos += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error(`Entry ${entryName} not found in archive`);
}

function decodeXmlEntities(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function documentXmlToText(xml) {
  const paragraphs = xml.match(/<w:p[ >][\s\S]*?<\/w:p>/g) || [];
  const lines = [];
  for (const p of paragraphs) {
    const isHeading = /<w:pStyle[^>]*w:val="Heading\d*"/.test(p) || /<w:pStyle[^>]*w:val="Title"/.test(p);
    const runs = p.match(/<w:t[ >][^>]*>([\s\S]*?)<\/w:t>|<w:t>([\s\S]*?)<\/w:t>/g) || [];
    const text = runs
      .map((r) => {
        const m = r.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/);
        return m ? decodeXmlEntities(m[1]) : '';
      })
      .join('');
    if (text.trim().length === 0) continue;
    lines.push(isHeading ? `## ${text}` : text);
  }
  return lines.join('\n');
}

function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node read-docx.js <path-to-file.docx>');
    process.exit(1);
  }
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  const buf = fs.readFileSync(filePath);
  const xml = readZipEntry(buf, 'word/document.xml').toString('utf8');
  process.stdout.write(documentXmlToText(xml) + '\n');
}

main();

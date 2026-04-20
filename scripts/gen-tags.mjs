#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'assets/tags');
mkdirSync(outDir, { recursive: true });

const FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const PAD_X = 14;
const H = 28;
const R = 4;

const CHAR_W = 7.2;
const BADGE_CHAR_W = 7.0;

function pill({ text, fg = '#fafafa', bg = '#09090b', stroke = '#3f3f46', accent }) {
  const w = Math.round(text.length * CHAR_W + PAD_X * 2);
  const accentBar = accent
    ? `<rect x="0" y="0" width="4" height="${H}" fill="${accent}"/>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${H}" viewBox="0 0 ${w} ${H}" role="img">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${H - 1}" rx="${R}" ry="${R}" fill="${bg}" stroke="${stroke}"/>
  ${accentBar}
  <text x="${accent ? PAD_X + 4 : w / 2}" y="18" text-anchor="${accent ? 'start' : 'middle'}" font-family="${FONT}" font-size="12" font-weight="600" fill="${fg}" letter-spacing="0.3">${text}</text>
</svg>`;
}

function splitPill({ label, value, labelBg = '#18181b', valueBg = '#09090b', labelFg = '#a1a1aa', valueFg = '#fafafa', stroke = '#3f3f46' }) {
  const lw = Math.round(label.length * BADGE_CHAR_W + PAD_X);
  const vw = Math.round(value.length * BADGE_CHAR_W + PAD_X);
  const w = lw + vw;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${H}" viewBox="0 0 ${w} ${H}" role="img">
  <clipPath id="c"><rect width="${w}" height="${H}" rx="${R}" ry="${R}"/></clipPath>
  <g clip-path="url(#c)">
    <rect width="${lw}" height="${H}" fill="${labelBg}"/>
    <rect x="${lw}" width="${vw}" height="${H}" fill="${valueBg}"/>
    <rect x="0.5" y="0.5" width="${w - 1}" height="${H - 1}" fill="none" stroke="${stroke}" rx="${R}" ry="${R}"/>
    <text x="${lw / 2}" y="18" text-anchor="middle" font-family="${FONT}" font-size="12" font-weight="500" fill="${labelFg}" letter-spacing="0.3">${label}</text>
    <text x="${lw + vw / 2}" y="18" text-anchor="middle" font-family="${FONT}" font-size="12" font-weight="700" fill="${valueFg}" letter-spacing="0.3">${value}</text>
  </g>
</svg>`;
}

const tags = [
  { name: 'slim-install.svg', svg: pill({ text: 'slim install', accent: '#3b82f6' }) },
  { name: 'new.svg',          svg: pill({ text: 'new',          accent: '#22c55e' }) },
  { name: 'v1.23.0.svg',      svg: pill({ text: 'v1.23.0',      accent: '#3b82f6' }) },
  { name: 'official.svg',     svg: pill({ text: 'official',     accent: '#f59e0b' }) },
  { name: 'community.svg',    svg: pill({ text: 'community',    accent: '#a78bfa' }) },
  { name: 'curated.svg',      svg: pill({ text: 'curated',      accent: '#06b6d4' }) },
  { name: 'open-source.svg',  svg: pill({ text: 'open source',  accent: '#f472b6' }) },
  { name: 'prs-welcome.svg',  svg: pill({ text: 'PRs welcome',  accent: '#22c55e' }) },
  { name: 'one-skill.svg',    svg: pill({ text: 'one skill',    accent: '#3b82f6' }) },
  { name: 'every-agent.svg',  svg: pill({ text: 'every agent',  accent: '#3b82f6' }) },

  { name: 'agents.svg',       svg: splitPill({ label: 'agents',   value: '45'     }) },
  { name: 'skills.svg',       svg: splitPill({ label: 'skills',   value: '400K+'  }) },
  { name: 'sources.svg',      svg: splitPill({ label: 'sources',  value: '31'     }) },
  { name: 'tests.svg',        svg: splitPill({ label: 'tests',    value: '757'    }) },
  { name: 'install.svg',      svg: splitPill({ label: 'install',  value: '9s',    valueBg: '#22c55e', valueFg: '#000' }) },
  { name: 'packages.svg',     svg: splitPill({ label: 'packages', value: '118',   valueBg: '#3b82f6', valueFg: '#fff' }) },
  { name: 'deprecations.svg', svg: splitPill({ label: 'deprecations', value: '0', valueBg: '#22c55e', valueFg: '#000' }) },
  { name: 'vulns.svg',        svg: splitPill({ label: 'vulns',    value: '0',     valueBg: '#22c55e', valueFg: '#000' }) },
  { name: 'license.svg',      svg: splitPill({ label: 'license',  value: 'Apache-2.0' }) },
  { name: 'node.svg',         svg: splitPill({ label: 'node',     value: '>=18' }) },
];

for (const { name, svg } of tags) {
  writeFileSync(resolve(outDir, name), svg);
  console.log(`wrote assets/tags/${name}`);
}

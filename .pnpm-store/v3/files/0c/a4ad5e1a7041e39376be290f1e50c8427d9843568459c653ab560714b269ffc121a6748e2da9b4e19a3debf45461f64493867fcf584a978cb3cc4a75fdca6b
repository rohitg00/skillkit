'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const MAX_LINE_LENGTH = 80;
const richLine = Array(MAX_LINE_LENGTH).fill(`━`);
for (let t = 0; t <= 24; ++t)
    richLine[richLine.length - t] = `\x1b[38;5;${232 + t}m━`;
const richFormat = {
    header: str => `\x1b[1m━━━ ${str}${str.length < MAX_LINE_LENGTH - 5 ? ` ${richLine.slice(str.length + 5).join(``)}` : `:`}\x1b[0m`,
    bold: str => `\x1b[1m${str}\x1b[22m`,
    error: str => `\x1b[31m\x1b[1m${str}\x1b[22m\x1b[39m`,
    code: str => `\x1b[36m${str}\x1b[39m`,
};
const textFormat = {
    header: str => str,
    bold: str => str,
    error: str => str,
    code: str => str,
};
function dedent(text) {
    const lines = text.split(`\n`);
    const nonEmptyLines = lines.filter(line => line.match(/\S/));
    const indent = nonEmptyLines.length > 0 ? nonEmptyLines.reduce((minLength, line) => Math.min(minLength, line.length - line.trimStart().length), Number.MAX_VALUE) : 0;
    return lines
        .map(line => line.slice(indent).trimRight())
        .join(`\n`);
}
/**
 * Formats markdown text to be displayed to the console. Not all markdown features are supported.
 *
 * @param text The markdown text to format.
 * @param opts.format The format to use.
 * @param opts.paragraphs Whether to cut the text into paragraphs of 80 characters at most.
 */
function formatMarkdownish(text, { format, paragraphs }) {
    // Enforce \n as newline character
    text = text.replace(/\r\n?/g, `\n`);
    // Remove the indentation, since it got messed up with the JS indentation
    text = dedent(text);
    // Remove surrounding newlines, since they got added for JS formatting
    text = text.replace(/^\n+|\n+$/g, ``);
    // List items always end with at least two newlines (in order to not be collapsed)
    text = text.replace(/^(\s*)-([^\n]*?)\n+/gm, `$1-$2\n\n`);
    // Single newlines are removed; larger than that are collapsed into one
    text = text.replace(/\n(\n)?\n*/g, ($0, $1) => $1 ? $1 : ` `);
    if (paragraphs) {
        text = text.split(/\n/).map(paragraph => {
            // Does the paragraph starts with a list?
            const bulletMatch = paragraph.match(/^\s*[*-][\t ]+(.*)/);
            if (!bulletMatch)
                // No, cut the paragraphs into segments of 80 characters
                return paragraph.match(/(.{1,80})(?: |$)/g).join(`\n`);
            const indent = paragraph.length - paragraph.trimStart().length;
            // Yes, cut the paragraphs into segments of (78 - indent) characters (to account for the prefix)
            return bulletMatch[1].match(new RegExp(`(.{1,${78 - indent}})(?: |$)`, `g`)).map((line, index) => {
                return ` `.repeat(indent) + (index === 0 ? `- ` : `  `) + line;
            }).join(`\n`);
        }).join(`\n\n`);
    }
    // Highlight the code segments
    text = text.replace(/(`+)((?:.|[\n])*?)\1/g, ($0, $1, $2) => {
        return format.code($1 + $2 + $1);
    });
    // Highlight the bold segments
    text = text.replace(/(\*\*)((?:.|[\n])*?)\1/g, ($0, $1, $2) => {
        return format.bold($1 + $2 + $1);
    });
    return text ? `${text}\n` : ``;
}

exports.formatMarkdownish = formatMarkdownish;
exports.richFormat = richFormat;
exports.textFormat = textFormat;

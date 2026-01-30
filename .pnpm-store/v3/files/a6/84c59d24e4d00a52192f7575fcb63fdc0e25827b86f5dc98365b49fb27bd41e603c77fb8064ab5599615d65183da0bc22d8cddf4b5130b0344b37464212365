export interface ColorFormat {
    header(str: string): string;
    bold(str: string): string;
    error(str: string): string;
    code(str: string): string;
}
export declare const richFormat: ColorFormat;
export declare const textFormat: ColorFormat;
/**
 * Formats markdown text to be displayed to the console. Not all markdown features are supported.
 *
 * @param text The markdown text to format.
 * @param opts.format The format to use.
 * @param opts.paragraphs Whether to cut the text into paragraphs of 80 characters at most.
 */
export declare function formatMarkdownish(text: string, { format, paragraphs }: {
    format: ColorFormat;
    paragraphs: boolean;
}): string;

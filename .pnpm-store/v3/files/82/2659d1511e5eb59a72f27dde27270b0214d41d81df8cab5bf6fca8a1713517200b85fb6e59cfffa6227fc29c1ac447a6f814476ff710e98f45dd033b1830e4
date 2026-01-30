import type { TextChunk } from "../text-buffer";
import { StyledText } from "./styled-text";
import { SyntaxStyle } from "../syntax-style";
import { TreeSitterClient } from "./tree-sitter/client";
import type { SimpleHighlight } from "./tree-sitter/types";
interface ConcealOptions {
    enabled: boolean;
}
export declare function treeSitterToTextChunks(content: string, highlights: SimpleHighlight[], syntaxStyle: SyntaxStyle, options?: ConcealOptions): TextChunk[];
export interface TreeSitterToStyledTextOptions {
    conceal?: ConcealOptions;
}
export declare function treeSitterToStyledText(content: string, filetype: string, syntaxStyle: SyntaxStyle, client: TreeSitterClient, options?: TreeSitterToStyledTextOptions): Promise<StyledText>;
export {};

import { StyledText } from "./styled-text";
import { SyntaxStyle } from "../syntax-style";
export interface HASTText {
    type: "text";
    value: string;
}
export interface HASTElement {
    type: "element";
    tagName: string;
    properties?: {
        className?: string;
    };
    children: HASTNode[];
}
export type HASTNode = HASTText | HASTElement;
export type { StyleDefinition } from "../syntax-style";
export declare function hastToStyledText(hast: HASTNode, syntaxStyle: SyntaxStyle): StyledText;

import { Attribute } from '../../../attribute';
export interface InternalActivationAttributes {
    readonly activation: string;
    readonly clipMin?: number;
    readonly clipMax?: number;
    readonly activationCacheKey: string;
}
export declare function getActivationSnippet(attributes: InternalActivationAttributes): {
    activationFunction: string;
    applyActivation: string;
};
export declare const parseInternalActivationAttributes: (attributes: Attribute) => InternalActivationAttributes;

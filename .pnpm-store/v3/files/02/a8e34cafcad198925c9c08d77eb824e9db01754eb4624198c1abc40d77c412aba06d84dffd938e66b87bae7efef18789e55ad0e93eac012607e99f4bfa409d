import { AttributeWithCacheKey } from '../../../attribute-with-cache-key';
import { OperatorImplementation, OperatorInitialization } from '../../../operators';
import { InternalActivationAttributes } from './fuse-utils';
export declare const calculateOutputShape: (inputShape: readonly number[], kernelShape: readonly number[], dilations: readonly number[], adjustPads: readonly number[], strides: readonly number[]) => number[];
export interface ConvAttributes extends InternalActivationAttributes, AttributeWithCacheKey {
    readonly autoPad: string;
    readonly dilations: readonly number[];
    readonly group: number;
    readonly kernelShape: readonly number[];
    readonly pads: readonly number[];
    readonly strides: readonly number[];
}
export declare const conv: OperatorImplementation<ConvAttributes>;
export declare const parseConvAttributes: OperatorInitialization<ConvAttributes>;

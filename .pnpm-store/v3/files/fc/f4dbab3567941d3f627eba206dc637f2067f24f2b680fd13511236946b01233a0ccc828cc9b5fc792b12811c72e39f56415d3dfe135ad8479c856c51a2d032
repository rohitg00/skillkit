import { AttributeWithCacheKey } from '../../../attribute-with-cache-key';
import { Graph } from '../../../graph';
import { OperatorImplementation, OperatorInitialization } from '../../../operators';
import { Tensor } from '../../../tensor';
export interface UpsampleAttributes extends AttributeWithCacheKey {
    readonly opset: number;
    readonly isResize: boolean;
    readonly mode: string;
    readonly scales: number[];
    readonly extrapolationValue: number;
    readonly coordinateTransformMode: string;
    readonly useExtrapolation: boolean;
    readonly needRoiInput: boolean;
    readonly nearestMode: string;
    readonly cubicCoefficientA: number;
    readonly excludeOutside: boolean;
    readonly useNearest2xOptimization: boolean;
    readonly roiInputIdx: number;
    readonly scalesInputIdx: number;
    readonly sizesInputIdx: number;
}
export declare const upsample: OperatorImplementation<UpsampleAttributes>;
export declare const parseUpsampleAttributesV7: OperatorInitialization<UpsampleAttributes>;
export declare const parseUpsampleAttributesV9: OperatorInitialization<UpsampleAttributes>;
export declare const parseUpsampleAttributes: (node: Graph.Node, opset: number) => UpsampleAttributes;
export declare const validateInputs: (inputs: Tensor[], attribute: UpsampleAttributes) => void;
export declare const scalesValidation: (scales: number[], mode: string, isResize: boolean) => void;

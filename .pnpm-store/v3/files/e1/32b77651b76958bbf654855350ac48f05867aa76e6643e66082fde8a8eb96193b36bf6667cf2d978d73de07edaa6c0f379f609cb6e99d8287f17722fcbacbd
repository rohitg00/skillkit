import { AttributeWithCacheKey } from '../../../attribute-with-cache-key';
import { OperatorImplementation, OperatorInitialization } from '../../../operators';
import { Tensor } from '../../../tensor';
import { WebGLInferenceHandler } from '../inference-handler';
export interface SliceAttributes extends AttributeWithCacheKey {
    readonly axes: number[];
    readonly ends: number[];
    readonly starts: number[];
}
export declare const slice: OperatorImplementation<SliceAttributes>;
export declare const parseSliceAttributes: OperatorInitialization<SliceAttributes>;
export declare const sliceV10: (inferenceHandler: WebGLInferenceHandler, inputs: Tensor[]) => Tensor[];

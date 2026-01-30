import { AttributeWithCacheKey } from '../../../attribute-with-cache-key';
import { Graph } from '../../../graph';
import { Tensor } from '../../../tensor';
import { GlslValueFunction } from '../glsl-definitions';
import { WebGLInferenceHandler } from '../inference-handler';
export declare function glslAbs(): GlslValueFunction;
export declare function glslAcos(): GlslValueFunction;
export declare function glslAsin(): GlslValueFunction;
export declare function glslAtan(): GlslValueFunction;
export declare function glslCeil(): GlslValueFunction;
export declare function glslCos(): GlslValueFunction;
export declare function glslElu(alpha: number): GlslValueFunction;
export declare function glslExp(): GlslValueFunction;
export declare function glslFloor(): GlslValueFunction;
export declare function glslClip(min: number, max: number): GlslValueFunction;
export declare function glslIdentity(): GlslValueFunction;
export declare function glslLeakyRelu(alpha: number): GlslValueFunction;
export declare function glslLog(): GlslValueFunction;
export declare function glslNeg(): GlslValueFunction;
export declare function glslNot(): GlslValueFunction;
export declare function glslSin(): GlslValueFunction;
export declare function glslRelu(): GlslValueFunction;
export declare function glslSigmoid(): GlslValueFunction;
export declare function glslSqrt(): GlslValueFunction;
export declare function glslTan(): GlslValueFunction;
export declare function glslTanh(): GlslValueFunction;
export declare const abs: (handler: WebGLInferenceHandler, inputs: Tensor[]) => Tensor[];
export declare const acos: (handler: WebGLInferenceHandler, inputs: Tensor[]) => Tensor[];
export declare const asin: (handler: WebGLInferenceHandler, inputs: Tensor[]) => Tensor[];
export declare const atan: (handler: WebGLInferenceHandler, inputs: Tensor[]) => Tensor[];
export interface ClipAttributes extends AttributeWithCacheKey {
    readonly min: number;
    readonly max: number;
}
export declare const clip: (handler: WebGLInferenceHandler, inputs: Tensor[], attributes: ClipAttributes) => Tensor[];
export declare const parseClipAttributes: (node: Graph.Node) => ClipAttributes;
export declare const clipV11: (handler: WebGLInferenceHandler, inputs: Tensor[]) => Tensor[];
export declare const ceil: (handler: WebGLInferenceHandler, inputs: Tensor[]) => Tensor[];
export declare const cos: (handler: WebGLInferenceHandler, inputs: Tensor[]) => Tensor[];
export interface EluAttributes extends AttributeWithCacheKey {
    readonly alpha: number;
}
export declare const elu: (handler: WebGLInferenceHandler, inputs: Tensor[], attributes: EluAttributes) => Tensor[];
export declare const parseEluAttributes: (node: Graph.Node) => EluAttributes;
export declare const exp: (handler: WebGLInferenceHandler, inputs: Tensor[]) => Tensor[];
export declare const floor: (handler: WebGLInferenceHandler, inputs: Tensor[]) => Tensor[];
export declare const identity: (handler: WebGLInferenceHandler, inputs: Tensor[]) => Tensor[];
export interface LeakyReluAttributes extends AttributeWithCacheKey {
    readonly alpha: number;
}
export declare const leakyRelu: (handler: WebGLInferenceHandler, inputs: Tensor[], attributes: LeakyReluAttributes) => Tensor[];
export declare const parseLeakyReluAttributes: (node: Graph.Node) => LeakyReluAttributes;
export declare const log: (handler: WebGLInferenceHandler, inputs: Tensor[]) => Tensor[];
export declare const neg: (handler: WebGLInferenceHandler, inputs: Tensor[]) => Tensor[];
export declare const not: (handler: WebGLInferenceHandler, inputs: Tensor[]) => Tensor[];
export declare const relu: (handler: WebGLInferenceHandler, inputs: Tensor[]) => Tensor[];
export declare const sigmoid: (handler: WebGLInferenceHandler, inputs: Tensor[]) => Tensor[];
export declare const sin: (handler: WebGLInferenceHandler, inputs: Tensor[]) => Tensor[];
export declare const sqrt: (handler: WebGLInferenceHandler, inputs: Tensor[]) => Tensor[];
export declare const tan: (handler: WebGLInferenceHandler, inputs: Tensor[]) => Tensor[];
export declare const tanh: (handler: WebGLInferenceHandler, inputs: Tensor[]) => Tensor[];

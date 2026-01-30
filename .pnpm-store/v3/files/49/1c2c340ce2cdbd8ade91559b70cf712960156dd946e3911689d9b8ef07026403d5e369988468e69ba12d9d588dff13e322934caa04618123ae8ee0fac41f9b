import { AttributeWithCacheKey } from '../../../attribute-with-cache-key';
import { OperatorImplementation, OperatorInitialization } from '../../../operators';
export interface GemmAttributes extends AttributeWithCacheKey {
    transA: boolean;
    transB: boolean;
    alpha: number;
    beta: number;
    isOptionalC: boolean;
}
export declare const gemm: OperatorImplementation<GemmAttributes>;
export declare const parseGemmAttributesV7: OperatorInitialization<GemmAttributes>;
export declare const parseGemmAttributesV11: OperatorInitialization<GemmAttributes>;

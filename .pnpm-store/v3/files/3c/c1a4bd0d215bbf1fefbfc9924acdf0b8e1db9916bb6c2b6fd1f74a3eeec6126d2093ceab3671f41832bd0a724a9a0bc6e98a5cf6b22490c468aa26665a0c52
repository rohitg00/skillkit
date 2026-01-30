import { OperatorImplementation, OperatorInitialization } from '../../../operators';
import { Tensor } from '../../../tensor';
import { ProgramInfoLoader } from '../types';
import { InternalActivationAttributes } from './fuse-utils';
export declare const matMul: OperatorImplementation<InternalActivationAttributes>;
export declare const parseMatMulAttributes: OperatorInitialization<InternalActivationAttributes>;
export declare function createMatmulProgramInfoLoader(inputs: Tensor[], activationAttributes: InternalActivationAttributes): ProgramInfoLoader;
export declare function getBiasForMatmul(coordsDataType: string, allGlChannels: readonly string[], inShape: readonly number[], outShape: readonly number[], isPacked: boolean): string;

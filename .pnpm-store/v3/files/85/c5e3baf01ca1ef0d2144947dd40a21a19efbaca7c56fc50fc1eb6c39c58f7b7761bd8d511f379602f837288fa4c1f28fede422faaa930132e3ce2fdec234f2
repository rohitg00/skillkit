import { Tensor as TensorInterface, TensorFromImageOptions, TensorToImageDataOptions } from './tensor';
type TensorType = TensorInterface.Type;
type TensorDataType = TensorInterface.DataType;
export declare class Tensor implements TensorInterface {
    constructor(type: TensorType, data: TensorDataType | readonly number[] | readonly boolean[], dims?: readonly number[]);
    constructor(data: TensorDataType | readonly boolean[], dims?: readonly number[]);
    /**
     * Create a new tensor object from image object
     *
     * @param buffer - Extracted image buffer data - assuming RGBA format
     * @param imageFormat - input image configuration - required configurations height, width, format
     * @param tensorFormat - output tensor configuration - Default is RGB format
     */
    private static bufferToTensor;
    static fromImage(imageData: ImageData, options?: TensorFromImageOptions): Promise<Tensor>;
    static fromImage(imageElement: HTMLImageElement, options?: TensorFromImageOptions): Promise<Tensor>;
    static fromImage(bitmap: ImageBitmap, options: TensorFromImageOptions): Promise<Tensor>;
    static fromImage(url: string, options?: TensorFromImageOptions): Promise<Tensor>;
    toImageData(options?: TensorToImageDataOptions): ImageData;
    readonly dims: readonly number[];
    readonly type: TensorType;
    readonly data: TensorDataType;
    readonly size: number;
    reshape(dims: readonly number[]): Tensor;
}
export {};

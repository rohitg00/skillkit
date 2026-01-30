import { flatbuffers } from 'flatbuffers';
/**
 * @enum {number}
 */
export declare namespace onnxruntime.experimental.fbs {
    enum AttributeType {
        UNDEFINED = 0,
        FLOAT = 1,
        INT = 2,
        STRING = 3,
        TENSOR = 4,
        GRAPH = 5,
        FLOATS = 6,
        INTS = 7,
        STRINGS = 8,
        TENSORS = 9,
        GRAPHS = 10,
        SPARSE_TENSOR = 11,
        SPARSE_TENSORS = 12
    }
}
/**
 * @enum {number}
 */
export declare namespace onnxruntime.experimental.fbs {
    enum DimensionValueType {
        UNKNOWN = 0,
        VALUE = 1,
        PARAM = 2
    }
}
/**
 * @enum {number}
 */
export declare namespace onnxruntime.experimental.fbs {
    enum TensorDataType {
        UNDEFINED = 0,
        FLOAT = 1,
        UINT8 = 2,
        INT8 = 3,
        UINT16 = 4,
        INT16 = 5,
        INT32 = 6,
        INT64 = 7,
        STRING = 8,
        BOOL = 9,
        FLOAT16 = 10,
        DOUBLE = 11,
        UINT32 = 12,
        UINT64 = 13,
        COMPLEX64 = 14,
        COMPLEX128 = 15,
        BFLOAT16 = 16
    }
}
/**
 * @enum {number}
 */
export declare namespace onnxruntime.experimental.fbs {
    enum NodeType {
        Primitive = 0,
        Fused = 1
    }
}
/**
 * @enum {number}
 */
export declare namespace onnxruntime.experimental.fbs {
    enum TypeInfoValue {
        NONE = 0,
        tensor_type = 1,
        sequence_type = 2,
        map_type = 3
    }
}
/**
 * @constructor
 */
export declare namespace onnxruntime.experimental.fbs {
    class Shape {
        bb: flatbuffers.ByteBuffer | null;
        bb_pos: number;
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns Shape
         */
        __init(i: number, bb: flatbuffers.ByteBuffer): Shape;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param Shape= obj
         * @returns Shape
         */
        static getRootAsShape(bb: flatbuffers.ByteBuffer, obj?: Shape): Shape;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param Shape= obj
         * @returns Shape
         */
        static getSizePrefixedRootAsShape(bb: flatbuffers.ByteBuffer, obj?: Shape): Shape;
        /**
         * @param number index
         * @param onnxruntime.experimental.fbs.Dimension= obj
         * @returns onnxruntime.experimental.fbs.Dimension
         */
        dim(index: number, obj?: onnxruntime.experimental.fbs.Dimension): onnxruntime.experimental.fbs.Dimension | null;
        /**
         * @returns number
         */
        dimLength(): number;
        /**
         * @param flatbuffers.Builder builder
         */
        static startShape(builder: flatbuffers.Builder): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset dimOffset
         */
        static addDim(builder: flatbuffers.Builder, dimOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Offset> data
         * @returns flatbuffers.Offset
         */
        static createDimVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startDimVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endShape(builder: flatbuffers.Builder): flatbuffers.Offset;
        static createShape(builder: flatbuffers.Builder, dimOffset: flatbuffers.Offset): flatbuffers.Offset;
    }
}
/**
 * @constructor
 */
export declare namespace onnxruntime.experimental.fbs {
    class Dimension {
        bb: flatbuffers.ByteBuffer | null;
        bb_pos: number;
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns Dimension
         */
        __init(i: number, bb: flatbuffers.ByteBuffer): Dimension;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param Dimension= obj
         * @returns Dimension
         */
        static getRootAsDimension(bb: flatbuffers.ByteBuffer, obj?: Dimension): Dimension;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param Dimension= obj
         * @returns Dimension
         */
        static getSizePrefixedRootAsDimension(bb: flatbuffers.ByteBuffer, obj?: Dimension): Dimension;
        /**
         * @param onnxruntime.experimental.fbs.DimensionValue= obj
         * @returns onnxruntime.experimental.fbs.DimensionValue|null
         */
        value(obj?: onnxruntime.experimental.fbs.DimensionValue): onnxruntime.experimental.fbs.DimensionValue | null;
        /**
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array|null
         */
        denotation(): string | null;
        denotation(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
        /**
         * @param flatbuffers.Builder builder
         */
        static startDimension(builder: flatbuffers.Builder): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset valueOffset
         */
        static addValue(builder: flatbuffers.Builder, valueOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset denotationOffset
         */
        static addDenotation(builder: flatbuffers.Builder, denotationOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endDimension(builder: flatbuffers.Builder): flatbuffers.Offset;
        static createDimension(builder: flatbuffers.Builder, valueOffset: flatbuffers.Offset, denotationOffset: flatbuffers.Offset): flatbuffers.Offset;
    }
}
/**
 * @constructor
 */
export declare namespace onnxruntime.experimental.fbs {
    class DimensionValue {
        bb: flatbuffers.ByteBuffer | null;
        bb_pos: number;
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns DimensionValue
         */
        __init(i: number, bb: flatbuffers.ByteBuffer): DimensionValue;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param DimensionValue= obj
         * @returns DimensionValue
         */
        static getRootAsDimensionValue(bb: flatbuffers.ByteBuffer, obj?: DimensionValue): DimensionValue;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param DimensionValue= obj
         * @returns DimensionValue
         */
        static getSizePrefixedRootAsDimensionValue(bb: flatbuffers.ByteBuffer, obj?: DimensionValue): DimensionValue;
        /**
         * @returns onnxruntime.experimental.fbs.DimensionValueType
         */
        dimType(): onnxruntime.experimental.fbs.DimensionValueType;
        /**
         * @returns flatbuffers.Long
         */
        dimValue(): flatbuffers.Long;
        /**
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array|null
         */
        dimParam(): string | null;
        dimParam(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
        /**
         * @param flatbuffers.Builder builder
         */
        static startDimensionValue(builder: flatbuffers.Builder): void;
        /**
         * @param flatbuffers.Builder builder
         * @param onnxruntime.experimental.fbs.DimensionValueType dimType
         */
        static addDimType(builder: flatbuffers.Builder, dimType: onnxruntime.experimental.fbs.DimensionValueType): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Long dimValue
         */
        static addDimValue(builder: flatbuffers.Builder, dimValue: flatbuffers.Long): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset dimParamOffset
         */
        static addDimParam(builder: flatbuffers.Builder, dimParamOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endDimensionValue(builder: flatbuffers.Builder): flatbuffers.Offset;
        static createDimensionValue(builder: flatbuffers.Builder, dimType: onnxruntime.experimental.fbs.DimensionValueType, dimValue: flatbuffers.Long, dimParamOffset: flatbuffers.Offset): flatbuffers.Offset;
    }
}
/**
 * @constructor
 */
export declare namespace onnxruntime.experimental.fbs {
    class TensorTypeAndShape {
        bb: flatbuffers.ByteBuffer | null;
        bb_pos: number;
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns TensorTypeAndShape
         */
        __init(i: number, bb: flatbuffers.ByteBuffer): TensorTypeAndShape;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param TensorTypeAndShape= obj
         * @returns TensorTypeAndShape
         */
        static getRootAsTensorTypeAndShape(bb: flatbuffers.ByteBuffer, obj?: TensorTypeAndShape): TensorTypeAndShape;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param TensorTypeAndShape= obj
         * @returns TensorTypeAndShape
         */
        static getSizePrefixedRootAsTensorTypeAndShape(bb: flatbuffers.ByteBuffer, obj?: TensorTypeAndShape): TensorTypeAndShape;
        /**
         * @returns onnxruntime.experimental.fbs.TensorDataType
         */
        elemType(): onnxruntime.experimental.fbs.TensorDataType;
        /**
         * @param onnxruntime.experimental.fbs.Shape= obj
         * @returns onnxruntime.experimental.fbs.Shape|null
         */
        shape(obj?: onnxruntime.experimental.fbs.Shape): onnxruntime.experimental.fbs.Shape | null;
        /**
         * @param flatbuffers.Builder builder
         */
        static startTensorTypeAndShape(builder: flatbuffers.Builder): void;
        /**
         * @param flatbuffers.Builder builder
         * @param onnxruntime.experimental.fbs.TensorDataType elemType
         */
        static addElemType(builder: flatbuffers.Builder, elemType: onnxruntime.experimental.fbs.TensorDataType): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset shapeOffset
         */
        static addShape(builder: flatbuffers.Builder, shapeOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endTensorTypeAndShape(builder: flatbuffers.Builder): flatbuffers.Offset;
        static createTensorTypeAndShape(builder: flatbuffers.Builder, elemType: onnxruntime.experimental.fbs.TensorDataType, shapeOffset: flatbuffers.Offset): flatbuffers.Offset;
    }
}
/**
 * @constructor
 */
export declare namespace onnxruntime.experimental.fbs {
    class MapType {
        bb: flatbuffers.ByteBuffer | null;
        bb_pos: number;
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns MapType
         */
        __init(i: number, bb: flatbuffers.ByteBuffer): MapType;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param MapType= obj
         * @returns MapType
         */
        static getRootAsMapType(bb: flatbuffers.ByteBuffer, obj?: MapType): MapType;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param MapType= obj
         * @returns MapType
         */
        static getSizePrefixedRootAsMapType(bb: flatbuffers.ByteBuffer, obj?: MapType): MapType;
        /**
         * @returns onnxruntime.experimental.fbs.TensorDataType
         */
        keyType(): onnxruntime.experimental.fbs.TensorDataType;
        /**
         * @param onnxruntime.experimental.fbs.TypeInfo= obj
         * @returns onnxruntime.experimental.fbs.TypeInfo|null
         */
        valueType(obj?: onnxruntime.experimental.fbs.TypeInfo): onnxruntime.experimental.fbs.TypeInfo | null;
        /**
         * @param flatbuffers.Builder builder
         */
        static startMapType(builder: flatbuffers.Builder): void;
        /**
         * @param flatbuffers.Builder builder
         * @param onnxruntime.experimental.fbs.TensorDataType keyType
         */
        static addKeyType(builder: flatbuffers.Builder, keyType: onnxruntime.experimental.fbs.TensorDataType): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset valueTypeOffset
         */
        static addValueType(builder: flatbuffers.Builder, valueTypeOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endMapType(builder: flatbuffers.Builder): flatbuffers.Offset;
        static createMapType(builder: flatbuffers.Builder, keyType: onnxruntime.experimental.fbs.TensorDataType, valueTypeOffset: flatbuffers.Offset): flatbuffers.Offset;
    }
}
/**
 * @constructor
 */
export declare namespace onnxruntime.experimental.fbs {
    class SequenceType {
        bb: flatbuffers.ByteBuffer | null;
        bb_pos: number;
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns SequenceType
         */
        __init(i: number, bb: flatbuffers.ByteBuffer): SequenceType;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param SequenceType= obj
         * @returns SequenceType
         */
        static getRootAsSequenceType(bb: flatbuffers.ByteBuffer, obj?: SequenceType): SequenceType;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param SequenceType= obj
         * @returns SequenceType
         */
        static getSizePrefixedRootAsSequenceType(bb: flatbuffers.ByteBuffer, obj?: SequenceType): SequenceType;
        /**
         * @param onnxruntime.experimental.fbs.TypeInfo= obj
         * @returns onnxruntime.experimental.fbs.TypeInfo|null
         */
        elemType(obj?: onnxruntime.experimental.fbs.TypeInfo): onnxruntime.experimental.fbs.TypeInfo | null;
        /**
         * @param flatbuffers.Builder builder
         */
        static startSequenceType(builder: flatbuffers.Builder): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset elemTypeOffset
         */
        static addElemType(builder: flatbuffers.Builder, elemTypeOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endSequenceType(builder: flatbuffers.Builder): flatbuffers.Offset;
        static createSequenceType(builder: flatbuffers.Builder, elemTypeOffset: flatbuffers.Offset): flatbuffers.Offset;
    }
}
/**
 * @constructor
 */
export declare namespace onnxruntime.experimental.fbs {
    class EdgeEnd {
        bb: flatbuffers.ByteBuffer | null;
        bb_pos: number;
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns EdgeEnd
         */
        __init(i: number, bb: flatbuffers.ByteBuffer): EdgeEnd;
        /**
         * @returns number
         */
        nodeIndex(): number;
        /**
         * @returns number
         */
        srcArgIndex(): number;
        /**
         * @returns number
         */
        dstArgIndex(): number;
        /**
         * @param flatbuffers.Builder builder
         * @param number node_index
         * @param number src_arg_index
         * @param number dst_arg_index
         * @returns flatbuffers.Offset
         */
        static createEdgeEnd(builder: flatbuffers.Builder, node_index: number, src_arg_index: number, dst_arg_index: number): flatbuffers.Offset;
    }
}
/**
 * @constructor
 */
export declare namespace onnxruntime.experimental.fbs {
    class NodeEdge {
        bb: flatbuffers.ByteBuffer | null;
        bb_pos: number;
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns NodeEdge
         */
        __init(i: number, bb: flatbuffers.ByteBuffer): NodeEdge;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param NodeEdge= obj
         * @returns NodeEdge
         */
        static getRootAsNodeEdge(bb: flatbuffers.ByteBuffer, obj?: NodeEdge): NodeEdge;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param NodeEdge= obj
         * @returns NodeEdge
         */
        static getSizePrefixedRootAsNodeEdge(bb: flatbuffers.ByteBuffer, obj?: NodeEdge): NodeEdge;
        /**
         * @returns number
         */
        nodeIndex(): number;
        /**
         * @param number index
         * @param onnxruntime.experimental.fbs.EdgeEnd= obj
         * @returns onnxruntime.experimental.fbs.EdgeEnd
         */
        inputEdges(index: number, obj?: onnxruntime.experimental.fbs.EdgeEnd): onnxruntime.experimental.fbs.EdgeEnd | null;
        /**
         * @returns number
         */
        inputEdgesLength(): number;
        /**
         * @param number index
         * @param onnxruntime.experimental.fbs.EdgeEnd= obj
         * @returns onnxruntime.experimental.fbs.EdgeEnd
         */
        outputEdges(index: number, obj?: onnxruntime.experimental.fbs.EdgeEnd): onnxruntime.experimental.fbs.EdgeEnd | null;
        /**
         * @returns number
         */
        outputEdgesLength(): number;
        /**
         * @param flatbuffers.Builder builder
         */
        static startNodeEdge(builder: flatbuffers.Builder): void;
        /**
         * @param flatbuffers.Builder builder
         * @param number nodeIndex
         */
        static addNodeIndex(builder: flatbuffers.Builder, nodeIndex: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset inputEdgesOffset
         */
        static addInputEdges(builder: flatbuffers.Builder, inputEdgesOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startInputEdgesVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset outputEdgesOffset
         */
        static addOutputEdges(builder: flatbuffers.Builder, outputEdgesOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startOutputEdgesVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endNodeEdge(builder: flatbuffers.Builder): flatbuffers.Offset;
        static createNodeEdge(builder: flatbuffers.Builder, nodeIndex: number, inputEdgesOffset: flatbuffers.Offset, outputEdgesOffset: flatbuffers.Offset): flatbuffers.Offset;
    }
}
/**
 * @constructor
 */
export declare namespace onnxruntime.experimental.fbs {
    class Node {
        bb: flatbuffers.ByteBuffer | null;
        bb_pos: number;
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns Node
         */
        __init(i: number, bb: flatbuffers.ByteBuffer): Node;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param Node= obj
         * @returns Node
         */
        static getRootAsNode(bb: flatbuffers.ByteBuffer, obj?: Node): Node;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param Node= obj
         * @returns Node
         */
        static getSizePrefixedRootAsNode(bb: flatbuffers.ByteBuffer, obj?: Node): Node;
        /**
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array|null
         */
        name(): string | null;
        name(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
        /**
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array|null
         */
        docString(): string | null;
        docString(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
        /**
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array|null
         */
        domain(): string | null;
        domain(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
        /**
         * @returns number
         */
        sinceVersion(): number;
        /**
         * @returns number
         */
        index(): number;
        /**
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array|null
         */
        opType(): string | null;
        opType(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
        /**
         * @returns onnxruntime.experimental.fbs.NodeType
         */
        type(): onnxruntime.experimental.fbs.NodeType;
        /**
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array|null
         */
        executionProviderType(): string | null;
        executionProviderType(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
        /**
         * @param number index
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array
         */
        inputs(index: number): string;
        inputs(index: number, optionalEncoding: flatbuffers.Encoding): string | Uint8Array;
        /**
         * @returns number
         */
        inputsLength(): number;
        /**
         * @param number index
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array
         */
        outputs(index: number): string;
        outputs(index: number, optionalEncoding: flatbuffers.Encoding): string | Uint8Array;
        /**
         * @returns number
         */
        outputsLength(): number;
        /**
         * @param number index
         * @param onnxruntime.experimental.fbs.Attribute= obj
         * @returns onnxruntime.experimental.fbs.Attribute
         */
        attributes(index: number, obj?: onnxruntime.experimental.fbs.Attribute): onnxruntime.experimental.fbs.Attribute | null;
        /**
         * @returns number
         */
        attributesLength(): number;
        /**
         * @param number index
         * @returns number
         */
        inputArgCounts(index: number): number | null;
        /**
         * @returns number
         */
        inputArgCountsLength(): number;
        /**
         * @returns Int32Array
         */
        inputArgCountsArray(): Int32Array | null;
        /**
         * @param number index
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array
         */
        implicitInputs(index: number): string;
        implicitInputs(index: number, optionalEncoding: flatbuffers.Encoding): string | Uint8Array;
        /**
         * @returns number
         */
        implicitInputsLength(): number;
        /**
         * @param flatbuffers.Builder builder
         */
        static startNode(builder: flatbuffers.Builder): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset nameOffset
         */
        static addName(builder: flatbuffers.Builder, nameOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset docStringOffset
         */
        static addDocString(builder: flatbuffers.Builder, docStringOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset domainOffset
         */
        static addDomain(builder: flatbuffers.Builder, domainOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param number sinceVersion
         */
        static addSinceVersion(builder: flatbuffers.Builder, sinceVersion: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param number index
         */
        static addIndex(builder: flatbuffers.Builder, index: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset opTypeOffset
         */
        static addOpType(builder: flatbuffers.Builder, opTypeOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param onnxruntime.experimental.fbs.NodeType type
         */
        static addType(builder: flatbuffers.Builder, type: onnxruntime.experimental.fbs.NodeType): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset executionProviderTypeOffset
         */
        static addExecutionProviderType(builder: flatbuffers.Builder, executionProviderTypeOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset inputsOffset
         */
        static addInputs(builder: flatbuffers.Builder, inputsOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Offset> data
         * @returns flatbuffers.Offset
         */
        static createInputsVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startInputsVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset outputsOffset
         */
        static addOutputs(builder: flatbuffers.Builder, outputsOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Offset> data
         * @returns flatbuffers.Offset
         */
        static createOutputsVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startOutputsVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset attributesOffset
         */
        static addAttributes(builder: flatbuffers.Builder, attributesOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Offset> data
         * @returns flatbuffers.Offset
         */
        static createAttributesVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startAttributesVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset inputArgCountsOffset
         */
        static addInputArgCounts(builder: flatbuffers.Builder, inputArgCountsOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<number> data
         * @returns flatbuffers.Offset
         */
        static createInputArgCountsVector(builder: flatbuffers.Builder, data: number[] | Uint8Array): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startInputArgCountsVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset implicitInputsOffset
         */
        static addImplicitInputs(builder: flatbuffers.Builder, implicitInputsOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Offset> data
         * @returns flatbuffers.Offset
         */
        static createImplicitInputsVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startImplicitInputsVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endNode(builder: flatbuffers.Builder): flatbuffers.Offset;
        static createNode(builder: flatbuffers.Builder, nameOffset: flatbuffers.Offset, docStringOffset: flatbuffers.Offset, domainOffset: flatbuffers.Offset, sinceVersion: number, index: number, opTypeOffset: flatbuffers.Offset, type: onnxruntime.experimental.fbs.NodeType, executionProviderTypeOffset: flatbuffers.Offset, inputsOffset: flatbuffers.Offset, outputsOffset: flatbuffers.Offset, attributesOffset: flatbuffers.Offset, inputArgCountsOffset: flatbuffers.Offset, implicitInputsOffset: flatbuffers.Offset): flatbuffers.Offset;
    }
}
/**
 * @constructor
 */
export declare namespace onnxruntime.experimental.fbs {
    class ValueInfo {
        bb: flatbuffers.ByteBuffer | null;
        bb_pos: number;
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns ValueInfo
         */
        __init(i: number, bb: flatbuffers.ByteBuffer): ValueInfo;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param ValueInfo= obj
         * @returns ValueInfo
         */
        static getRootAsValueInfo(bb: flatbuffers.ByteBuffer, obj?: ValueInfo): ValueInfo;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param ValueInfo= obj
         * @returns ValueInfo
         */
        static getSizePrefixedRootAsValueInfo(bb: flatbuffers.ByteBuffer, obj?: ValueInfo): ValueInfo;
        /**
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array|null
         */
        name(): string | null;
        name(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
        /**
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array|null
         */
        docString(): string | null;
        docString(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
        /**
         * @param onnxruntime.experimental.fbs.TypeInfo= obj
         * @returns onnxruntime.experimental.fbs.TypeInfo|null
         */
        type(obj?: onnxruntime.experimental.fbs.TypeInfo): onnxruntime.experimental.fbs.TypeInfo | null;
        /**
         * @param flatbuffers.Builder builder
         */
        static startValueInfo(builder: flatbuffers.Builder): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset nameOffset
         */
        static addName(builder: flatbuffers.Builder, nameOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset docStringOffset
         */
        static addDocString(builder: flatbuffers.Builder, docStringOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset typeOffset
         */
        static addType(builder: flatbuffers.Builder, typeOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endValueInfo(builder: flatbuffers.Builder): flatbuffers.Offset;
        static createValueInfo(builder: flatbuffers.Builder, nameOffset: flatbuffers.Offset, docStringOffset: flatbuffers.Offset, typeOffset: flatbuffers.Offset): flatbuffers.Offset;
    }
}
/**
 * @constructor
 */
export declare namespace onnxruntime.experimental.fbs {
    class TypeInfo {
        bb: flatbuffers.ByteBuffer | null;
        bb_pos: number;
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns TypeInfo
         */
        __init(i: number, bb: flatbuffers.ByteBuffer): TypeInfo;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param TypeInfo= obj
         * @returns TypeInfo
         */
        static getRootAsTypeInfo(bb: flatbuffers.ByteBuffer, obj?: TypeInfo): TypeInfo;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param TypeInfo= obj
         * @returns TypeInfo
         */
        static getSizePrefixedRootAsTypeInfo(bb: flatbuffers.ByteBuffer, obj?: TypeInfo): TypeInfo;
        /**
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array|null
         */
        denotation(): string | null;
        denotation(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
        /**
         * @returns onnxruntime.experimental.fbs.TypeInfoValue
         */
        valueType(): onnxruntime.experimental.fbs.TypeInfoValue;
        /**
         * @param flatbuffers.Table obj
         * @returns ?flatbuffers.Table
         */
        value<T extends flatbuffers.Table>(obj: T): T | null;
        /**
         * @param flatbuffers.Builder builder
         */
        static startTypeInfo(builder: flatbuffers.Builder): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset denotationOffset
         */
        static addDenotation(builder: flatbuffers.Builder, denotationOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param onnxruntime.experimental.fbs.TypeInfoValue valueType
         */
        static addValueType(builder: flatbuffers.Builder, valueType: onnxruntime.experimental.fbs.TypeInfoValue): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset valueOffset
         */
        static addValue(builder: flatbuffers.Builder, valueOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endTypeInfo(builder: flatbuffers.Builder): flatbuffers.Offset;
        static createTypeInfo(builder: flatbuffers.Builder, denotationOffset: flatbuffers.Offset, valueType: onnxruntime.experimental.fbs.TypeInfoValue, valueOffset: flatbuffers.Offset): flatbuffers.Offset;
    }
}
/**
 * @constructor
 */
export declare namespace onnxruntime.experimental.fbs {
    class OperatorSetId {
        bb: flatbuffers.ByteBuffer | null;
        bb_pos: number;
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns OperatorSetId
         */
        __init(i: number, bb: flatbuffers.ByteBuffer): OperatorSetId;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param OperatorSetId= obj
         * @returns OperatorSetId
         */
        static getRootAsOperatorSetId(bb: flatbuffers.ByteBuffer, obj?: OperatorSetId): OperatorSetId;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param OperatorSetId= obj
         * @returns OperatorSetId
         */
        static getSizePrefixedRootAsOperatorSetId(bb: flatbuffers.ByteBuffer, obj?: OperatorSetId): OperatorSetId;
        /**
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array|null
         */
        domain(): string | null;
        domain(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
        /**
         * @returns flatbuffers.Long
         */
        version(): flatbuffers.Long;
        /**
         * @param flatbuffers.Builder builder
         */
        static startOperatorSetId(builder: flatbuffers.Builder): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset domainOffset
         */
        static addDomain(builder: flatbuffers.Builder, domainOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Long version
         */
        static addVersion(builder: flatbuffers.Builder, version: flatbuffers.Long): void;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endOperatorSetId(builder: flatbuffers.Builder): flatbuffers.Offset;
        static createOperatorSetId(builder: flatbuffers.Builder, domainOffset: flatbuffers.Offset, version: flatbuffers.Long): flatbuffers.Offset;
    }
}
/**
 * @constructor
 */
export declare namespace onnxruntime.experimental.fbs {
    class Tensor {
        bb: flatbuffers.ByteBuffer | null;
        bb_pos: number;
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns Tensor
         */
        __init(i: number, bb: flatbuffers.ByteBuffer): Tensor;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param Tensor= obj
         * @returns Tensor
         */
        static getRootAsTensor(bb: flatbuffers.ByteBuffer, obj?: Tensor): Tensor;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param Tensor= obj
         * @returns Tensor
         */
        static getSizePrefixedRootAsTensor(bb: flatbuffers.ByteBuffer, obj?: Tensor): Tensor;
        /**
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array|null
         */
        name(): string | null;
        name(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
        /**
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array|null
         */
        docString(): string | null;
        docString(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
        /**
         * @param number index
         * @returns flatbuffers.Long
         */
        dims(index: number): flatbuffers.Long | null;
        /**
         * @returns number
         */
        dimsLength(): number;
        /**
         * @returns onnxruntime.experimental.fbs.TensorDataType
         */
        dataType(): onnxruntime.experimental.fbs.TensorDataType;
        /**
         * @param number index
         * @returns number
         */
        rawData(index: number): number | null;
        /**
         * @returns number
         */
        rawDataLength(): number;
        /**
         * @returns Uint8Array
         */
        rawDataArray(): Uint8Array | null;
        /**
         * @param number index
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array
         */
        stringData(index: number): string;
        stringData(index: number, optionalEncoding: flatbuffers.Encoding): string | Uint8Array;
        /**
         * @returns number
         */
        stringDataLength(): number;
        /**
         * @param flatbuffers.Builder builder
         */
        static startTensor(builder: flatbuffers.Builder): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset nameOffset
         */
        static addName(builder: flatbuffers.Builder, nameOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset docStringOffset
         */
        static addDocString(builder: flatbuffers.Builder, docStringOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset dimsOffset
         */
        static addDims(builder: flatbuffers.Builder, dimsOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Long> data
         * @returns flatbuffers.Offset
         */
        static createDimsVector(builder: flatbuffers.Builder, data: flatbuffers.Long[]): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startDimsVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param onnxruntime.experimental.fbs.TensorDataType dataType
         */
        static addDataType(builder: flatbuffers.Builder, dataType: onnxruntime.experimental.fbs.TensorDataType): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset rawDataOffset
         */
        static addRawData(builder: flatbuffers.Builder, rawDataOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<number> data
         * @returns flatbuffers.Offset
         */
        static createRawDataVector(builder: flatbuffers.Builder, data: number[] | Uint8Array): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startRawDataVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset stringDataOffset
         */
        static addStringData(builder: flatbuffers.Builder, stringDataOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Offset> data
         * @returns flatbuffers.Offset
         */
        static createStringDataVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startStringDataVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endTensor(builder: flatbuffers.Builder): flatbuffers.Offset;
        static createTensor(builder: flatbuffers.Builder, nameOffset: flatbuffers.Offset, docStringOffset: flatbuffers.Offset, dimsOffset: flatbuffers.Offset, dataType: onnxruntime.experimental.fbs.TensorDataType, rawDataOffset: flatbuffers.Offset, stringDataOffset: flatbuffers.Offset): flatbuffers.Offset;
    }
}
/**
 * @constructor
 */
export declare namespace onnxruntime.experimental.fbs {
    class SparseTensor {
        bb: flatbuffers.ByteBuffer | null;
        bb_pos: number;
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns SparseTensor
         */
        __init(i: number, bb: flatbuffers.ByteBuffer): SparseTensor;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param SparseTensor= obj
         * @returns SparseTensor
         */
        static getRootAsSparseTensor(bb: flatbuffers.ByteBuffer, obj?: SparseTensor): SparseTensor;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param SparseTensor= obj
         * @returns SparseTensor
         */
        static getSizePrefixedRootAsSparseTensor(bb: flatbuffers.ByteBuffer, obj?: SparseTensor): SparseTensor;
        /**
         * @param onnxruntime.experimental.fbs.Tensor= obj
         * @returns onnxruntime.experimental.fbs.Tensor|null
         */
        values(obj?: onnxruntime.experimental.fbs.Tensor): onnxruntime.experimental.fbs.Tensor | null;
        /**
         * @param onnxruntime.experimental.fbs.Tensor= obj
         * @returns onnxruntime.experimental.fbs.Tensor|null
         */
        indices(obj?: onnxruntime.experimental.fbs.Tensor): onnxruntime.experimental.fbs.Tensor | null;
        /**
         * @param number index
         * @returns flatbuffers.Long
         */
        dims(index: number): flatbuffers.Long | null;
        /**
         * @returns number
         */
        dimsLength(): number;
        /**
         * @param flatbuffers.Builder builder
         */
        static startSparseTensor(builder: flatbuffers.Builder): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset valuesOffset
         */
        static addValues(builder: flatbuffers.Builder, valuesOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset indicesOffset
         */
        static addIndices(builder: flatbuffers.Builder, indicesOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset dimsOffset
         */
        static addDims(builder: flatbuffers.Builder, dimsOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Long> data
         * @returns flatbuffers.Offset
         */
        static createDimsVector(builder: flatbuffers.Builder, data: flatbuffers.Long[]): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startDimsVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endSparseTensor(builder: flatbuffers.Builder): flatbuffers.Offset;
        static createSparseTensor(builder: flatbuffers.Builder, valuesOffset: flatbuffers.Offset, indicesOffset: flatbuffers.Offset, dimsOffset: flatbuffers.Offset): flatbuffers.Offset;
    }
}
/**
 * @constructor
 */
export declare namespace onnxruntime.experimental.fbs {
    class Attribute {
        bb: flatbuffers.ByteBuffer | null;
        bb_pos: number;
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns Attribute
         */
        __init(i: number, bb: flatbuffers.ByteBuffer): Attribute;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param Attribute= obj
         * @returns Attribute
         */
        static getRootAsAttribute(bb: flatbuffers.ByteBuffer, obj?: Attribute): Attribute;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param Attribute= obj
         * @returns Attribute
         */
        static getSizePrefixedRootAsAttribute(bb: flatbuffers.ByteBuffer, obj?: Attribute): Attribute;
        /**
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array|null
         */
        name(): string | null;
        name(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
        /**
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array|null
         */
        docString(): string | null;
        docString(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
        /**
         * @returns onnxruntime.experimental.fbs.AttributeType
         */
        type(): onnxruntime.experimental.fbs.AttributeType;
        /**
         * @returns number
         */
        f(): number;
        /**
         * @returns flatbuffers.Long
         */
        i(): flatbuffers.Long;
        /**
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array|null
         */
        s(): string | null;
        s(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
        /**
         * @param onnxruntime.experimental.fbs.Tensor= obj
         * @returns onnxruntime.experimental.fbs.Tensor|null
         */
        t(obj?: onnxruntime.experimental.fbs.Tensor): onnxruntime.experimental.fbs.Tensor | null;
        /**
         * @param onnxruntime.experimental.fbs.Graph= obj
         * @returns onnxruntime.experimental.fbs.Graph|null
         */
        g(obj?: onnxruntime.experimental.fbs.Graph): onnxruntime.experimental.fbs.Graph | null;
        /**
         * @param number index
         * @returns number
         */
        floats(index: number): number | null;
        /**
         * @returns number
         */
        floatsLength(): number;
        /**
         * @returns Float32Array
         */
        floatsArray(): Float32Array | null;
        /**
         * @param number index
         * @returns flatbuffers.Long
         */
        ints(index: number): flatbuffers.Long | null;
        /**
         * @returns number
         */
        intsLength(): number;
        /**
         * @param number index
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array
         */
        strings(index: number): string;
        strings(index: number, optionalEncoding: flatbuffers.Encoding): string | Uint8Array;
        /**
         * @returns number
         */
        stringsLength(): number;
        /**
         * @param number index
         * @param onnxruntime.experimental.fbs.Tensor= obj
         * @returns onnxruntime.experimental.fbs.Tensor
         */
        tensors(index: number, obj?: onnxruntime.experimental.fbs.Tensor): onnxruntime.experimental.fbs.Tensor | null;
        /**
         * @returns number
         */
        tensorsLength(): number;
        /**
         * @param number index
         * @param onnxruntime.experimental.fbs.Graph= obj
         * @returns onnxruntime.experimental.fbs.Graph
         */
        graphs(index: number, obj?: onnxruntime.experimental.fbs.Graph): onnxruntime.experimental.fbs.Graph | null;
        /**
         * @returns number
         */
        graphsLength(): number;
        /**
         * @param flatbuffers.Builder builder
         */
        static startAttribute(builder: flatbuffers.Builder): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset nameOffset
         */
        static addName(builder: flatbuffers.Builder, nameOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset docStringOffset
         */
        static addDocString(builder: flatbuffers.Builder, docStringOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param onnxruntime.experimental.fbs.AttributeType type
         */
        static addType(builder: flatbuffers.Builder, type: onnxruntime.experimental.fbs.AttributeType): void;
        /**
         * @param flatbuffers.Builder builder
         * @param number f
         */
        static addF(builder: flatbuffers.Builder, f: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Long i
         */
        static addI(builder: flatbuffers.Builder, i: flatbuffers.Long): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset sOffset
         */
        static addS(builder: flatbuffers.Builder, sOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset tOffset
         */
        static addT(builder: flatbuffers.Builder, tOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset gOffset
         */
        static addG(builder: flatbuffers.Builder, gOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset floatsOffset
         */
        static addFloats(builder: flatbuffers.Builder, floatsOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<number> data
         * @returns flatbuffers.Offset
         */
        static createFloatsVector(builder: flatbuffers.Builder, data: number[] | Uint8Array): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startFloatsVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset intsOffset
         */
        static addInts(builder: flatbuffers.Builder, intsOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Long> data
         * @returns flatbuffers.Offset
         */
        static createIntsVector(builder: flatbuffers.Builder, data: flatbuffers.Long[]): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startIntsVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset stringsOffset
         */
        static addStrings(builder: flatbuffers.Builder, stringsOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Offset> data
         * @returns flatbuffers.Offset
         */
        static createStringsVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startStringsVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset tensorsOffset
         */
        static addTensors(builder: flatbuffers.Builder, tensorsOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Offset> data
         * @returns flatbuffers.Offset
         */
        static createTensorsVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startTensorsVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset graphsOffset
         */
        static addGraphs(builder: flatbuffers.Builder, graphsOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Offset> data
         * @returns flatbuffers.Offset
         */
        static createGraphsVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startGraphsVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endAttribute(builder: flatbuffers.Builder): flatbuffers.Offset;
        static createAttribute(builder: flatbuffers.Builder, nameOffset: flatbuffers.Offset, docStringOffset: flatbuffers.Offset, type: onnxruntime.experimental.fbs.AttributeType, f: number, i: flatbuffers.Long, sOffset: flatbuffers.Offset, tOffset: flatbuffers.Offset, gOffset: flatbuffers.Offset, floatsOffset: flatbuffers.Offset, intsOffset: flatbuffers.Offset, stringsOffset: flatbuffers.Offset, tensorsOffset: flatbuffers.Offset, graphsOffset: flatbuffers.Offset): flatbuffers.Offset;
    }
}
/**
 * @constructor
 */
export declare namespace onnxruntime.experimental.fbs {
    class Graph {
        bb: flatbuffers.ByteBuffer | null;
        bb_pos: number;
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns Graph
         */
        __init(i: number, bb: flatbuffers.ByteBuffer): Graph;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param Graph= obj
         * @returns Graph
         */
        static getRootAsGraph(bb: flatbuffers.ByteBuffer, obj?: Graph): Graph;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param Graph= obj
         * @returns Graph
         */
        static getSizePrefixedRootAsGraph(bb: flatbuffers.ByteBuffer, obj?: Graph): Graph;
        /**
         * @param number index
         * @param onnxruntime.experimental.fbs.Tensor= obj
         * @returns onnxruntime.experimental.fbs.Tensor
         */
        initializers(index: number, obj?: onnxruntime.experimental.fbs.Tensor): onnxruntime.experimental.fbs.Tensor | null;
        /**
         * @returns number
         */
        initializersLength(): number;
        /**
         * @param number index
         * @param onnxruntime.experimental.fbs.ValueInfo= obj
         * @returns onnxruntime.experimental.fbs.ValueInfo
         */
        nodeArgs(index: number, obj?: onnxruntime.experimental.fbs.ValueInfo): onnxruntime.experimental.fbs.ValueInfo | null;
        /**
         * @returns number
         */
        nodeArgsLength(): number;
        /**
         * @param number index
         * @param onnxruntime.experimental.fbs.Node= obj
         * @returns onnxruntime.experimental.fbs.Node
         */
        nodes(index: number, obj?: onnxruntime.experimental.fbs.Node): onnxruntime.experimental.fbs.Node | null;
        /**
         * @returns number
         */
        nodesLength(): number;
        /**
         * @returns number
         */
        maxNodeIndex(): number;
        /**
         * @param number index
         * @param onnxruntime.experimental.fbs.NodeEdge= obj
         * @returns onnxruntime.experimental.fbs.NodeEdge
         */
        nodeEdges(index: number, obj?: onnxruntime.experimental.fbs.NodeEdge): onnxruntime.experimental.fbs.NodeEdge | null;
        /**
         * @returns number
         */
        nodeEdgesLength(): number;
        /**
         * @param number index
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array
         */
        inputs(index: number): string;
        inputs(index: number, optionalEncoding: flatbuffers.Encoding): string | Uint8Array;
        /**
         * @returns number
         */
        inputsLength(): number;
        /**
         * @param number index
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array
         */
        outputs(index: number): string;
        outputs(index: number, optionalEncoding: flatbuffers.Encoding): string | Uint8Array;
        /**
         * @returns number
         */
        outputsLength(): number;
        /**
         * @param number index
         * @param onnxruntime.experimental.fbs.SparseTensor= obj
         * @returns onnxruntime.experimental.fbs.SparseTensor
         */
        sparseInitializers(index: number, obj?: onnxruntime.experimental.fbs.SparseTensor): onnxruntime.experimental.fbs.SparseTensor | null;
        /**
         * @returns number
         */
        sparseInitializersLength(): number;
        /**
         * @param flatbuffers.Builder builder
         */
        static startGraph(builder: flatbuffers.Builder): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset initializersOffset
         */
        static addInitializers(builder: flatbuffers.Builder, initializersOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Offset> data
         * @returns flatbuffers.Offset
         */
        static createInitializersVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startInitializersVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset nodeArgsOffset
         */
        static addNodeArgs(builder: flatbuffers.Builder, nodeArgsOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Offset> data
         * @returns flatbuffers.Offset
         */
        static createNodeArgsVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startNodeArgsVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset nodesOffset
         */
        static addNodes(builder: flatbuffers.Builder, nodesOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Offset> data
         * @returns flatbuffers.Offset
         */
        static createNodesVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startNodesVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param number maxNodeIndex
         */
        static addMaxNodeIndex(builder: flatbuffers.Builder, maxNodeIndex: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset nodeEdgesOffset
         */
        static addNodeEdges(builder: flatbuffers.Builder, nodeEdgesOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Offset> data
         * @returns flatbuffers.Offset
         */
        static createNodeEdgesVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startNodeEdgesVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset inputsOffset
         */
        static addInputs(builder: flatbuffers.Builder, inputsOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Offset> data
         * @returns flatbuffers.Offset
         */
        static createInputsVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startInputsVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset outputsOffset
         */
        static addOutputs(builder: flatbuffers.Builder, outputsOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Offset> data
         * @returns flatbuffers.Offset
         */
        static createOutputsVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startOutputsVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset sparseInitializersOffset
         */
        static addSparseInitializers(builder: flatbuffers.Builder, sparseInitializersOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Offset> data
         * @returns flatbuffers.Offset
         */
        static createSparseInitializersVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startSparseInitializersVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endGraph(builder: flatbuffers.Builder): flatbuffers.Offset;
        static createGraph(builder: flatbuffers.Builder, initializersOffset: flatbuffers.Offset, nodeArgsOffset: flatbuffers.Offset, nodesOffset: flatbuffers.Offset, maxNodeIndex: number, nodeEdgesOffset: flatbuffers.Offset, inputsOffset: flatbuffers.Offset, outputsOffset: flatbuffers.Offset, sparseInitializersOffset: flatbuffers.Offset): flatbuffers.Offset;
    }
}
/**
 * @constructor
 */
export declare namespace onnxruntime.experimental.fbs {
    class Model {
        bb: flatbuffers.ByteBuffer | null;
        bb_pos: number;
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns Model
         */
        __init(i: number, bb: flatbuffers.ByteBuffer): Model;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param Model= obj
         * @returns Model
         */
        static getRootAsModel(bb: flatbuffers.ByteBuffer, obj?: Model): Model;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param Model= obj
         * @returns Model
         */
        static getSizePrefixedRootAsModel(bb: flatbuffers.ByteBuffer, obj?: Model): Model;
        /**
         * @returns flatbuffers.Long
         */
        irVersion(): flatbuffers.Long;
        /**
         * @param number index
         * @param onnxruntime.experimental.fbs.OperatorSetId= obj
         * @returns onnxruntime.experimental.fbs.OperatorSetId
         */
        opsetImport(index: number, obj?: onnxruntime.experimental.fbs.OperatorSetId): onnxruntime.experimental.fbs.OperatorSetId | null;
        /**
         * @returns number
         */
        opsetImportLength(): number;
        /**
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array|null
         */
        producerName(): string | null;
        producerName(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
        /**
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array|null
         */
        producerVersion(): string | null;
        producerVersion(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
        /**
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array|null
         */
        domain(): string | null;
        domain(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
        /**
         * @returns flatbuffers.Long
         */
        modelVersion(): flatbuffers.Long;
        /**
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array|null
         */
        docString(): string | null;
        docString(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
        /**
         * @param onnxruntime.experimental.fbs.Graph= obj
         * @returns onnxruntime.experimental.fbs.Graph|null
         */
        graph(obj?: onnxruntime.experimental.fbs.Graph): onnxruntime.experimental.fbs.Graph | null;
        /**
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array|null
         */
        graphDocString(): string | null;
        graphDocString(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
        /**
         * @param flatbuffers.Builder builder
         */
        static startModel(builder: flatbuffers.Builder): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Long irVersion
         */
        static addIrVersion(builder: flatbuffers.Builder, irVersion: flatbuffers.Long): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset opsetImportOffset
         */
        static addOpsetImport(builder: flatbuffers.Builder, opsetImportOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Offset> data
         * @returns flatbuffers.Offset
         */
        static createOpsetImportVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startOpsetImportVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset producerNameOffset
         */
        static addProducerName(builder: flatbuffers.Builder, producerNameOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset producerVersionOffset
         */
        static addProducerVersion(builder: flatbuffers.Builder, producerVersionOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset domainOffset
         */
        static addDomain(builder: flatbuffers.Builder, domainOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Long modelVersion
         */
        static addModelVersion(builder: flatbuffers.Builder, modelVersion: flatbuffers.Long): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset docStringOffset
         */
        static addDocString(builder: flatbuffers.Builder, docStringOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset graphOffset
         */
        static addGraph(builder: flatbuffers.Builder, graphOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset graphDocStringOffset
         */
        static addGraphDocString(builder: flatbuffers.Builder, graphDocStringOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endModel(builder: flatbuffers.Builder): flatbuffers.Offset;
        static createModel(builder: flatbuffers.Builder, irVersion: flatbuffers.Long, opsetImportOffset: flatbuffers.Offset, producerNameOffset: flatbuffers.Offset, producerVersionOffset: flatbuffers.Offset, domainOffset: flatbuffers.Offset, modelVersion: flatbuffers.Long, docStringOffset: flatbuffers.Offset, graphOffset: flatbuffers.Offset, graphDocStringOffset: flatbuffers.Offset): flatbuffers.Offset;
    }
}
/**
 * @constructor
 */
export declare namespace onnxruntime.experimental.fbs {
    class KernelCreateInfos {
        bb: flatbuffers.ByteBuffer | null;
        bb_pos: number;
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns KernelCreateInfos
         */
        __init(i: number, bb: flatbuffers.ByteBuffer): KernelCreateInfos;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param KernelCreateInfos= obj
         * @returns KernelCreateInfos
         */
        static getRootAsKernelCreateInfos(bb: flatbuffers.ByteBuffer, obj?: KernelCreateInfos): KernelCreateInfos;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param KernelCreateInfos= obj
         * @returns KernelCreateInfos
         */
        static getSizePrefixedRootAsKernelCreateInfos(bb: flatbuffers.ByteBuffer, obj?: KernelCreateInfos): KernelCreateInfos;
        /**
         * @param number index
         * @returns number
         */
        nodeIndices(index: number): number | null;
        /**
         * @returns number
         */
        nodeIndicesLength(): number;
        /**
         * @returns Uint32Array
         */
        nodeIndicesArray(): Uint32Array | null;
        /**
         * @param number index
         * @returns flatbuffers.Long
         */
        kernelDefHashes(index: number): flatbuffers.Long | null;
        /**
         * @returns number
         */
        kernelDefHashesLength(): number;
        /**
         * @param flatbuffers.Builder builder
         */
        static startKernelCreateInfos(builder: flatbuffers.Builder): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset nodeIndicesOffset
         */
        static addNodeIndices(builder: flatbuffers.Builder, nodeIndicesOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<number> data
         * @returns flatbuffers.Offset
         */
        static createNodeIndicesVector(builder: flatbuffers.Builder, data: number[] | Uint8Array): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startNodeIndicesVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset kernelDefHashesOffset
         */
        static addKernelDefHashes(builder: flatbuffers.Builder, kernelDefHashesOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Long> data
         * @returns flatbuffers.Offset
         */
        static createKernelDefHashesVector(builder: flatbuffers.Builder, data: flatbuffers.Long[]): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startKernelDefHashesVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endKernelCreateInfos(builder: flatbuffers.Builder): flatbuffers.Offset;
        static createKernelCreateInfos(builder: flatbuffers.Builder, nodeIndicesOffset: flatbuffers.Offset, kernelDefHashesOffset: flatbuffers.Offset): flatbuffers.Offset;
    }
}
/**
 * @constructor
 */
export declare namespace onnxruntime.experimental.fbs {
    class SubGraphSessionState {
        bb: flatbuffers.ByteBuffer | null;
        bb_pos: number;
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns SubGraphSessionState
         */
        __init(i: number, bb: flatbuffers.ByteBuffer): SubGraphSessionState;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param SubGraphSessionState= obj
         * @returns SubGraphSessionState
         */
        static getRootAsSubGraphSessionState(bb: flatbuffers.ByteBuffer, obj?: SubGraphSessionState): SubGraphSessionState;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param SubGraphSessionState= obj
         * @returns SubGraphSessionState
         */
        static getSizePrefixedRootAsSubGraphSessionState(bb: flatbuffers.ByteBuffer, obj?: SubGraphSessionState): SubGraphSessionState;
        /**
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array|null
         */
        graphId(): string | null;
        graphId(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
        /**
         * @param onnxruntime.experimental.fbs.SessionState= obj
         * @returns onnxruntime.experimental.fbs.SessionState|null
         */
        sessionState(obj?: onnxruntime.experimental.fbs.SessionState): onnxruntime.experimental.fbs.SessionState | null;
        /**
         * @param flatbuffers.Builder builder
         */
        static startSubGraphSessionState(builder: flatbuffers.Builder): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset graphIdOffset
         */
        static addGraphId(builder: flatbuffers.Builder, graphIdOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset sessionStateOffset
         */
        static addSessionState(builder: flatbuffers.Builder, sessionStateOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endSubGraphSessionState(builder: flatbuffers.Builder): flatbuffers.Offset;
        static createSubGraphSessionState(builder: flatbuffers.Builder, graphIdOffset: flatbuffers.Offset, sessionStateOffset: flatbuffers.Offset): flatbuffers.Offset;
    }
}
/**
 * @constructor
 */
export declare namespace onnxruntime.experimental.fbs {
    class SessionState {
        bb: flatbuffers.ByteBuffer | null;
        bb_pos: number;
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns SessionState
         */
        __init(i: number, bb: flatbuffers.ByteBuffer): SessionState;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param SessionState= obj
         * @returns SessionState
         */
        static getRootAsSessionState(bb: flatbuffers.ByteBuffer, obj?: SessionState): SessionState;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param SessionState= obj
         * @returns SessionState
         */
        static getSizePrefixedRootAsSessionState(bb: flatbuffers.ByteBuffer, obj?: SessionState): SessionState;
        /**
         * @param onnxruntime.experimental.fbs.KernelCreateInfos= obj
         * @returns onnxruntime.experimental.fbs.KernelCreateInfos|null
         */
        kernels(obj?: onnxruntime.experimental.fbs.KernelCreateInfos): onnxruntime.experimental.fbs.KernelCreateInfos | null;
        /**
         * @param number index
         * @param onnxruntime.experimental.fbs.SubGraphSessionState= obj
         * @returns onnxruntime.experimental.fbs.SubGraphSessionState
         */
        subGraphSessionStates(index: number, obj?: onnxruntime.experimental.fbs.SubGraphSessionState): onnxruntime.experimental.fbs.SubGraphSessionState | null;
        /**
         * @returns number
         */
        subGraphSessionStatesLength(): number;
        /**
         * @param flatbuffers.Builder builder
         */
        static startSessionState(builder: flatbuffers.Builder): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset kernelsOffset
         */
        static addKernels(builder: flatbuffers.Builder, kernelsOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset subGraphSessionStatesOffset
         */
        static addSubGraphSessionStates(builder: flatbuffers.Builder, subGraphSessionStatesOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Offset> data
         * @returns flatbuffers.Offset
         */
        static createSubGraphSessionStatesVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startSubGraphSessionStatesVector(builder: flatbuffers.Builder, numElems: number): void;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endSessionState(builder: flatbuffers.Builder): flatbuffers.Offset;
        static createSessionState(builder: flatbuffers.Builder, kernelsOffset: flatbuffers.Offset, subGraphSessionStatesOffset: flatbuffers.Offset): flatbuffers.Offset;
    }
}
/**
 * @constructor
 */
export declare namespace onnxruntime.experimental.fbs {
    class InferenceSession {
        bb: flatbuffers.ByteBuffer | null;
        bb_pos: number;
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns InferenceSession
         */
        __init(i: number, bb: flatbuffers.ByteBuffer): InferenceSession;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param InferenceSession= obj
         * @returns InferenceSession
         */
        static getRootAsInferenceSession(bb: flatbuffers.ByteBuffer, obj?: InferenceSession): InferenceSession;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param InferenceSession= obj
         * @returns InferenceSession
         */
        static getSizePrefixedRootAsInferenceSession(bb: flatbuffers.ByteBuffer, obj?: InferenceSession): InferenceSession;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @returns boolean
         */
        static bufferHasIdentifier(bb: flatbuffers.ByteBuffer): boolean;
        /**
         * @param flatbuffers.Encoding= optionalEncoding
         * @returns string|Uint8Array|null
         */
        ortVersion(): string | null;
        ortVersion(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
        /**
         * @param onnxruntime.experimental.fbs.Model= obj
         * @returns onnxruntime.experimental.fbs.Model|null
         */
        model(obj?: onnxruntime.experimental.fbs.Model): onnxruntime.experimental.fbs.Model | null;
        /**
         * @param onnxruntime.experimental.fbs.SessionState= obj
         * @returns onnxruntime.experimental.fbs.SessionState|null
         */
        sessionState(obj?: onnxruntime.experimental.fbs.SessionState): onnxruntime.experimental.fbs.SessionState | null;
        /**
         * @param flatbuffers.Builder builder
         */
        static startInferenceSession(builder: flatbuffers.Builder): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset ortVersionOffset
         */
        static addOrtVersion(builder: flatbuffers.Builder, ortVersionOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset modelOffset
         */
        static addModel(builder: flatbuffers.Builder, modelOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset sessionStateOffset
         */
        static addSessionState(builder: flatbuffers.Builder, sessionStateOffset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endInferenceSession(builder: flatbuffers.Builder): flatbuffers.Offset;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset offset
         */
        static finishInferenceSessionBuffer(builder: flatbuffers.Builder, offset: flatbuffers.Offset): void;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset offset
         */
        static finishSizePrefixedInferenceSessionBuffer(builder: flatbuffers.Builder, offset: flatbuffers.Offset): void;
        static createInferenceSession(builder: flatbuffers.Builder, ortVersionOffset: flatbuffers.Offset, modelOffset: flatbuffers.Offset, sessionStateOffset: flatbuffers.Offset): flatbuffers.Offset;
    }
}

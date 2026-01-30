let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export_0(addHeapObject(e));
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}
/**
 * @returns {string}
 */
export function version() {
    let deferred1_0;
    let deferred1_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.version(retptr);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        deferred1_0 = r0;
        deferred1_1 = r1;
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_export_1(deferred1_0, deferred1_1, 1);
    }
}

/**
 * @param {number} extra_bytes_count
 */
export function reserve_memory(extra_bytes_count) {
    wasm.reserve_memory(extra_bytes_count);
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

let stack_pointer = 128;

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}

let cachedInt32ArrayMemory0 = null;

function getInt32ArrayMemory0() {
    if (cachedInt32ArrayMemory0 === null || cachedInt32ArrayMemory0.byteLength === 0) {
        cachedInt32ArrayMemory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32ArrayMemory0;
}

function getArrayI32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getInt32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

let cachedFloat32ArrayMemory0 = null;

function getFloat32ArrayMemory0() {
    if (cachedFloat32ArrayMemory0 === null || cachedFloat32ArrayMemory0.byteLength === 0) {
        cachedFloat32ArrayMemory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32ArrayMemory0;
}

function getArrayF32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

let cachedUint32ArrayMemory0 = null;

function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

let WASM_VECTOR_LEN = 0;

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayF32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getFloat32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
/**
 * @enum {0 | 1 | 2}
 */
export const RawFeatureType = Object.freeze({
    Vertex: 0, "0": "Vertex",
    Face: 1, "1": "Face",
    Unknown: 2, "2": "Unknown",
});
/**
 * @enum {0 | 1 | 2}
 */
export const RawJointAxis = Object.freeze({
    LinX: 0, "0": "LinX",
    LinY: 1, "1": "LinY",
    AngX: 2, "2": "AngX",
});
/**
 * @enum {0 | 1 | 2 | 3 | 4 | 5}
 */
export const RawJointType = Object.freeze({
    Revolute: 0, "0": "Revolute",
    Fixed: 1, "1": "Fixed",
    Prismatic: 2, "2": "Prismatic",
    Rope: 3, "3": "Rope",
    Spring: 4, "4": "Spring",
    Generic: 5, "5": "Generic",
});
/**
 * @enum {0 | 1}
 */
export const RawMotorModel = Object.freeze({
    AccelerationBased: 0, "0": "AccelerationBased",
    ForceBased: 1, "1": "ForceBased",
});
/**
 * @enum {0 | 1 | 2 | 3}
 */
export const RawRigidBodyType = Object.freeze({
    Dynamic: 0, "0": "Dynamic",
    Fixed: 1, "1": "Fixed",
    KinematicPositionBased: 2, "2": "KinematicPositionBased",
    KinematicVelocityBased: 3, "3": "KinematicVelocityBased",
});
/**
 * @enum {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14}
 */
export const RawShapeType = Object.freeze({
    Ball: 0, "0": "Ball",
    Cuboid: 1, "1": "Cuboid",
    Capsule: 2, "2": "Capsule",
    Segment: 3, "3": "Segment",
    Polyline: 4, "4": "Polyline",
    Triangle: 5, "5": "Triangle",
    TriMesh: 6, "6": "TriMesh",
    HeightField: 7, "7": "HeightField",
    Compound: 8, "8": "Compound",
    ConvexPolygon: 9, "9": "ConvexPolygon",
    RoundCuboid: 10, "10": "RoundCuboid",
    RoundTriangle: 11, "11": "RoundTriangle",
    RoundConvexPolygon: 12, "12": "RoundConvexPolygon",
    HalfSpace: 13, "13": "HalfSpace",
    Voxels: 14, "14": "Voxels",
});

const RawBroadPhaseFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawbroadphase_free(ptr >>> 0, 1));

export class RawBroadPhase {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawBroadPhase.prototype);
        obj.__wbg_ptr = ptr;
        RawBroadPhaseFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawBroadPhaseFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawbroadphase_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.rawbroadphase_new();
        this.__wbg_ptr = ret >>> 0;
        RawBroadPhaseFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}

const RawCCDSolverFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawccdsolver_free(ptr >>> 0, 1));

export class RawCCDSolver {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawCCDSolverFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawccdsolver_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.rawccdsolver_new();
        this.__wbg_ptr = ret >>> 0;
        RawCCDSolverFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}

const RawCharacterCollisionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawcharactercollision_free(ptr >>> 0, 1));

export class RawCharacterCollision {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawCharacterCollisionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawcharactercollision_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.rawcharactercollision_new();
        this.__wbg_ptr = ret >>> 0;
        RawCharacterCollisionFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {number}
     */
    handle() {
        const ret = wasm.rawcharactercollision_handle(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {RawVector}
     */
    translationDeltaApplied() {
        const ret = wasm.rawcharactercollision_translationDeltaApplied(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @returns {RawVector}
     */
    translationDeltaRemaining() {
        const ret = wasm.rawcharactercollision_translationDeltaRemaining(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @returns {number}
     */
    toi() {
        const ret = wasm.rawcharactercollision_toi(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {RawVector}
     */
    worldWitness1() {
        const ret = wasm.rawcharactercollision_worldWitness1(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @returns {RawVector}
     */
    worldWitness2() {
        const ret = wasm.rawcharactercollision_worldWitness2(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @returns {RawVector}
     */
    worldNormal1() {
        const ret = wasm.rawcharactercollision_worldNormal1(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @returns {RawVector}
     */
    worldNormal2() {
        const ret = wasm.rawcharactercollision_worldNormal2(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
}

const RawColliderSetFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawcolliderset_free(ptr >>> 0, 1));

export class RawColliderSet {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawColliderSet.prototype);
        obj.__wbg_ptr = ptr;
        RawColliderSetFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawColliderSetFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawcolliderset_free(ptr, 0);
    }
    /**
     * The world-space translation of this collider.
     * @param {number} handle
     * @returns {RawVector}
     */
    coTranslation(handle) {
        const ret = wasm.rawcolliderset_coTranslation(this.__wbg_ptr, handle);
        return RawVector.__wrap(ret);
    }
    /**
     * The world-space orientation of this collider.
     * @param {number} handle
     * @returns {RawRotation}
     */
    coRotation(handle) {
        const ret = wasm.rawcolliderset_coRotation(this.__wbg_ptr, handle);
        return RawRotation.__wrap(ret);
    }
    /**
     * Sets the translation of this collider.
     *
     * # Parameters
     * - `x`: the world-space position of the collider along the `x` axis.
     * - `y`: the world-space position of the collider along the `y` axis.
     * - `wakeUp`: forces the collider to wake-up so it is properly affected by forces if it
     * wasn't moving before modifying its position.
     * @param {number} handle
     * @param {number} x
     * @param {number} y
     */
    coSetTranslation(handle, x, y) {
        wasm.rawcolliderset_coSetTranslation(this.__wbg_ptr, handle, x, y);
    }
    /**
     * @param {number} handle
     * @param {number} x
     * @param {number} y
     */
    coSetTranslationWrtParent(handle, x, y) {
        wasm.rawcolliderset_coSetTranslationWrtParent(this.__wbg_ptr, handle, x, y);
    }
    /**
     * Sets the rotation angle of this collider.
     *
     * # Parameters
     * - `angle`: the rotation angle, in radians.
     * - `wakeUp`: forces the collider to wake-up so it is properly affected by forces if it
     * wasn't moving before modifying its position.
     * @param {number} handle
     * @param {number} angle
     */
    coSetRotation(handle, angle) {
        wasm.rawcolliderset_coSetRotation(this.__wbg_ptr, handle, angle);
    }
    /**
     * @param {number} handle
     * @param {number} angle
     */
    coSetRotationWrtParent(handle, angle) {
        wasm.rawcolliderset_coSetRotationWrtParent(this.__wbg_ptr, handle, angle);
    }
    /**
     * Is this collider a sensor?
     * @param {number} handle
     * @returns {boolean}
     */
    coIsSensor(handle) {
        const ret = wasm.rawcolliderset_coIsSensor(this.__wbg_ptr, handle);
        return ret !== 0;
    }
    /**
     * The type of the shape of this collider.
     * @param {number} handle
     * @returns {RawShapeType}
     */
    coShapeType(handle) {
        const ret = wasm.rawcolliderset_coShapeType(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * @param {number} handle
     * @returns {RawVector | undefined}
     */
    coHalfspaceNormal(handle) {
        const ret = wasm.rawcolliderset_coHalfspaceNormal(this.__wbg_ptr, handle);
        return ret === 0 ? undefined : RawVector.__wrap(ret);
    }
    /**
     * The half-extents of this collider if it is has a cuboid shape.
     * @param {number} handle
     * @returns {RawVector | undefined}
     */
    coHalfExtents(handle) {
        const ret = wasm.rawcolliderset_coHalfExtents(this.__wbg_ptr, handle);
        return ret === 0 ? undefined : RawVector.__wrap(ret);
    }
    /**
     * Set the half-extents of this collider if it has a cuboid shape.
     * @param {number} handle
     * @param {RawVector} newHalfExtents
     */
    coSetHalfExtents(handle, newHalfExtents) {
        _assertClass(newHalfExtents, RawVector);
        wasm.rawcolliderset_coSetHalfExtents(this.__wbg_ptr, handle, newHalfExtents.__wbg_ptr);
    }
    /**
     * The radius of this collider if it is a ball, capsule, cylinder, or cone shape.
     * @param {number} handle
     * @returns {number | undefined}
     */
    coRadius(handle) {
        const ret = wasm.rawcolliderset_coRadius(this.__wbg_ptr, handle);
        return ret === 0x100000001 ? undefined : ret;
    }
    /**
     * Set the radius of this collider if it is a ball, capsule, cylinder, or cone shape.
     * @param {number} handle
     * @param {number} newRadius
     */
    coSetRadius(handle, newRadius) {
        wasm.rawcolliderset_coSetRadius(this.__wbg_ptr, handle, newRadius);
    }
    /**
     * The half height of this collider if it is a capsule, cylinder, or cone shape.
     * @param {number} handle
     * @returns {number | undefined}
     */
    coHalfHeight(handle) {
        const ret = wasm.rawcolliderset_coHalfHeight(this.__wbg_ptr, handle);
        return ret === 0x100000001 ? undefined : ret;
    }
    /**
     * Set the half height of this collider if it is a capsule, cylinder, or cone shape.
     * @param {number} handle
     * @param {number} newHalfheight
     */
    coSetHalfHeight(handle, newHalfheight) {
        wasm.rawcolliderset_coSetHalfHeight(this.__wbg_ptr, handle, newHalfheight);
    }
    /**
     * The radius of the round edges of this collider.
     * @param {number} handle
     * @returns {number | undefined}
     */
    coRoundRadius(handle) {
        const ret = wasm.rawcolliderset_coRoundRadius(this.__wbg_ptr, handle);
        return ret === 0x100000001 ? undefined : ret;
    }
    /**
     * Set the radius of the round edges of this collider.
     * @param {number} handle
     * @param {number} newBorderRadius
     */
    coSetRoundRadius(handle, newBorderRadius) {
        wasm.rawcolliderset_coSetRoundRadius(this.__wbg_ptr, handle, newBorderRadius);
    }
    /**
     * @param {number} handle
     * @returns {Int32Array | undefined}
     */
    coVoxelData(handle) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rawcolliderset_coVoxelData(retptr, this.__wbg_ptr, handle);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getArrayI32FromWasm0(r0, r1).slice();
                wasm.__wbindgen_export_1(r0, r1 * 4, 4);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {number} handle
     * @returns {RawVector | undefined}
     */
    coVoxelSize(handle) {
        const ret = wasm.rawcolliderset_coVoxelSize(this.__wbg_ptr, handle);
        return ret === 0 ? undefined : RawVector.__wrap(ret);
    }
    /**
     * @param {number} handle
     * @param {number} ix
     * @param {number} iy
     * @param {boolean} filled
     */
    coSetVoxel(handle, ix, iy, filled) {
        wasm.rawcolliderset_coSetVoxel(this.__wbg_ptr, handle, ix, iy, filled);
    }
    /**
     * @param {number} handle1
     * @param {number} handle2
     * @param {number} ix
     * @param {number} iy
     * @param {number} shift_x
     * @param {number} shift_y
     */
    coPropagateVoxelChange(handle1, handle2, ix, iy, shift_x, shift_y) {
        wasm.rawcolliderset_coPropagateVoxelChange(this.__wbg_ptr, handle1, handle2, ix, iy, shift_x, shift_y);
    }
    /**
     * @param {number} handle1
     * @param {number} handle2
     * @param {number} shift_x
     * @param {number} shift_y
     */
    coCombineVoxelStates(handle1, handle2, shift_x, shift_y) {
        wasm.rawcolliderset_coCombineVoxelStates(this.__wbg_ptr, handle1, handle2, shift_x, shift_y);
    }
    /**
     * The vertices of this triangle mesh, polyline, convex polyhedron, segment, triangle or convex polyhedron, if it is one.
     * @param {number} handle
     * @returns {Float32Array | undefined}
     */
    coVertices(handle) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rawcolliderset_coVertices(retptr, this.__wbg_ptr, handle);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getArrayF32FromWasm0(r0, r1).slice();
                wasm.__wbindgen_export_1(r0, r1 * 4, 4);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The indices of this triangle mesh, polyline, or convex polyhedron, if it is one.
     * @param {number} handle
     * @returns {Uint32Array | undefined}
     */
    coIndices(handle) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rawcolliderset_coIndices(retptr, this.__wbg_ptr, handle);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getArrayU32FromWasm0(r0, r1).slice();
                wasm.__wbindgen_export_1(r0, r1 * 4, 4);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {number} handle
     * @returns {number | undefined}
     */
    coTriMeshFlags(handle) {
        const ret = wasm.rawcolliderset_coTriMeshFlags(this.__wbg_ptr, handle);
        return ret === 0x100000001 ? undefined : ret;
    }
    /**
     * The height of this heightfield if it is one.
     * @param {number} handle
     * @returns {Float32Array | undefined}
     */
    coHeightfieldHeights(handle) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rawcolliderset_coHeightfieldHeights(retptr, this.__wbg_ptr, handle);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getArrayF32FromWasm0(r0, r1).slice();
                wasm.__wbindgen_export_1(r0, r1 * 4, 4);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The scaling factor applied of this heightfield if it is one.
     * @param {number} handle
     * @returns {RawVector | undefined}
     */
    coHeightfieldScale(handle) {
        const ret = wasm.rawcolliderset_coHeightfieldScale(this.__wbg_ptr, handle);
        return ret === 0 ? undefined : RawVector.__wrap(ret);
    }
    /**
     * The unique integer identifier of the collider this collider is attached to.
     * @param {number} handle
     * @returns {number | undefined}
     */
    coParent(handle) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rawcolliderset_coParent(retptr, this.__wbg_ptr, handle);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r2 = getDataViewMemory0().getFloat64(retptr + 8 * 1, true);
            return r0 === 0 ? undefined : r2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {number} handle
     * @param {boolean} enabled
     */
    coSetEnabled(handle, enabled) {
        wasm.rawcolliderset_coSetEnabled(this.__wbg_ptr, handle, enabled);
    }
    /**
     * @param {number} handle
     * @returns {boolean}
     */
    coIsEnabled(handle) {
        const ret = wasm.rawcolliderset_coIsEnabled(this.__wbg_ptr, handle);
        return ret !== 0;
    }
    /**
     * @param {number} handle
     * @param {number} contact_skin
     */
    coSetContactSkin(handle, contact_skin) {
        wasm.rawcolliderset_coSetContactSkin(this.__wbg_ptr, handle, contact_skin);
    }
    /**
     * @param {number} handle
     * @returns {number}
     */
    coContactSkin(handle) {
        const ret = wasm.rawcolliderset_coContactSkin(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * The friction coefficient of this collider.
     * @param {number} handle
     * @returns {number}
     */
    coFriction(handle) {
        const ret = wasm.rawcolliderset_coFriction(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * The restitution coefficient of this collider.
     * @param {number} handle
     * @returns {number}
     */
    coRestitution(handle) {
        const ret = wasm.rawcolliderset_coRestitution(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * The density of this collider.
     * @param {number} handle
     * @returns {number}
     */
    coDensity(handle) {
        const ret = wasm.rawcolliderset_coDensity(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * The mass of this collider.
     * @param {number} handle
     * @returns {number}
     */
    coMass(handle) {
        const ret = wasm.rawcolliderset_coMass(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * The volume of this collider.
     * @param {number} handle
     * @returns {number}
     */
    coVolume(handle) {
        const ret = wasm.rawcolliderset_coVolume(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * The collision groups of this collider.
     * @param {number} handle
     * @returns {number}
     */
    coCollisionGroups(handle) {
        const ret = wasm.rawcolliderset_coCollisionGroups(this.__wbg_ptr, handle);
        return ret >>> 0;
    }
    /**
     * The solver groups of this collider.
     * @param {number} handle
     * @returns {number}
     */
    coSolverGroups(handle) {
        const ret = wasm.rawcolliderset_coSolverGroups(this.__wbg_ptr, handle);
        return ret >>> 0;
    }
    /**
     * The physics hooks enabled for this collider.
     * @param {number} handle
     * @returns {number}
     */
    coActiveHooks(handle) {
        const ret = wasm.rawcolliderset_coActiveHooks(this.__wbg_ptr, handle);
        return ret >>> 0;
    }
    /**
     * The collision types enabled for this collider.
     * @param {number} handle
     * @returns {number}
     */
    coActiveCollisionTypes(handle) {
        const ret = wasm.rawcolliderset_coActiveCollisionTypes(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * The events enabled for this collider.
     * @param {number} handle
     * @returns {number}
     */
    coActiveEvents(handle) {
        const ret = wasm.rawcolliderset_coActiveEvents(this.__wbg_ptr, handle);
        return ret >>> 0;
    }
    /**
     * The total force magnitude beyond which a contact force event can be emitted.
     * @param {number} handle
     * @returns {number}
     */
    coContactForceEventThreshold(handle) {
        const ret = wasm.rawcolliderset_coContactForceEventThreshold(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * @param {number} handle
     * @param {RawVector} point
     * @returns {boolean}
     */
    coContainsPoint(handle, point) {
        _assertClass(point, RawVector);
        const ret = wasm.rawcolliderset_coContainsPoint(this.__wbg_ptr, handle, point.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {number} handle
     * @param {RawVector} colliderVel
     * @param {RawShape} shape2
     * @param {RawVector} shape2Pos
     * @param {RawRotation} shape2Rot
     * @param {RawVector} shape2Vel
     * @param {number} target_distance
     * @param {number} maxToi
     * @param {boolean} stop_at_penetration
     * @returns {RawShapeCastHit | undefined}
     */
    coCastShape(handle, colliderVel, shape2, shape2Pos, shape2Rot, shape2Vel, target_distance, maxToi, stop_at_penetration) {
        _assertClass(colliderVel, RawVector);
        _assertClass(shape2, RawShape);
        _assertClass(shape2Pos, RawVector);
        _assertClass(shape2Rot, RawRotation);
        _assertClass(shape2Vel, RawVector);
        const ret = wasm.rawcolliderset_coCastShape(this.__wbg_ptr, handle, colliderVel.__wbg_ptr, shape2.__wbg_ptr, shape2Pos.__wbg_ptr, shape2Rot.__wbg_ptr, shape2Vel.__wbg_ptr, target_distance, maxToi, stop_at_penetration);
        return ret === 0 ? undefined : RawShapeCastHit.__wrap(ret);
    }
    /**
     * @param {number} handle
     * @param {RawVector} collider1Vel
     * @param {number} collider2handle
     * @param {RawVector} collider2Vel
     * @param {number} target_distance
     * @param {number} max_toi
     * @param {boolean} stop_at_penetration
     * @returns {RawColliderShapeCastHit | undefined}
     */
    coCastCollider(handle, collider1Vel, collider2handle, collider2Vel, target_distance, max_toi, stop_at_penetration) {
        _assertClass(collider1Vel, RawVector);
        _assertClass(collider2Vel, RawVector);
        const ret = wasm.rawcolliderset_coCastCollider(this.__wbg_ptr, handle, collider1Vel.__wbg_ptr, collider2handle, collider2Vel.__wbg_ptr, target_distance, max_toi, stop_at_penetration);
        return ret === 0 ? undefined : RawColliderShapeCastHit.__wrap(ret);
    }
    /**
     * @param {number} handle
     * @param {RawShape} shape2
     * @param {RawVector} shapePos2
     * @param {RawRotation} shapeRot2
     * @returns {boolean}
     */
    coIntersectsShape(handle, shape2, shapePos2, shapeRot2) {
        _assertClass(shape2, RawShape);
        _assertClass(shapePos2, RawVector);
        _assertClass(shapeRot2, RawRotation);
        const ret = wasm.rawcolliderset_coIntersectsShape(this.__wbg_ptr, handle, shape2.__wbg_ptr, shapePos2.__wbg_ptr, shapeRot2.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {number} handle
     * @param {RawShape} shape2
     * @param {RawVector} shapePos2
     * @param {RawRotation} shapeRot2
     * @param {number} prediction
     * @returns {RawShapeContact | undefined}
     */
    coContactShape(handle, shape2, shapePos2, shapeRot2, prediction) {
        _assertClass(shape2, RawShape);
        _assertClass(shapePos2, RawVector);
        _assertClass(shapeRot2, RawRotation);
        const ret = wasm.rawcolliderset_coContactShape(this.__wbg_ptr, handle, shape2.__wbg_ptr, shapePos2.__wbg_ptr, shapeRot2.__wbg_ptr, prediction);
        return ret === 0 ? undefined : RawShapeContact.__wrap(ret);
    }
    /**
     * @param {number} handle
     * @param {number} collider2handle
     * @param {number} prediction
     * @returns {RawShapeContact | undefined}
     */
    coContactCollider(handle, collider2handle, prediction) {
        const ret = wasm.rawcolliderset_coContactCollider(this.__wbg_ptr, handle, collider2handle, prediction);
        return ret === 0 ? undefined : RawShapeContact.__wrap(ret);
    }
    /**
     * @param {number} handle
     * @param {RawVector} point
     * @param {boolean} solid
     * @returns {RawPointProjection}
     */
    coProjectPoint(handle, point, solid) {
        _assertClass(point, RawVector);
        const ret = wasm.rawcolliderset_coProjectPoint(this.__wbg_ptr, handle, point.__wbg_ptr, solid);
        return RawPointProjection.__wrap(ret);
    }
    /**
     * @param {number} handle
     * @param {RawVector} rayOrig
     * @param {RawVector} rayDir
     * @param {number} maxToi
     * @returns {boolean}
     */
    coIntersectsRay(handle, rayOrig, rayDir, maxToi) {
        _assertClass(rayOrig, RawVector);
        _assertClass(rayDir, RawVector);
        const ret = wasm.rawcolliderset_coIntersectsRay(this.__wbg_ptr, handle, rayOrig.__wbg_ptr, rayDir.__wbg_ptr, maxToi);
        return ret !== 0;
    }
    /**
     * @param {number} handle
     * @param {RawVector} rayOrig
     * @param {RawVector} rayDir
     * @param {number} maxToi
     * @param {boolean} solid
     * @returns {number}
     */
    coCastRay(handle, rayOrig, rayDir, maxToi, solid) {
        _assertClass(rayOrig, RawVector);
        _assertClass(rayDir, RawVector);
        const ret = wasm.rawcolliderset_coCastRay(this.__wbg_ptr, handle, rayOrig.__wbg_ptr, rayDir.__wbg_ptr, maxToi, solid);
        return ret;
    }
    /**
     * @param {number} handle
     * @param {RawVector} rayOrig
     * @param {RawVector} rayDir
     * @param {number} maxToi
     * @param {boolean} solid
     * @returns {RawRayIntersection | undefined}
     */
    coCastRayAndGetNormal(handle, rayOrig, rayDir, maxToi, solid) {
        _assertClass(rayOrig, RawVector);
        _assertClass(rayDir, RawVector);
        const ret = wasm.rawcolliderset_coCastRayAndGetNormal(this.__wbg_ptr, handle, rayOrig.__wbg_ptr, rayDir.__wbg_ptr, maxToi, solid);
        return ret === 0 ? undefined : RawRayIntersection.__wrap(ret);
    }
    /**
     * @param {number} handle
     * @param {boolean} is_sensor
     */
    coSetSensor(handle, is_sensor) {
        wasm.rawcolliderset_coSetSensor(this.__wbg_ptr, handle, is_sensor);
    }
    /**
     * @param {number} handle
     * @param {number} restitution
     */
    coSetRestitution(handle, restitution) {
        wasm.rawcolliderset_coSetRestitution(this.__wbg_ptr, handle, restitution);
    }
    /**
     * @param {number} handle
     * @param {number} friction
     */
    coSetFriction(handle, friction) {
        wasm.rawcolliderset_coSetFriction(this.__wbg_ptr, handle, friction);
    }
    /**
     * @param {number} handle
     * @returns {number}
     */
    coFrictionCombineRule(handle) {
        const ret = wasm.rawcolliderset_coFrictionCombineRule(this.__wbg_ptr, handle);
        return ret >>> 0;
    }
    /**
     * @param {number} handle
     * @param {number} rule
     */
    coSetFrictionCombineRule(handle, rule) {
        wasm.rawcolliderset_coSetFrictionCombineRule(this.__wbg_ptr, handle, rule);
    }
    /**
     * @param {number} handle
     * @returns {number}
     */
    coRestitutionCombineRule(handle) {
        const ret = wasm.rawcolliderset_coRestitutionCombineRule(this.__wbg_ptr, handle);
        return ret >>> 0;
    }
    /**
     * @param {number} handle
     * @param {number} rule
     */
    coSetRestitutionCombineRule(handle, rule) {
        wasm.rawcolliderset_coSetRestitutionCombineRule(this.__wbg_ptr, handle, rule);
    }
    /**
     * @param {number} handle
     * @param {number} groups
     */
    coSetCollisionGroups(handle, groups) {
        wasm.rawcolliderset_coSetCollisionGroups(this.__wbg_ptr, handle, groups);
    }
    /**
     * @param {number} handle
     * @param {number} groups
     */
    coSetSolverGroups(handle, groups) {
        wasm.rawcolliderset_coSetSolverGroups(this.__wbg_ptr, handle, groups);
    }
    /**
     * @param {number} handle
     * @param {number} hooks
     */
    coSetActiveHooks(handle, hooks) {
        wasm.rawcolliderset_coSetActiveHooks(this.__wbg_ptr, handle, hooks);
    }
    /**
     * @param {number} handle
     * @param {number} events
     */
    coSetActiveEvents(handle, events) {
        wasm.rawcolliderset_coSetActiveEvents(this.__wbg_ptr, handle, events);
    }
    /**
     * @param {number} handle
     * @param {number} types
     */
    coSetActiveCollisionTypes(handle, types) {
        wasm.rawcolliderset_coSetActiveCollisionTypes(this.__wbg_ptr, handle, types);
    }
    /**
     * @param {number} handle
     * @param {RawShape} shape
     */
    coSetShape(handle, shape) {
        _assertClass(shape, RawShape);
        wasm.rawcolliderset_coSetShape(this.__wbg_ptr, handle, shape.__wbg_ptr);
    }
    /**
     * @param {number} handle
     * @param {number} threshold
     */
    coSetContactForceEventThreshold(handle, threshold) {
        wasm.rawcolliderset_coSetContactForceEventThreshold(this.__wbg_ptr, handle, threshold);
    }
    /**
     * @param {number} handle
     * @param {number} density
     */
    coSetDensity(handle, density) {
        wasm.rawcolliderset_coSetDensity(this.__wbg_ptr, handle, density);
    }
    /**
     * @param {number} handle
     * @param {number} mass
     */
    coSetMass(handle, mass) {
        wasm.rawcolliderset_coSetMass(this.__wbg_ptr, handle, mass);
    }
    /**
     * @param {number} handle
     * @param {number} mass
     * @param {RawVector} centerOfMass
     * @param {number} principalAngularInertia
     */
    coSetMassProperties(handle, mass, centerOfMass, principalAngularInertia) {
        _assertClass(centerOfMass, RawVector);
        wasm.rawcolliderset_coSetMassProperties(this.__wbg_ptr, handle, mass, centerOfMass.__wbg_ptr, principalAngularInertia);
    }
    constructor() {
        const ret = wasm.rawcolliderset_new();
        this.__wbg_ptr = ret >>> 0;
        RawColliderSetFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {number}
     */
    len() {
        const ret = wasm.rawcolliderset_len(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} handle
     * @returns {boolean}
     */
    contains(handle) {
        const ret = wasm.rawcolliderset_contains(this.__wbg_ptr, handle);
        return ret !== 0;
    }
    /**
     * @param {boolean} enabled
     * @param {RawShape} shape
     * @param {RawVector} translation
     * @param {RawRotation} rotation
     * @param {number} massPropsMode
     * @param {number} mass
     * @param {RawVector} centerOfMass
     * @param {number} principalAngularInertia
     * @param {number} density
     * @param {number} friction
     * @param {number} restitution
     * @param {number} frictionCombineRule
     * @param {number} restitutionCombineRule
     * @param {boolean} isSensor
     * @param {number} collisionGroups
     * @param {number} solverGroups
     * @param {number} activeCollisionTypes
     * @param {number} activeHooks
     * @param {number} activeEvents
     * @param {number} contactForceEventThreshold
     * @param {number} contactSkin
     * @param {boolean} hasParent
     * @param {number} parent
     * @param {RawRigidBodySet} bodies
     * @returns {number | undefined}
     */
    createCollider(enabled, shape, translation, rotation, massPropsMode, mass, centerOfMass, principalAngularInertia, density, friction, restitution, frictionCombineRule, restitutionCombineRule, isSensor, collisionGroups, solverGroups, activeCollisionTypes, activeHooks, activeEvents, contactForceEventThreshold, contactSkin, hasParent, parent, bodies) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(shape, RawShape);
            _assertClass(translation, RawVector);
            _assertClass(rotation, RawRotation);
            _assertClass(centerOfMass, RawVector);
            _assertClass(bodies, RawRigidBodySet);
            wasm.rawcolliderset_createCollider(retptr, this.__wbg_ptr, enabled, shape.__wbg_ptr, translation.__wbg_ptr, rotation.__wbg_ptr, massPropsMode, mass, centerOfMass.__wbg_ptr, principalAngularInertia, density, friction, restitution, frictionCombineRule, restitutionCombineRule, isSensor, collisionGroups, solverGroups, activeCollisionTypes, activeHooks, activeEvents, contactForceEventThreshold, contactSkin, hasParent, parent, bodies.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r2 = getDataViewMemory0().getFloat64(retptr + 8 * 1, true);
            return r0 === 0 ? undefined : r2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Removes a collider from this set and wake-up the rigid-body it is attached to.
     * @param {number} handle
     * @param {RawIslandManager} islands
     * @param {RawRigidBodySet} bodies
     * @param {boolean} wakeUp
     */
    remove(handle, islands, bodies, wakeUp) {
        _assertClass(islands, RawIslandManager);
        _assertClass(bodies, RawRigidBodySet);
        wasm.rawcolliderset_remove(this.__wbg_ptr, handle, islands.__wbg_ptr, bodies.__wbg_ptr, wakeUp);
    }
    /**
     * Checks if a collider with the given integer handle exists.
     * @param {number} handle
     * @returns {boolean}
     */
    isHandleValid(handle) {
        const ret = wasm.rawcolliderset_contains(this.__wbg_ptr, handle);
        return ret !== 0;
    }
    /**
     * Applies the given JavaScript function to the integer handle of each collider managed by this collider set.
     *
     * # Parameters
     * - `f(handle)`: the function to apply to the integer handle of each collider managed by this collider set. Called as `f(handle)`.
     * @param {Function} f
     */
    forEachColliderHandle(f) {
        try {
            wasm.rawcolliderset_forEachColliderHandle(this.__wbg_ptr, addBorrowedObject(f));
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
}

const RawColliderShapeCastHitFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawcollidershapecasthit_free(ptr >>> 0, 1));

export class RawColliderShapeCastHit {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawColliderShapeCastHit.prototype);
        obj.__wbg_ptr = ptr;
        RawColliderShapeCastHitFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawColliderShapeCastHitFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawcollidershapecasthit_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    colliderHandle() {
        const ret = wasm.rawcollidershapecasthit_colliderHandle(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    time_of_impact() {
        const ret = wasm.rawcollidershapecasthit_time_of_impact(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {RawVector}
     */
    witness1() {
        const ret = wasm.rawcollidershapecasthit_witness1(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @returns {RawVector}
     */
    witness2() {
        const ret = wasm.rawcollidershapecasthit_witness2(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @returns {RawVector}
     */
    normal1() {
        const ret = wasm.rawcollidershapecasthit_normal1(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @returns {RawVector}
     */
    normal2() {
        const ret = wasm.rawcollidershapecasthit_normal2(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
}

const RawContactForceEventFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawcontactforceevent_free(ptr >>> 0, 1));

export class RawContactForceEvent {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawContactForceEvent.prototype);
        obj.__wbg_ptr = ptr;
        RawContactForceEventFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawContactForceEventFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawcontactforceevent_free(ptr, 0);
    }
    /**
     * The first collider involved in the contact.
     * @returns {number}
     */
    collider1() {
        const ret = wasm.rawcollidershapecasthit_colliderHandle(this.__wbg_ptr);
        return ret;
    }
    /**
     * The second collider involved in the contact.
     * @returns {number}
     */
    collider2() {
        const ret = wasm.rawcontactforceevent_collider2(this.__wbg_ptr);
        return ret;
    }
    /**
     * The sum of all the forces between the two colliders.
     * @returns {RawVector}
     */
    total_force() {
        const ret = wasm.rawcontactforceevent_total_force(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * The sum of the magnitudes of each force between the two colliders.
     *
     * Note that this is **not** the same as the magnitude of `self.total_force`.
     * Here we are summing the magnitude of all the forces, instead of taking
     * the magnitude of their sum.
     * @returns {number}
     */
    total_force_magnitude() {
        const ret = wasm.rawcontactforceevent_total_force_magnitude(this.__wbg_ptr);
        return ret;
    }
    /**
     * The world-space (unit) direction of the force with strongest magnitude.
     * @returns {RawVector}
     */
    max_force_direction() {
        const ret = wasm.rawcharactercollision_translationDeltaApplied(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * The magnitude of the largest force at a contact point of this contact pair.
     * @returns {number}
     */
    max_force_magnitude() {
        const ret = wasm.rawcontactforceevent_max_force_magnitude(this.__wbg_ptr);
        return ret;
    }
}

const RawContactManifoldFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawcontactmanifold_free(ptr >>> 0, 1));

export class RawContactManifold {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawContactManifold.prototype);
        obj.__wbg_ptr = ptr;
        RawContactManifoldFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawContactManifoldFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawcontactmanifold_free(ptr, 0);
    }
    /**
     * @returns {RawVector}
     */
    normal() {
        const ret = wasm.rawcontactmanifold_normal(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @returns {RawVector}
     */
    local_n1() {
        const ret = wasm.rawcontactmanifold_local_n1(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @returns {RawVector}
     */
    local_n2() {
        const ret = wasm.rawcontactmanifold_local_n2(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @returns {number}
     */
    subshape1() {
        const ret = wasm.rawcontactmanifold_subshape1(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    subshape2() {
        const ret = wasm.rawcontactmanifold_subshape2(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    num_contacts() {
        const ret = wasm.rawcontactmanifold_num_contacts(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} i
     * @returns {RawVector | undefined}
     */
    contact_local_p1(i) {
        const ret = wasm.rawcontactmanifold_contact_local_p1(this.__wbg_ptr, i);
        return ret === 0 ? undefined : RawVector.__wrap(ret);
    }
    /**
     * @param {number} i
     * @returns {RawVector | undefined}
     */
    contact_local_p2(i) {
        const ret = wasm.rawcontactmanifold_contact_local_p2(this.__wbg_ptr, i);
        return ret === 0 ? undefined : RawVector.__wrap(ret);
    }
    /**
     * @param {number} i
     * @returns {number}
     */
    contact_dist(i) {
        const ret = wasm.rawcontactmanifold_contact_dist(this.__wbg_ptr, i);
        return ret;
    }
    /**
     * @param {number} i
     * @returns {number}
     */
    contact_fid1(i) {
        const ret = wasm.rawcontactmanifold_contact_fid1(this.__wbg_ptr, i);
        return ret >>> 0;
    }
    /**
     * @param {number} i
     * @returns {number}
     */
    contact_fid2(i) {
        const ret = wasm.rawcontactmanifold_contact_fid2(this.__wbg_ptr, i);
        return ret >>> 0;
    }
    /**
     * @param {number} i
     * @returns {number}
     */
    contact_impulse(i) {
        const ret = wasm.rawcontactmanifold_contact_impulse(this.__wbg_ptr, i);
        return ret;
    }
    /**
     * @param {number} i
     * @returns {number}
     */
    contact_tangent_impulse(i) {
        const ret = wasm.rawcontactmanifold_contact_tangent_impulse(this.__wbg_ptr, i);
        return ret;
    }
    /**
     * @returns {number}
     */
    num_solver_contacts() {
        const ret = wasm.rawcontactmanifold_num_solver_contacts(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} i
     * @returns {RawVector | undefined}
     */
    solver_contact_point(i) {
        const ret = wasm.rawcontactmanifold_solver_contact_point(this.__wbg_ptr, i);
        return ret === 0 ? undefined : RawVector.__wrap(ret);
    }
    /**
     * @param {number} i
     * @returns {number}
     */
    solver_contact_dist(i) {
        const ret = wasm.rawcontactmanifold_solver_contact_dist(this.__wbg_ptr, i);
        return ret;
    }
    /**
     * @param {number} i
     * @returns {number}
     */
    solver_contact_friction(i) {
        const ret = wasm.rawcontactmanifold_solver_contact_friction(this.__wbg_ptr, i);
        return ret;
    }
    /**
     * @param {number} i
     * @returns {number}
     */
    solver_contact_restitution(i) {
        const ret = wasm.rawcontactmanifold_solver_contact_restitution(this.__wbg_ptr, i);
        return ret;
    }
    /**
     * @param {number} i
     * @returns {RawVector}
     */
    solver_contact_tangent_velocity(i) {
        const ret = wasm.rawcontactmanifold_solver_contact_tangent_velocity(this.__wbg_ptr, i);
        return RawVector.__wrap(ret);
    }
}

const RawContactPairFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawcontactpair_free(ptr >>> 0, 1));

export class RawContactPair {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawContactPair.prototype);
        obj.__wbg_ptr = ptr;
        RawContactPairFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawContactPairFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawcontactpair_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    collider1() {
        const ret = wasm.rawcontactpair_collider1(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    collider2() {
        const ret = wasm.rawcontactpair_collider2(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    numContactManifolds() {
        const ret = wasm.rawcontactpair_numContactManifolds(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} i
     * @returns {RawContactManifold | undefined}
     */
    contactManifold(i) {
        const ret = wasm.rawcontactpair_contactManifold(this.__wbg_ptr, i);
        return ret === 0 ? undefined : RawContactManifold.__wrap(ret);
    }
}

const RawDebugRenderPipelineFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawdebugrenderpipeline_free(ptr >>> 0, 1));

export class RawDebugRenderPipeline {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawDebugRenderPipelineFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawdebugrenderpipeline_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.rawdebugrenderpipeline_new();
        this.__wbg_ptr = ret >>> 0;
        RawDebugRenderPipelineFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {Float32Array}
     */
    vertices() {
        const ret = wasm.rawdebugrenderpipeline_vertices(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * @returns {Float32Array}
     */
    colors() {
        const ret = wasm.rawdebugrenderpipeline_colors(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * @param {RawRigidBodySet} bodies
     * @param {RawColliderSet} colliders
     * @param {RawImpulseJointSet} impulse_joints
     * @param {RawMultibodyJointSet} multibody_joints
     * @param {RawNarrowPhase} narrow_phase
     * @param {number} filter_flags
     * @param {Function} filter_predicate
     */
    render(bodies, colliders, impulse_joints, multibody_joints, narrow_phase, filter_flags, filter_predicate) {
        try {
            _assertClass(bodies, RawRigidBodySet);
            _assertClass(colliders, RawColliderSet);
            _assertClass(impulse_joints, RawImpulseJointSet);
            _assertClass(multibody_joints, RawMultibodyJointSet);
            _assertClass(narrow_phase, RawNarrowPhase);
            wasm.rawdebugrenderpipeline_render(this.__wbg_ptr, bodies.__wbg_ptr, colliders.__wbg_ptr, impulse_joints.__wbg_ptr, multibody_joints.__wbg_ptr, narrow_phase.__wbg_ptr, filter_flags, addBorrowedObject(filter_predicate));
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
}

const RawDeserializedWorldFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawdeserializedworld_free(ptr >>> 0, 1));

export class RawDeserializedWorld {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawDeserializedWorld.prototype);
        obj.__wbg_ptr = ptr;
        RawDeserializedWorldFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawDeserializedWorldFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawdeserializedworld_free(ptr, 0);
    }
    /**
     * @returns {RawVector | undefined}
     */
    takeGravity() {
        const ret = wasm.rawdeserializedworld_takeGravity(this.__wbg_ptr);
        return ret === 0 ? undefined : RawVector.__wrap(ret);
    }
    /**
     * @returns {RawIntegrationParameters | undefined}
     */
    takeIntegrationParameters() {
        const ret = wasm.rawdeserializedworld_takeIntegrationParameters(this.__wbg_ptr);
        return ret === 0 ? undefined : RawIntegrationParameters.__wrap(ret);
    }
    /**
     * @returns {RawIslandManager | undefined}
     */
    takeIslandManager() {
        const ret = wasm.rawdeserializedworld_takeIslandManager(this.__wbg_ptr);
        return ret === 0 ? undefined : RawIslandManager.__wrap(ret);
    }
    /**
     * @returns {RawBroadPhase | undefined}
     */
    takeBroadPhase() {
        const ret = wasm.rawdeserializedworld_takeBroadPhase(this.__wbg_ptr);
        return ret === 0 ? undefined : RawBroadPhase.__wrap(ret);
    }
    /**
     * @returns {RawNarrowPhase | undefined}
     */
    takeNarrowPhase() {
        const ret = wasm.rawdeserializedworld_takeNarrowPhase(this.__wbg_ptr);
        return ret === 0 ? undefined : RawNarrowPhase.__wrap(ret);
    }
    /**
     * @returns {RawRigidBodySet | undefined}
     */
    takeBodies() {
        const ret = wasm.rawdeserializedworld_takeBodies(this.__wbg_ptr);
        return ret === 0 ? undefined : RawRigidBodySet.__wrap(ret);
    }
    /**
     * @returns {RawColliderSet | undefined}
     */
    takeColliders() {
        const ret = wasm.rawdeserializedworld_takeColliders(this.__wbg_ptr);
        return ret === 0 ? undefined : RawColliderSet.__wrap(ret);
    }
    /**
     * @returns {RawImpulseJointSet | undefined}
     */
    takeImpulseJoints() {
        const ret = wasm.rawdeserializedworld_takeImpulseJoints(this.__wbg_ptr);
        return ret === 0 ? undefined : RawImpulseJointSet.__wrap(ret);
    }
    /**
     * @returns {RawMultibodyJointSet | undefined}
     */
    takeMultibodyJoints() {
        const ret = wasm.rawdeserializedworld_takeMultibodyJoints(this.__wbg_ptr);
        return ret === 0 ? undefined : RawMultibodyJointSet.__wrap(ret);
    }
}

const RawEventQueueFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_raweventqueue_free(ptr >>> 0, 1));
/**
 * A structure responsible for collecting events generated
 * by the physics engine.
 */
export class RawEventQueue {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawEventQueueFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_raweventqueue_free(ptr, 0);
    }
    /**
     * Creates a new event collector.
     *
     * # Parameters
     * - `autoDrain`: setting this to `true` is strongly recommended. If true, the collector will
     * be automatically drained before each `world.step(collector)`. If false, the collector will
     * keep all events in memory unless it is manually drained/cleared; this may lead to unbounded use of
     * RAM if no drain is performed.
     * @param {boolean} autoDrain
     */
    constructor(autoDrain) {
        const ret = wasm.raweventqueue_new(autoDrain);
        this.__wbg_ptr = ret >>> 0;
        RawEventQueueFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Applies the given javascript closure on each collision event of this collector, then clear
     * the internal collision event buffer.
     *
     * # Parameters
     * - `f(handle1, handle2, started)`:  JavaScript closure applied to each collision event. The
     * closure should take three arguments: two integers representing the handles of the colliders
     * involved in the collision, and a boolean indicating if the collision started (true) or stopped
     * (false).
     * @param {Function} f
     */
    drainCollisionEvents(f) {
        try {
            wasm.raweventqueue_drainCollisionEvents(this.__wbg_ptr, addBorrowedObject(f));
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * @param {Function} f
     */
    drainContactForceEvents(f) {
        try {
            wasm.raweventqueue_drainContactForceEvents(this.__wbg_ptr, addBorrowedObject(f));
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * Removes all events contained by this collector.
     */
    clear() {
        wasm.raweventqueue_clear(this.__wbg_ptr);
    }
}

const RawGenericJointFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawgenericjoint_free(ptr >>> 0, 1));

export class RawGenericJoint {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawGenericJoint.prototype);
        obj.__wbg_ptr = ptr;
        RawGenericJointFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawGenericJointFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawgenericjoint_free(ptr, 0);
    }
    /**
     * @param {number} rest_length
     * @param {number} stiffness
     * @param {number} damping
     * @param {RawVector} anchor1
     * @param {RawVector} anchor2
     * @returns {RawGenericJoint}
     */
    static spring(rest_length, stiffness, damping, anchor1, anchor2) {
        _assertClass(anchor1, RawVector);
        _assertClass(anchor2, RawVector);
        const ret = wasm.rawgenericjoint_spring(rest_length, stiffness, damping, anchor1.__wbg_ptr, anchor2.__wbg_ptr);
        return RawGenericJoint.__wrap(ret);
    }
    /**
     * @param {number} length
     * @param {RawVector} anchor1
     * @param {RawVector} anchor2
     * @returns {RawGenericJoint}
     */
    static rope(length, anchor1, anchor2) {
        _assertClass(anchor1, RawVector);
        _assertClass(anchor2, RawVector);
        const ret = wasm.rawgenericjoint_rope(length, anchor1.__wbg_ptr, anchor2.__wbg_ptr);
        return RawGenericJoint.__wrap(ret);
    }
    /**
     * Creates a new joint descriptor that builds a Prismatic joint.
     *
     * A prismatic joint removes all the degrees of freedom between the
     * affected bodies, except for the translation along one axis.
     *
     * Returns `None` if any of the provided axes cannot be normalized.
     * @param {RawVector} anchor1
     * @param {RawVector} anchor2
     * @param {RawVector} axis
     * @param {boolean} limitsEnabled
     * @param {number} limitsMin
     * @param {number} limitsMax
     * @returns {RawGenericJoint | undefined}
     */
    static prismatic(anchor1, anchor2, axis, limitsEnabled, limitsMin, limitsMax) {
        _assertClass(anchor1, RawVector);
        _assertClass(anchor2, RawVector);
        _assertClass(axis, RawVector);
        const ret = wasm.rawgenericjoint_prismatic(anchor1.__wbg_ptr, anchor2.__wbg_ptr, axis.__wbg_ptr, limitsEnabled, limitsMin, limitsMax);
        return ret === 0 ? undefined : RawGenericJoint.__wrap(ret);
    }
    /**
     * Creates a new joint descriptor that builds a Fixed joint.
     *
     * A fixed joint removes all the degrees of freedom between the affected bodies.
     * @param {RawVector} anchor1
     * @param {RawRotation} axes1
     * @param {RawVector} anchor2
     * @param {RawRotation} axes2
     * @returns {RawGenericJoint}
     */
    static fixed(anchor1, axes1, anchor2, axes2) {
        _assertClass(anchor1, RawVector);
        _assertClass(axes1, RawRotation);
        _assertClass(anchor2, RawVector);
        _assertClass(axes2, RawRotation);
        const ret = wasm.rawgenericjoint_fixed(anchor1.__wbg_ptr, axes1.__wbg_ptr, anchor2.__wbg_ptr, axes2.__wbg_ptr);
        return RawGenericJoint.__wrap(ret);
    }
    /**
     * Create a new joint descriptor that builds Revolute joints.
     *
     * A revolute joint removes all degrees of freedom between the affected
     * bodies except for the rotation.
     * @param {RawVector} anchor1
     * @param {RawVector} anchor2
     * @returns {RawGenericJoint | undefined}
     */
    static revolute(anchor1, anchor2) {
        _assertClass(anchor1, RawVector);
        _assertClass(anchor2, RawVector);
        const ret = wasm.rawgenericjoint_revolute(anchor1.__wbg_ptr, anchor2.__wbg_ptr);
        return ret === 0 ? undefined : RawGenericJoint.__wrap(ret);
    }
}

const RawImpulseJointSetFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawimpulsejointset_free(ptr >>> 0, 1));

export class RawImpulseJointSet {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawImpulseJointSet.prototype);
        obj.__wbg_ptr = ptr;
        RawImpulseJointSetFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawImpulseJointSetFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawimpulsejointset_free(ptr, 0);
    }
    /**
     * The type of this joint.
     * @param {number} handle
     * @returns {RawJointType}
     */
    jointType(handle) {
        const ret = wasm.rawimpulsejointset_jointType(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * The unique integer identifier of the first rigid-body this joint it attached to.
     * @param {number} handle
     * @returns {number}
     */
    jointBodyHandle1(handle) {
        const ret = wasm.rawimpulsejointset_jointBodyHandle1(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * The unique integer identifier of the second rigid-body this joint is attached to.
     * @param {number} handle
     * @returns {number}
     */
    jointBodyHandle2(handle) {
        const ret = wasm.rawimpulsejointset_jointBodyHandle2(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * The angular part of the joint’s local frame relative to the first rigid-body it is attached to.
     * @param {number} handle
     * @returns {RawRotation}
     */
    jointFrameX1(handle) {
        const ret = wasm.rawimpulsejointset_jointFrameX1(this.__wbg_ptr, handle);
        return RawRotation.__wrap(ret);
    }
    /**
     * The angular part of the joint’s local frame relative to the second rigid-body it is attached to.
     * @param {number} handle
     * @returns {RawRotation}
     */
    jointFrameX2(handle) {
        const ret = wasm.rawimpulsejointset_jointFrameX2(this.__wbg_ptr, handle);
        return RawRotation.__wrap(ret);
    }
    /**
     * The position of the first anchor of this joint.
     *
     * The first anchor gives the position of the points application point on the
     * local frame of the first rigid-body it is attached to.
     * @param {number} handle
     * @returns {RawVector}
     */
    jointAnchor1(handle) {
        const ret = wasm.rawimpulsejointset_jointAnchor1(this.__wbg_ptr, handle);
        return RawVector.__wrap(ret);
    }
    /**
     * The position of the second anchor of this joint.
     *
     * The second anchor gives the position of the points application point on the
     * local frame of the second rigid-body it is attached to.
     * @param {number} handle
     * @returns {RawVector}
     */
    jointAnchor2(handle) {
        const ret = wasm.rawimpulsejointset_jointAnchor2(this.__wbg_ptr, handle);
        return RawVector.__wrap(ret);
    }
    /**
     * Sets the position of the first local anchor
     * @param {number} handle
     * @param {RawVector} newPos
     */
    jointSetAnchor1(handle, newPos) {
        _assertClass(newPos, RawVector);
        wasm.rawimpulsejointset_jointSetAnchor1(this.__wbg_ptr, handle, newPos.__wbg_ptr);
    }
    /**
     * Sets the position of the second local anchor
     * @param {number} handle
     * @param {RawVector} newPos
     */
    jointSetAnchor2(handle, newPos) {
        _assertClass(newPos, RawVector);
        wasm.rawimpulsejointset_jointSetAnchor2(this.__wbg_ptr, handle, newPos.__wbg_ptr);
    }
    /**
     * Are contacts between the rigid-bodies attached by this joint enabled?
     * @param {number} handle
     * @returns {boolean}
     */
    jointContactsEnabled(handle) {
        const ret = wasm.rawimpulsejointset_jointContactsEnabled(this.__wbg_ptr, handle);
        return ret !== 0;
    }
    /**
     * Sets whether contacts are enabled between the rigid-bodies attached by this joint.
     * @param {number} handle
     * @param {boolean} enabled
     */
    jointSetContactsEnabled(handle, enabled) {
        wasm.rawimpulsejointset_jointSetContactsEnabled(this.__wbg_ptr, handle, enabled);
    }
    /**
     * Are the limits for this joint enabled?
     * @param {number} handle
     * @param {RawJointAxis} axis
     * @returns {boolean}
     */
    jointLimitsEnabled(handle, axis) {
        const ret = wasm.rawimpulsejointset_jointLimitsEnabled(this.__wbg_ptr, handle, axis);
        return ret !== 0;
    }
    /**
     * Return the lower limit along the given joint axis.
     * @param {number} handle
     * @param {RawJointAxis} axis
     * @returns {number}
     */
    jointLimitsMin(handle, axis) {
        const ret = wasm.rawimpulsejointset_jointLimitsMin(this.__wbg_ptr, handle, axis);
        return ret;
    }
    /**
     * If this is a prismatic joint, returns its upper limit.
     * @param {number} handle
     * @param {RawJointAxis} axis
     * @returns {number}
     */
    jointLimitsMax(handle, axis) {
        const ret = wasm.rawimpulsejointset_jointLimitsMax(this.__wbg_ptr, handle, axis);
        return ret;
    }
    /**
     * Enables and sets the joint limits
     * @param {number} handle
     * @param {RawJointAxis} axis
     * @param {number} min
     * @param {number} max
     */
    jointSetLimits(handle, axis, min, max) {
        wasm.rawimpulsejointset_jointSetLimits(this.__wbg_ptr, handle, axis, min, max);
    }
    /**
     * @param {number} handle
     * @param {RawJointAxis} axis
     * @param {RawMotorModel} model
     */
    jointConfigureMotorModel(handle, axis, model) {
        wasm.rawimpulsejointset_jointConfigureMotorModel(this.__wbg_ptr, handle, axis, model);
    }
    /**
     * @param {number} handle
     * @param {RawJointAxis} axis
     * @param {number} targetVel
     * @param {number} factor
     */
    jointConfigureMotorVelocity(handle, axis, targetVel, factor) {
        wasm.rawimpulsejointset_jointConfigureMotorVelocity(this.__wbg_ptr, handle, axis, targetVel, factor);
    }
    /**
     * @param {number} handle
     * @param {RawJointAxis} axis
     * @param {number} targetPos
     * @param {number} stiffness
     * @param {number} damping
     */
    jointConfigureMotorPosition(handle, axis, targetPos, stiffness, damping) {
        wasm.rawimpulsejointset_jointConfigureMotorPosition(this.__wbg_ptr, handle, axis, targetPos, stiffness, damping);
    }
    /**
     * @param {number} handle
     * @param {RawJointAxis} axis
     * @param {number} targetPos
     * @param {number} targetVel
     * @param {number} stiffness
     * @param {number} damping
     */
    jointConfigureMotor(handle, axis, targetPos, targetVel, stiffness, damping) {
        wasm.rawimpulsejointset_jointConfigureMotor(this.__wbg_ptr, handle, axis, targetPos, targetVel, stiffness, damping);
    }
    constructor() {
        const ret = wasm.rawimpulsejointset_new();
        this.__wbg_ptr = ret >>> 0;
        RawImpulseJointSetFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {RawGenericJoint} params
     * @param {number} parent1
     * @param {number} parent2
     * @param {boolean} wake_up
     * @returns {number}
     */
    createJoint(params, parent1, parent2, wake_up) {
        _assertClass(params, RawGenericJoint);
        const ret = wasm.rawimpulsejointset_createJoint(this.__wbg_ptr, params.__wbg_ptr, parent1, parent2, wake_up);
        return ret;
    }
    /**
     * @param {number} handle
     * @param {boolean} wakeUp
     */
    remove(handle, wakeUp) {
        wasm.rawimpulsejointset_remove(this.__wbg_ptr, handle, wakeUp);
    }
    /**
     * @returns {number}
     */
    len() {
        const ret = wasm.rawimpulsejointset_len(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} handle
     * @returns {boolean}
     */
    contains(handle) {
        const ret = wasm.rawimpulsejointset_contains(this.__wbg_ptr, handle);
        return ret !== 0;
    }
    /**
     * Applies the given JavaScript function to the integer handle of each joint managed by this physics world.
     *
     * # Parameters
     * - `f(handle)`: the function to apply to the integer handle of each joint managed by this set. Called as `f(collider)`.
     * @param {Function} f
     */
    forEachJointHandle(f) {
        try {
            wasm.rawimpulsejointset_forEachJointHandle(this.__wbg_ptr, addBorrowedObject(f));
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * Applies the given JavaScript function to the integer handle of each joint attached to the given rigid-body.
     *
     * # Parameters
     * - `f(handle)`: the function to apply to the integer handle of each joint attached to the rigid-body. Called as `f(collider)`.
     * @param {number} body
     * @param {Function} f
     */
    forEachJointAttachedToRigidBody(body, f) {
        try {
            wasm.rawimpulsejointset_forEachJointAttachedToRigidBody(this.__wbg_ptr, body, addBorrowedObject(f));
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
}

const RawIntegrationParametersFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawintegrationparameters_free(ptr >>> 0, 1));

export class RawIntegrationParameters {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawIntegrationParameters.prototype);
        obj.__wbg_ptr = ptr;
        RawIntegrationParametersFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawIntegrationParametersFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawintegrationparameters_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.rawintegrationparameters_new();
        this.__wbg_ptr = ret >>> 0;
        RawIntegrationParametersFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {number}
     */
    get dt() {
        const ret = wasm.rawintegrationparameters_dt(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get contact_erp() {
        const ret = wasm.rawintegrationparameters_contact_erp(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get normalizedAllowedLinearError() {
        const ret = wasm.rawcontactforceevent_max_force_magnitude(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get normalizedPredictionDistance() {
        const ret = wasm.rawintegrationparameters_normalizedPredictionDistance(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get numSolverIterations() {
        const ret = wasm.rawintegrationparameters_numSolverIterations(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get numAdditionalFrictionIterations() {
        const ret = wasm.rawintegrationparameters_numAdditionalFrictionIterations(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get numInternalPgsIterations() {
        const ret = wasm.rawintegrationparameters_numInternalPgsIterations(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get minIslandSize() {
        const ret = wasm.rawintegrationparameters_minIslandSize(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get maxCcdSubsteps() {
        const ret = wasm.rawintegrationparameters_maxCcdSubsteps(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get lengthUnit() {
        const ret = wasm.rawcontactforceevent_total_force_magnitude(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} value
     */
    set dt(value) {
        wasm.rawintegrationparameters_set_dt(this.__wbg_ptr, value);
    }
    /**
     * @param {number} value
     */
    set contact_natural_frequency(value) {
        wasm.rawintegrationparameters_set_contact_natural_frequency(this.__wbg_ptr, value);
    }
    /**
     * @param {number} value
     */
    set normalizedAllowedLinearError(value) {
        wasm.rawintegrationparameters_set_normalizedAllowedLinearError(this.__wbg_ptr, value);
    }
    /**
     * @param {number} value
     */
    set normalizedPredictionDistance(value) {
        wasm.rawintegrationparameters_set_normalizedPredictionDistance(this.__wbg_ptr, value);
    }
    /**
     * @param {number} value
     */
    set numSolverIterations(value) {
        wasm.rawintegrationparameters_set_numSolverIterations(this.__wbg_ptr, value);
    }
    /**
     * @param {number} value
     */
    set numAdditionalFrictionIterations(value) {
        wasm.rawintegrationparameters_set_numAdditionalFrictionIterations(this.__wbg_ptr, value);
    }
    /**
     * @param {number} value
     */
    set numInternalPgsIterations(value) {
        wasm.rawintegrationparameters_set_numInternalPgsIterations(this.__wbg_ptr, value);
    }
    /**
     * @param {number} value
     */
    set minIslandSize(value) {
        wasm.rawintegrationparameters_set_minIslandSize(this.__wbg_ptr, value);
    }
    /**
     * @param {number} value
     */
    set maxCcdSubsteps(value) {
        wasm.rawintegrationparameters_set_maxCcdSubsteps(this.__wbg_ptr, value);
    }
    /**
     * @param {number} value
     */
    set lengthUnit(value) {
        wasm.rawintegrationparameters_set_lengthUnit(this.__wbg_ptr, value);
    }
    switchToStandardPgsSolver() {
        wasm.rawintegrationparameters_switchToStandardPgsSolver(this.__wbg_ptr);
    }
    switchToSmallStepsPgsSolver() {
        wasm.rawintegrationparameters_switchToSmallStepsPgsSolver(this.__wbg_ptr);
    }
    switchToSmallStepsPgsSolverWithoutWarmstart() {
        wasm.rawintegrationparameters_switchToSmallStepsPgsSolverWithoutWarmstart(this.__wbg_ptr);
    }
}

const RawIslandManagerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawislandmanager_free(ptr >>> 0, 1));

export class RawIslandManager {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawIslandManager.prototype);
        obj.__wbg_ptr = ptr;
        RawIslandManagerFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawIslandManagerFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawislandmanager_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.rawislandmanager_new();
        this.__wbg_ptr = ret >>> 0;
        RawIslandManagerFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Applies the given JavaScript function to the integer handle of each active rigid-body
     * managed by this island manager.
     *
     * After a short time of inactivity, a rigid-body is automatically deactivated ("asleep") by
     * the physics engine in order to save computational power. A sleeping rigid-body never moves
     * unless it is moved manually by the user.
     *
     * # Parameters
     * - `f(handle)`: the function to apply to the integer handle of each active rigid-body managed by this
     *   set. Called as `f(collider)`.
     * @param {Function} f
     */
    forEachActiveRigidBodyHandle(f) {
        try {
            wasm.rawislandmanager_forEachActiveRigidBodyHandle(this.__wbg_ptr, addBorrowedObject(f));
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
}

const RawKinematicCharacterControllerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawkinematiccharactercontroller_free(ptr >>> 0, 1));

export class RawKinematicCharacterController {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawKinematicCharacterControllerFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawkinematiccharactercontroller_free(ptr, 0);
    }
    /**
     * @param {number} offset
     */
    constructor(offset) {
        const ret = wasm.rawkinematiccharactercontroller_new(offset);
        this.__wbg_ptr = ret >>> 0;
        RawKinematicCharacterControllerFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {RawVector}
     */
    up() {
        const ret = wasm.rawcollidershapecasthit_normal2(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @param {RawVector} vector
     */
    setUp(vector) {
        _assertClass(vector, RawVector);
        wasm.rawkinematiccharactercontroller_setUp(this.__wbg_ptr, vector.__wbg_ptr);
    }
    /**
     * @returns {number}
     */
    normalNudgeFactor() {
        const ret = wasm.rawkinematiccharactercontroller_normalNudgeFactor(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} value
     */
    setNormalNudgeFactor(value) {
        wasm.rawkinematiccharactercontroller_setNormalNudgeFactor(this.__wbg_ptr, value);
    }
    /**
     * @returns {number}
     */
    offset() {
        const ret = wasm.rawintegrationparameters_dt(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} value
     */
    setOffset(value) {
        wasm.rawkinematiccharactercontroller_setOffset(this.__wbg_ptr, value);
    }
    /**
     * @returns {boolean}
     */
    slideEnabled() {
        const ret = wasm.rawkinematiccharactercontroller_slideEnabled(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {boolean} enabled
     */
    setSlideEnabled(enabled) {
        wasm.rawkinematiccharactercontroller_setSlideEnabled(this.__wbg_ptr, enabled);
    }
    /**
     * @returns {number | undefined}
     */
    autostepMaxHeight() {
        const ret = wasm.rawkinematiccharactercontroller_autostepMaxHeight(this.__wbg_ptr);
        return ret === 0x100000001 ? undefined : ret;
    }
    /**
     * @returns {number | undefined}
     */
    autostepMinWidth() {
        const ret = wasm.rawkinematiccharactercontroller_autostepMinWidth(this.__wbg_ptr);
        return ret === 0x100000001 ? undefined : ret;
    }
    /**
     * @returns {boolean | undefined}
     */
    autostepIncludesDynamicBodies() {
        const ret = wasm.rawkinematiccharactercontroller_autostepIncludesDynamicBodies(this.__wbg_ptr);
        return ret === 0xFFFFFF ? undefined : ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    autostepEnabled() {
        const ret = wasm.rawkinematiccharactercontroller_autostepEnabled(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {number} maxHeight
     * @param {number} minWidth
     * @param {boolean} includeDynamicBodies
     */
    enableAutostep(maxHeight, minWidth, includeDynamicBodies) {
        wasm.rawkinematiccharactercontroller_enableAutostep(this.__wbg_ptr, maxHeight, minWidth, includeDynamicBodies);
    }
    disableAutostep() {
        wasm.rawkinematiccharactercontroller_disableAutostep(this.__wbg_ptr);
    }
    /**
     * @returns {number}
     */
    maxSlopeClimbAngle() {
        const ret = wasm.rawintegrationparameters_normalizedPredictionDistance(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} angle
     */
    setMaxSlopeClimbAngle(angle) {
        wasm.rawintegrationparameters_set_normalizedPredictionDistance(this.__wbg_ptr, angle);
    }
    /**
     * @returns {number}
     */
    minSlopeSlideAngle() {
        const ret = wasm.rawkinematiccharactercontroller_minSlopeSlideAngle(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} angle
     */
    setMinSlopeSlideAngle(angle) {
        wasm.rawkinematiccharactercontroller_setMinSlopeSlideAngle(this.__wbg_ptr, angle);
    }
    /**
     * @returns {number | undefined}
     */
    snapToGroundDistance() {
        const ret = wasm.rawkinematiccharactercontroller_snapToGroundDistance(this.__wbg_ptr);
        return ret === 0x100000001 ? undefined : ret;
    }
    /**
     * @param {number} distance
     */
    enableSnapToGround(distance) {
        wasm.rawkinematiccharactercontroller_enableSnapToGround(this.__wbg_ptr, distance);
    }
    disableSnapToGround() {
        wasm.rawkinematiccharactercontroller_disableSnapToGround(this.__wbg_ptr);
    }
    /**
     * @returns {boolean}
     */
    snapToGroundEnabled() {
        const ret = wasm.rawkinematiccharactercontroller_snapToGroundEnabled(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {number} dt
     * @param {RawRigidBodySet} bodies
     * @param {RawColliderSet} colliders
     * @param {RawQueryPipeline} queries
     * @param {number} collider_handle
     * @param {RawVector} desired_translation_delta
     * @param {boolean} apply_impulses_to_dynamic_bodies
     * @param {number | null | undefined} character_mass
     * @param {number} filter_flags
     * @param {number | null | undefined} filter_groups
     * @param {Function} filter_predicate
     */
    computeColliderMovement(dt, bodies, colliders, queries, collider_handle, desired_translation_delta, apply_impulses_to_dynamic_bodies, character_mass, filter_flags, filter_groups, filter_predicate) {
        try {
            _assertClass(bodies, RawRigidBodySet);
            _assertClass(colliders, RawColliderSet);
            _assertClass(queries, RawQueryPipeline);
            _assertClass(desired_translation_delta, RawVector);
            wasm.rawkinematiccharactercontroller_computeColliderMovement(this.__wbg_ptr, dt, bodies.__wbg_ptr, colliders.__wbg_ptr, queries.__wbg_ptr, collider_handle, desired_translation_delta.__wbg_ptr, apply_impulses_to_dynamic_bodies, isLikeNone(character_mass) ? 0x100000001 : Math.fround(character_mass), filter_flags, isLikeNone(filter_groups) ? 0x100000001 : (filter_groups) >>> 0, addBorrowedObject(filter_predicate));
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * @returns {RawVector}
     */
    computedMovement() {
        const ret = wasm.rawkinematiccharactercontroller_computedMovement(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @returns {boolean}
     */
    computedGrounded() {
        const ret = wasm.rawkinematiccharactercontroller_computedGrounded(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    numComputedCollisions() {
        const ret = wasm.rawkinematiccharactercontroller_numComputedCollisions(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} i
     * @param {RawCharacterCollision} collision
     * @returns {boolean}
     */
    computedCollision(i, collision) {
        _assertClass(collision, RawCharacterCollision);
        const ret = wasm.rawkinematiccharactercontroller_computedCollision(this.__wbg_ptr, i, collision.__wbg_ptr);
        return ret !== 0;
    }
}

const RawMultibodyJointSetFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawmultibodyjointset_free(ptr >>> 0, 1));

export class RawMultibodyJointSet {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawMultibodyJointSet.prototype);
        obj.__wbg_ptr = ptr;
        RawMultibodyJointSetFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawMultibodyJointSetFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawmultibodyjointset_free(ptr, 0);
    }
    /**
     * The type of this joint.
     * @param {number} handle
     * @returns {RawJointType}
     */
    jointType(handle) {
        const ret = wasm.rawmultibodyjointset_jointType(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * The angular part of the joint’s local frame relative to the first rigid-body it is attached to.
     * @param {number} handle
     * @returns {RawRotation}
     */
    jointFrameX1(handle) {
        const ret = wasm.rawmultibodyjointset_jointFrameX1(this.__wbg_ptr, handle);
        return RawRotation.__wrap(ret);
    }
    /**
     * The angular part of the joint’s local frame relative to the second rigid-body it is attached to.
     * @param {number} handle
     * @returns {RawRotation}
     */
    jointFrameX2(handle) {
        const ret = wasm.rawmultibodyjointset_jointFrameX2(this.__wbg_ptr, handle);
        return RawRotation.__wrap(ret);
    }
    /**
     * The position of the first anchor of this joint.
     *
     * The first anchor gives the position of the points application point on the
     * local frame of the first rigid-body it is attached to.
     * @param {number} handle
     * @returns {RawVector}
     */
    jointAnchor1(handle) {
        const ret = wasm.rawmultibodyjointset_jointAnchor1(this.__wbg_ptr, handle);
        return RawVector.__wrap(ret);
    }
    /**
     * The position of the second anchor of this joint.
     *
     * The second anchor gives the position of the points application point on the
     * local frame of the second rigid-body it is attached to.
     * @param {number} handle
     * @returns {RawVector}
     */
    jointAnchor2(handle) {
        const ret = wasm.rawmultibodyjointset_jointAnchor2(this.__wbg_ptr, handle);
        return RawVector.__wrap(ret);
    }
    /**
     * Are contacts between the rigid-bodies attached by this joint enabled?
     * @param {number} handle
     * @returns {boolean}
     */
    jointContactsEnabled(handle) {
        const ret = wasm.rawmultibodyjointset_jointContactsEnabled(this.__wbg_ptr, handle);
        return ret !== 0;
    }
    /**
     * Sets whether contacts are enabled between the rigid-bodies attached by this joint.
     * @param {number} handle
     * @param {boolean} enabled
     */
    jointSetContactsEnabled(handle, enabled) {
        wasm.rawmultibodyjointset_jointSetContactsEnabled(this.__wbg_ptr, handle, enabled);
    }
    /**
     * Are the limits for this joint enabled?
     * @param {number} handle
     * @param {RawJointAxis} axis
     * @returns {boolean}
     */
    jointLimitsEnabled(handle, axis) {
        const ret = wasm.rawmultibodyjointset_jointLimitsEnabled(this.__wbg_ptr, handle, axis);
        return ret !== 0;
    }
    /**
     * Return the lower limit along the given joint axis.
     * @param {number} handle
     * @param {RawJointAxis} axis
     * @returns {number}
     */
    jointLimitsMin(handle, axis) {
        const ret = wasm.rawmultibodyjointset_jointLimitsMin(this.__wbg_ptr, handle, axis);
        return ret;
    }
    /**
     * If this is a prismatic joint, returns its upper limit.
     * @param {number} handle
     * @param {RawJointAxis} axis
     * @returns {number}
     */
    jointLimitsMax(handle, axis) {
        const ret = wasm.rawmultibodyjointset_jointLimitsMax(this.__wbg_ptr, handle, axis);
        return ret;
    }
    constructor() {
        const ret = wasm.rawmultibodyjointset_new();
        this.__wbg_ptr = ret >>> 0;
        RawMultibodyJointSetFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {RawGenericJoint} params
     * @param {number} parent1
     * @param {number} parent2
     * @param {boolean} wakeUp
     * @returns {number}
     */
    createJoint(params, parent1, parent2, wakeUp) {
        _assertClass(params, RawGenericJoint);
        const ret = wasm.rawmultibodyjointset_createJoint(this.__wbg_ptr, params.__wbg_ptr, parent1, parent2, wakeUp);
        return ret;
    }
    /**
     * @param {number} handle
     * @param {boolean} wakeUp
     */
    remove(handle, wakeUp) {
        wasm.rawmultibodyjointset_remove(this.__wbg_ptr, handle, wakeUp);
    }
    /**
     * @param {number} handle
     * @returns {boolean}
     */
    contains(handle) {
        const ret = wasm.rawmultibodyjointset_contains(this.__wbg_ptr, handle);
        return ret !== 0;
    }
    /**
     * Applies the given JavaScript function to the integer handle of each joint managed by this physics world.
     *
     * # Parameters
     * - `f(handle)`: the function to apply to the integer handle of each joint managed by this set. Called as `f(collider)`.
     * @param {Function} f
     */
    forEachJointHandle(f) {
        try {
            wasm.rawmultibodyjointset_forEachJointHandle(this.__wbg_ptr, addBorrowedObject(f));
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * Applies the given JavaScript function to the integer handle of each joint attached to the given rigid-body.
     *
     * # Parameters
     * - `f(handle)`: the function to apply to the integer handle of each joint attached to the rigid-body. Called as `f(collider)`.
     * @param {number} body
     * @param {Function} f
     */
    forEachJointAttachedToRigidBody(body, f) {
        try {
            wasm.rawmultibodyjointset_forEachJointAttachedToRigidBody(this.__wbg_ptr, body, addBorrowedObject(f));
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
}

const RawNarrowPhaseFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawnarrowphase_free(ptr >>> 0, 1));

export class RawNarrowPhase {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawNarrowPhase.prototype);
        obj.__wbg_ptr = ptr;
        RawNarrowPhaseFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawNarrowPhaseFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawnarrowphase_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.rawnarrowphase_new();
        this.__wbg_ptr = ret >>> 0;
        RawNarrowPhaseFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {number} handle1
     * @param {Function} f
     */
    contact_pairs_with(handle1, f) {
        wasm.rawnarrowphase_contact_pairs_with(this.__wbg_ptr, handle1, addHeapObject(f));
    }
    /**
     * @param {number} handle1
     * @param {number} handle2
     * @returns {RawContactPair | undefined}
     */
    contact_pair(handle1, handle2) {
        const ret = wasm.rawnarrowphase_contact_pair(this.__wbg_ptr, handle1, handle2);
        return ret === 0 ? undefined : RawContactPair.__wrap(ret);
    }
    /**
     * @param {number} handle1
     * @param {Function} f
     */
    intersection_pairs_with(handle1, f) {
        wasm.rawnarrowphase_intersection_pairs_with(this.__wbg_ptr, handle1, addHeapObject(f));
    }
    /**
     * @param {number} handle1
     * @param {number} handle2
     * @returns {boolean}
     */
    intersection_pair(handle1, handle2) {
        const ret = wasm.rawnarrowphase_intersection_pair(this.__wbg_ptr, handle1, handle2);
        return ret !== 0;
    }
}

const RawPhysicsPipelineFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawphysicspipeline_free(ptr >>> 0, 1));

export class RawPhysicsPipeline {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawPhysicsPipelineFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawphysicspipeline_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.rawphysicspipeline_new();
        this.__wbg_ptr = ret >>> 0;
        RawPhysicsPipelineFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {RawVector} gravity
     * @param {RawIntegrationParameters} integrationParameters
     * @param {RawIslandManager} islands
     * @param {RawBroadPhase} broadPhase
     * @param {RawNarrowPhase} narrowPhase
     * @param {RawRigidBodySet} bodies
     * @param {RawColliderSet} colliders
     * @param {RawImpulseJointSet} joints
     * @param {RawMultibodyJointSet} articulations
     * @param {RawCCDSolver} ccd_solver
     */
    step(gravity, integrationParameters, islands, broadPhase, narrowPhase, bodies, colliders, joints, articulations, ccd_solver) {
        _assertClass(gravity, RawVector);
        _assertClass(integrationParameters, RawIntegrationParameters);
        _assertClass(islands, RawIslandManager);
        _assertClass(broadPhase, RawBroadPhase);
        _assertClass(narrowPhase, RawNarrowPhase);
        _assertClass(bodies, RawRigidBodySet);
        _assertClass(colliders, RawColliderSet);
        _assertClass(joints, RawImpulseJointSet);
        _assertClass(articulations, RawMultibodyJointSet);
        _assertClass(ccd_solver, RawCCDSolver);
        wasm.rawphysicspipeline_step(this.__wbg_ptr, gravity.__wbg_ptr, integrationParameters.__wbg_ptr, islands.__wbg_ptr, broadPhase.__wbg_ptr, narrowPhase.__wbg_ptr, bodies.__wbg_ptr, colliders.__wbg_ptr, joints.__wbg_ptr, articulations.__wbg_ptr, ccd_solver.__wbg_ptr);
    }
    /**
     * @param {RawVector} gravity
     * @param {RawIntegrationParameters} integrationParameters
     * @param {RawIslandManager} islands
     * @param {RawBroadPhase} broadPhase
     * @param {RawNarrowPhase} narrowPhase
     * @param {RawRigidBodySet} bodies
     * @param {RawColliderSet} colliders
     * @param {RawImpulseJointSet} joints
     * @param {RawMultibodyJointSet} articulations
     * @param {RawCCDSolver} ccd_solver
     * @param {RawEventQueue} eventQueue
     * @param {object} hookObject
     * @param {Function} hookFilterContactPair
     * @param {Function} hookFilterIntersectionPair
     */
    stepWithEvents(gravity, integrationParameters, islands, broadPhase, narrowPhase, bodies, colliders, joints, articulations, ccd_solver, eventQueue, hookObject, hookFilterContactPair, hookFilterIntersectionPair) {
        _assertClass(gravity, RawVector);
        _assertClass(integrationParameters, RawIntegrationParameters);
        _assertClass(islands, RawIslandManager);
        _assertClass(broadPhase, RawBroadPhase);
        _assertClass(narrowPhase, RawNarrowPhase);
        _assertClass(bodies, RawRigidBodySet);
        _assertClass(colliders, RawColliderSet);
        _assertClass(joints, RawImpulseJointSet);
        _assertClass(articulations, RawMultibodyJointSet);
        _assertClass(ccd_solver, RawCCDSolver);
        _assertClass(eventQueue, RawEventQueue);
        wasm.rawphysicspipeline_stepWithEvents(this.__wbg_ptr, gravity.__wbg_ptr, integrationParameters.__wbg_ptr, islands.__wbg_ptr, broadPhase.__wbg_ptr, narrowPhase.__wbg_ptr, bodies.__wbg_ptr, colliders.__wbg_ptr, joints.__wbg_ptr, articulations.__wbg_ptr, ccd_solver.__wbg_ptr, eventQueue.__wbg_ptr, addHeapObject(hookObject), addHeapObject(hookFilterContactPair), addHeapObject(hookFilterIntersectionPair));
    }
}

const RawPidControllerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawpidcontroller_free(ptr >>> 0, 1));

export class RawPidController {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawPidControllerFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawpidcontroller_free(ptr, 0);
    }
    /**
     * @param {number} kp
     * @param {number} ki
     * @param {number} kd
     * @param {number} axes_mask
     */
    constructor(kp, ki, kd, axes_mask) {
        const ret = wasm.rawpidcontroller_new(kp, ki, kd, axes_mask);
        this.__wbg_ptr = ret >>> 0;
        RawPidControllerFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {number} kp
     * @param {number} axes
     */
    set_kp(kp, axes) {
        wasm.rawpidcontroller_set_kp(this.__wbg_ptr, kp, axes);
    }
    /**
     * @param {number} ki
     * @param {number} axes
     */
    set_ki(ki, axes) {
        wasm.rawpidcontroller_set_ki(this.__wbg_ptr, ki, axes);
    }
    /**
     * @param {number} kd
     * @param {number} axes
     */
    set_kd(kd, axes) {
        wasm.rawpidcontroller_set_kd(this.__wbg_ptr, kd, axes);
    }
    /**
     * @param {number} axes_mask
     */
    set_axes_mask(axes_mask) {
        wasm.rawpidcontroller_set_axes_mask(this.__wbg_ptr, axes_mask);
    }
    reset_integrals() {
        wasm.rawpidcontroller_reset_integrals(this.__wbg_ptr);
    }
    /**
     * @param {number} dt
     * @param {RawRigidBodySet} bodies
     * @param {number} rb_handle
     * @param {RawVector} target_translation
     * @param {RawVector} target_linvel
     */
    apply_linear_correction(dt, bodies, rb_handle, target_translation, target_linvel) {
        _assertClass(bodies, RawRigidBodySet);
        _assertClass(target_translation, RawVector);
        _assertClass(target_linvel, RawVector);
        wasm.rawpidcontroller_apply_linear_correction(this.__wbg_ptr, dt, bodies.__wbg_ptr, rb_handle, target_translation.__wbg_ptr, target_linvel.__wbg_ptr);
    }
    /**
     * @param {number} dt
     * @param {RawRigidBodySet} bodies
     * @param {number} rb_handle
     * @param {number} target_rotation
     * @param {number} target_angvel
     */
    apply_angular_correction(dt, bodies, rb_handle, target_rotation, target_angvel) {
        _assertClass(bodies, RawRigidBodySet);
        wasm.rawpidcontroller_apply_angular_correction(this.__wbg_ptr, dt, bodies.__wbg_ptr, rb_handle, target_rotation, target_angvel);
    }
    /**
     * @param {number} dt
     * @param {RawRigidBodySet} bodies
     * @param {number} rb_handle
     * @param {RawVector} target_translation
     * @param {RawVector} target_linvel
     * @returns {RawVector}
     */
    linear_correction(dt, bodies, rb_handle, target_translation, target_linvel) {
        _assertClass(bodies, RawRigidBodySet);
        _assertClass(target_translation, RawVector);
        _assertClass(target_linvel, RawVector);
        const ret = wasm.rawpidcontroller_linear_correction(this.__wbg_ptr, dt, bodies.__wbg_ptr, rb_handle, target_translation.__wbg_ptr, target_linvel.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @param {number} dt
     * @param {RawRigidBodySet} bodies
     * @param {number} rb_handle
     * @param {number} target_rotation
     * @param {number} target_angvel
     * @returns {number}
     */
    angular_correction(dt, bodies, rb_handle, target_rotation, target_angvel) {
        _assertClass(bodies, RawRigidBodySet);
        const ret = wasm.rawpidcontroller_angular_correction(this.__wbg_ptr, dt, bodies.__wbg_ptr, rb_handle, target_rotation, target_angvel);
        return ret;
    }
}

const RawPointColliderProjectionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawpointcolliderprojection_free(ptr >>> 0, 1));

export class RawPointColliderProjection {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawPointColliderProjection.prototype);
        obj.__wbg_ptr = ptr;
        RawPointColliderProjectionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawPointColliderProjectionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawpointcolliderprojection_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    colliderHandle() {
        const ret = wasm.rawpointcolliderprojection_colliderHandle(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {RawVector}
     */
    point() {
        const ret = wasm.rawpointcolliderprojection_point(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @returns {boolean}
     */
    isInside() {
        const ret = wasm.rawpointcolliderprojection_isInside(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {RawFeatureType}
     */
    featureType() {
        const ret = wasm.rawpointcolliderprojection_featureType(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number | undefined}
     */
    featureId() {
        const ret = wasm.rawpointcolliderprojection_featureId(this.__wbg_ptr);
        return ret === 0x100000001 ? undefined : ret;
    }
}

const RawPointProjectionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawpointprojection_free(ptr >>> 0, 1));

export class RawPointProjection {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawPointProjection.prototype);
        obj.__wbg_ptr = ptr;
        RawPointProjectionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawPointProjectionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawpointprojection_free(ptr, 0);
    }
    /**
     * @returns {RawVector}
     */
    point() {
        const ret = wasm.rawpointprojection_point(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @returns {boolean}
     */
    isInside() {
        const ret = wasm.rawpointprojection_isInside(this.__wbg_ptr);
        return ret !== 0;
    }
}

const RawQueryPipelineFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawquerypipeline_free(ptr >>> 0, 1));

export class RawQueryPipeline {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawQueryPipelineFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawquerypipeline_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.rawquerypipeline_new();
        this.__wbg_ptr = ret >>> 0;
        RawQueryPipelineFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {RawColliderSet} colliders
     */
    update(colliders) {
        _assertClass(colliders, RawColliderSet);
        wasm.rawquerypipeline_update(this.__wbg_ptr, colliders.__wbg_ptr);
    }
    /**
     * @param {RawRigidBodySet} bodies
     * @param {RawColliderSet} colliders
     * @param {RawVector} rayOrig
     * @param {RawVector} rayDir
     * @param {number} maxToi
     * @param {boolean} solid
     * @param {number} filter_flags
     * @param {number | null | undefined} filter_groups
     * @param {number | null | undefined} filter_exclude_collider
     * @param {number | null | undefined} filter_exclude_rigid_body
     * @param {Function} filter_predicate
     * @returns {RawRayColliderHit | undefined}
     */
    castRay(bodies, colliders, rayOrig, rayDir, maxToi, solid, filter_flags, filter_groups, filter_exclude_collider, filter_exclude_rigid_body, filter_predicate) {
        try {
            _assertClass(bodies, RawRigidBodySet);
            _assertClass(colliders, RawColliderSet);
            _assertClass(rayOrig, RawVector);
            _assertClass(rayDir, RawVector);
            const ret = wasm.rawquerypipeline_castRay(this.__wbg_ptr, bodies.__wbg_ptr, colliders.__wbg_ptr, rayOrig.__wbg_ptr, rayDir.__wbg_ptr, maxToi, solid, filter_flags, isLikeNone(filter_groups) ? 0x100000001 : (filter_groups) >>> 0, !isLikeNone(filter_exclude_collider), isLikeNone(filter_exclude_collider) ? 0 : filter_exclude_collider, !isLikeNone(filter_exclude_rigid_body), isLikeNone(filter_exclude_rigid_body) ? 0 : filter_exclude_rigid_body, addBorrowedObject(filter_predicate));
            return ret === 0 ? undefined : RawRayColliderHit.__wrap(ret);
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * @param {RawRigidBodySet} bodies
     * @param {RawColliderSet} colliders
     * @param {RawVector} rayOrig
     * @param {RawVector} rayDir
     * @param {number} maxToi
     * @param {boolean} solid
     * @param {number} filter_flags
     * @param {number | null | undefined} filter_groups
     * @param {number | null | undefined} filter_exclude_collider
     * @param {number | null | undefined} filter_exclude_rigid_body
     * @param {Function} filter_predicate
     * @returns {RawRayColliderIntersection | undefined}
     */
    castRayAndGetNormal(bodies, colliders, rayOrig, rayDir, maxToi, solid, filter_flags, filter_groups, filter_exclude_collider, filter_exclude_rigid_body, filter_predicate) {
        try {
            _assertClass(bodies, RawRigidBodySet);
            _assertClass(colliders, RawColliderSet);
            _assertClass(rayOrig, RawVector);
            _assertClass(rayDir, RawVector);
            const ret = wasm.rawquerypipeline_castRayAndGetNormal(this.__wbg_ptr, bodies.__wbg_ptr, colliders.__wbg_ptr, rayOrig.__wbg_ptr, rayDir.__wbg_ptr, maxToi, solid, filter_flags, isLikeNone(filter_groups) ? 0x100000001 : (filter_groups) >>> 0, !isLikeNone(filter_exclude_collider), isLikeNone(filter_exclude_collider) ? 0 : filter_exclude_collider, !isLikeNone(filter_exclude_rigid_body), isLikeNone(filter_exclude_rigid_body) ? 0 : filter_exclude_rigid_body, addBorrowedObject(filter_predicate));
            return ret === 0 ? undefined : RawRayColliderIntersection.__wrap(ret);
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * @param {RawRigidBodySet} bodies
     * @param {RawColliderSet} colliders
     * @param {RawVector} rayOrig
     * @param {RawVector} rayDir
     * @param {number} maxToi
     * @param {boolean} solid
     * @param {Function} callback
     * @param {number} filter_flags
     * @param {number | null | undefined} filter_groups
     * @param {number | null | undefined} filter_exclude_collider
     * @param {number | null | undefined} filter_exclude_rigid_body
     * @param {Function} filter_predicate
     */
    intersectionsWithRay(bodies, colliders, rayOrig, rayDir, maxToi, solid, callback, filter_flags, filter_groups, filter_exclude_collider, filter_exclude_rigid_body, filter_predicate) {
        try {
            _assertClass(bodies, RawRigidBodySet);
            _assertClass(colliders, RawColliderSet);
            _assertClass(rayOrig, RawVector);
            _assertClass(rayDir, RawVector);
            wasm.rawquerypipeline_intersectionsWithRay(this.__wbg_ptr, bodies.__wbg_ptr, colliders.__wbg_ptr, rayOrig.__wbg_ptr, rayDir.__wbg_ptr, maxToi, solid, addBorrowedObject(callback), filter_flags, isLikeNone(filter_groups) ? 0x100000001 : (filter_groups) >>> 0, !isLikeNone(filter_exclude_collider), isLikeNone(filter_exclude_collider) ? 0 : filter_exclude_collider, !isLikeNone(filter_exclude_rigid_body), isLikeNone(filter_exclude_rigid_body) ? 0 : filter_exclude_rigid_body, addBorrowedObject(filter_predicate));
        } finally {
            heap[stack_pointer++] = undefined;
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * @param {RawRigidBodySet} bodies
     * @param {RawColliderSet} colliders
     * @param {RawVector} shapePos
     * @param {RawRotation} shapeRot
     * @param {RawShape} shape
     * @param {number} filter_flags
     * @param {number | null | undefined} filter_groups
     * @param {number | null | undefined} filter_exclude_collider
     * @param {number | null | undefined} filter_exclude_rigid_body
     * @param {Function} filter_predicate
     * @returns {number | undefined}
     */
    intersectionWithShape(bodies, colliders, shapePos, shapeRot, shape, filter_flags, filter_groups, filter_exclude_collider, filter_exclude_rigid_body, filter_predicate) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(bodies, RawRigidBodySet);
            _assertClass(colliders, RawColliderSet);
            _assertClass(shapePos, RawVector);
            _assertClass(shapeRot, RawRotation);
            _assertClass(shape, RawShape);
            wasm.rawquerypipeline_intersectionWithShape(retptr, this.__wbg_ptr, bodies.__wbg_ptr, colliders.__wbg_ptr, shapePos.__wbg_ptr, shapeRot.__wbg_ptr, shape.__wbg_ptr, filter_flags, isLikeNone(filter_groups) ? 0x100000001 : (filter_groups) >>> 0, !isLikeNone(filter_exclude_collider), isLikeNone(filter_exclude_collider) ? 0 : filter_exclude_collider, !isLikeNone(filter_exclude_rigid_body), isLikeNone(filter_exclude_rigid_body) ? 0 : filter_exclude_rigid_body, addBorrowedObject(filter_predicate));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r2 = getDataViewMemory0().getFloat64(retptr + 8 * 1, true);
            return r0 === 0 ? undefined : r2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * @param {RawRigidBodySet} bodies
     * @param {RawColliderSet} colliders
     * @param {RawVector} point
     * @param {boolean} solid
     * @param {number} filter_flags
     * @param {number | null | undefined} filter_groups
     * @param {number | null | undefined} filter_exclude_collider
     * @param {number | null | undefined} filter_exclude_rigid_body
     * @param {Function} filter_predicate
     * @returns {RawPointColliderProjection | undefined}
     */
    projectPoint(bodies, colliders, point, solid, filter_flags, filter_groups, filter_exclude_collider, filter_exclude_rigid_body, filter_predicate) {
        try {
            _assertClass(bodies, RawRigidBodySet);
            _assertClass(colliders, RawColliderSet);
            _assertClass(point, RawVector);
            const ret = wasm.rawquerypipeline_projectPoint(this.__wbg_ptr, bodies.__wbg_ptr, colliders.__wbg_ptr, point.__wbg_ptr, solid, filter_flags, isLikeNone(filter_groups) ? 0x100000001 : (filter_groups) >>> 0, !isLikeNone(filter_exclude_collider), isLikeNone(filter_exclude_collider) ? 0 : filter_exclude_collider, !isLikeNone(filter_exclude_rigid_body), isLikeNone(filter_exclude_rigid_body) ? 0 : filter_exclude_rigid_body, addBorrowedObject(filter_predicate));
            return ret === 0 ? undefined : RawPointColliderProjection.__wrap(ret);
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * @param {RawRigidBodySet} bodies
     * @param {RawColliderSet} colliders
     * @param {RawVector} point
     * @param {number} filter_flags
     * @param {number | null | undefined} filter_groups
     * @param {number | null | undefined} filter_exclude_collider
     * @param {number | null | undefined} filter_exclude_rigid_body
     * @param {Function} filter_predicate
     * @returns {RawPointColliderProjection | undefined}
     */
    projectPointAndGetFeature(bodies, colliders, point, filter_flags, filter_groups, filter_exclude_collider, filter_exclude_rigid_body, filter_predicate) {
        try {
            _assertClass(bodies, RawRigidBodySet);
            _assertClass(colliders, RawColliderSet);
            _assertClass(point, RawVector);
            const ret = wasm.rawquerypipeline_projectPointAndGetFeature(this.__wbg_ptr, bodies.__wbg_ptr, colliders.__wbg_ptr, point.__wbg_ptr, filter_flags, isLikeNone(filter_groups) ? 0x100000001 : (filter_groups) >>> 0, !isLikeNone(filter_exclude_collider), isLikeNone(filter_exclude_collider) ? 0 : filter_exclude_collider, !isLikeNone(filter_exclude_rigid_body), isLikeNone(filter_exclude_rigid_body) ? 0 : filter_exclude_rigid_body, addBorrowedObject(filter_predicate));
            return ret === 0 ? undefined : RawPointColliderProjection.__wrap(ret);
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * @param {RawRigidBodySet} bodies
     * @param {RawColliderSet} colliders
     * @param {RawVector} point
     * @param {Function} callback
     * @param {number} filter_flags
     * @param {number | null | undefined} filter_groups
     * @param {number | null | undefined} filter_exclude_collider
     * @param {number | null | undefined} filter_exclude_rigid_body
     * @param {Function} filter_predicate
     */
    intersectionsWithPoint(bodies, colliders, point, callback, filter_flags, filter_groups, filter_exclude_collider, filter_exclude_rigid_body, filter_predicate) {
        try {
            _assertClass(bodies, RawRigidBodySet);
            _assertClass(colliders, RawColliderSet);
            _assertClass(point, RawVector);
            wasm.rawquerypipeline_intersectionsWithPoint(this.__wbg_ptr, bodies.__wbg_ptr, colliders.__wbg_ptr, point.__wbg_ptr, addBorrowedObject(callback), filter_flags, isLikeNone(filter_groups) ? 0x100000001 : (filter_groups) >>> 0, !isLikeNone(filter_exclude_collider), isLikeNone(filter_exclude_collider) ? 0 : filter_exclude_collider, !isLikeNone(filter_exclude_rigid_body), isLikeNone(filter_exclude_rigid_body) ? 0 : filter_exclude_rigid_body, addBorrowedObject(filter_predicate));
        } finally {
            heap[stack_pointer++] = undefined;
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * @param {RawRigidBodySet} bodies
     * @param {RawColliderSet} colliders
     * @param {RawVector} shapePos
     * @param {RawRotation} shapeRot
     * @param {RawVector} shapeVel
     * @param {RawShape} shape
     * @param {number} target_distance
     * @param {number} maxToi
     * @param {boolean} stop_at_penetration
     * @param {number} filter_flags
     * @param {number | null | undefined} filter_groups
     * @param {number | null | undefined} filter_exclude_collider
     * @param {number | null | undefined} filter_exclude_rigid_body
     * @param {Function} filter_predicate
     * @returns {RawColliderShapeCastHit | undefined}
     */
    castShape(bodies, colliders, shapePos, shapeRot, shapeVel, shape, target_distance, maxToi, stop_at_penetration, filter_flags, filter_groups, filter_exclude_collider, filter_exclude_rigid_body, filter_predicate) {
        try {
            _assertClass(bodies, RawRigidBodySet);
            _assertClass(colliders, RawColliderSet);
            _assertClass(shapePos, RawVector);
            _assertClass(shapeRot, RawRotation);
            _assertClass(shapeVel, RawVector);
            _assertClass(shape, RawShape);
            const ret = wasm.rawquerypipeline_castShape(this.__wbg_ptr, bodies.__wbg_ptr, colliders.__wbg_ptr, shapePos.__wbg_ptr, shapeRot.__wbg_ptr, shapeVel.__wbg_ptr, shape.__wbg_ptr, target_distance, maxToi, stop_at_penetration, filter_flags, isLikeNone(filter_groups) ? 0x100000001 : (filter_groups) >>> 0, !isLikeNone(filter_exclude_collider), isLikeNone(filter_exclude_collider) ? 0 : filter_exclude_collider, !isLikeNone(filter_exclude_rigid_body), isLikeNone(filter_exclude_rigid_body) ? 0 : filter_exclude_rigid_body, addBorrowedObject(filter_predicate));
            return ret === 0 ? undefined : RawColliderShapeCastHit.__wrap(ret);
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * @param {RawRigidBodySet} bodies
     * @param {RawColliderSet} colliders
     * @param {RawVector} shapePos
     * @param {RawRotation} shapeRot
     * @param {RawShape} shape
     * @param {Function} callback
     * @param {number} filter_flags
     * @param {number | null | undefined} filter_groups
     * @param {number | null | undefined} filter_exclude_collider
     * @param {number | null | undefined} filter_exclude_rigid_body
     * @param {Function} filter_predicate
     */
    intersectionsWithShape(bodies, colliders, shapePos, shapeRot, shape, callback, filter_flags, filter_groups, filter_exclude_collider, filter_exclude_rigid_body, filter_predicate) {
        try {
            _assertClass(bodies, RawRigidBodySet);
            _assertClass(colliders, RawColliderSet);
            _assertClass(shapePos, RawVector);
            _assertClass(shapeRot, RawRotation);
            _assertClass(shape, RawShape);
            wasm.rawquerypipeline_intersectionsWithShape(this.__wbg_ptr, bodies.__wbg_ptr, colliders.__wbg_ptr, shapePos.__wbg_ptr, shapeRot.__wbg_ptr, shape.__wbg_ptr, addBorrowedObject(callback), filter_flags, isLikeNone(filter_groups) ? 0x100000001 : (filter_groups) >>> 0, !isLikeNone(filter_exclude_collider), isLikeNone(filter_exclude_collider) ? 0 : filter_exclude_collider, !isLikeNone(filter_exclude_rigid_body), isLikeNone(filter_exclude_rigid_body) ? 0 : filter_exclude_rigid_body, addBorrowedObject(filter_predicate));
        } finally {
            heap[stack_pointer++] = undefined;
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * @param {RawVector} aabbCenter
     * @param {RawVector} aabbHalfExtents
     * @param {Function} callback
     */
    collidersWithAabbIntersectingAabb(aabbCenter, aabbHalfExtents, callback) {
        try {
            _assertClass(aabbCenter, RawVector);
            _assertClass(aabbHalfExtents, RawVector);
            wasm.rawquerypipeline_collidersWithAabbIntersectingAabb(this.__wbg_ptr, aabbCenter.__wbg_ptr, aabbHalfExtents.__wbg_ptr, addBorrowedObject(callback));
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
}

const RawRayColliderHitFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawraycolliderhit_free(ptr >>> 0, 1));

export class RawRayColliderHit {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawRayColliderHit.prototype);
        obj.__wbg_ptr = ptr;
        RawRayColliderHitFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawRayColliderHitFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawraycolliderhit_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    colliderHandle() {
        const ret = wasm.rawcollidershapecasthit_colliderHandle(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    timeOfImpact() {
        const ret = wasm.rawcollidershapecasthit_time_of_impact(this.__wbg_ptr);
        return ret;
    }
}

const RawRayColliderIntersectionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawraycolliderintersection_free(ptr >>> 0, 1));

export class RawRayColliderIntersection {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawRayColliderIntersection.prototype);
        obj.__wbg_ptr = ptr;
        RawRayColliderIntersectionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawRayColliderIntersectionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawraycolliderintersection_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    colliderHandle() {
        const ret = wasm.rawpointcolliderprojection_colliderHandle(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {RawVector}
     */
    normal() {
        const ret = wasm.rawcollidershapecasthit_witness1(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @returns {number}
     */
    time_of_impact() {
        const ret = wasm.rawcollidershapecasthit_time_of_impact(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {RawFeatureType}
     */
    featureType() {
        const ret = wasm.rawpointcolliderprojection_featureType(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number | undefined}
     */
    featureId() {
        const ret = wasm.rawpointcolliderprojection_featureId(this.__wbg_ptr);
        return ret === 0x100000001 ? undefined : ret;
    }
}

const RawRayIntersectionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawrayintersection_free(ptr >>> 0, 1));

export class RawRayIntersection {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawRayIntersection.prototype);
        obj.__wbg_ptr = ptr;
        RawRayIntersectionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawRayIntersectionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawrayintersection_free(ptr, 0);
    }
    /**
     * @returns {RawVector}
     */
    normal() {
        const ret = wasm.rawcollidershapecasthit_witness1(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @returns {number}
     */
    time_of_impact() {
        const ret = wasm.rawcollidershapecasthit_time_of_impact(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {RawFeatureType}
     */
    featureType() {
        const ret = wasm.rawpointcolliderprojection_featureType(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number | undefined}
     */
    featureId() {
        const ret = wasm.rawpointcolliderprojection_featureId(this.__wbg_ptr);
        return ret === 0x100000001 ? undefined : ret;
    }
}

const RawRigidBodySetFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawrigidbodyset_free(ptr >>> 0, 1));

export class RawRigidBodySet {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawRigidBodySet.prototype);
        obj.__wbg_ptr = ptr;
        RawRigidBodySetFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawRigidBodySetFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawrigidbodyset_free(ptr, 0);
    }
    /**
     * The world-space translation of this rigid-body.
     * @param {number} handle
     * @returns {RawVector}
     */
    rbTranslation(handle) {
        const ret = wasm.rawrigidbodyset_rbTranslation(this.__wbg_ptr, handle);
        return RawVector.__wrap(ret);
    }
    /**
     * The world-space orientation of this rigid-body.
     * @param {number} handle
     * @returns {RawRotation}
     */
    rbRotation(handle) {
        const ret = wasm.rawrigidbodyset_rbRotation(this.__wbg_ptr, handle);
        return RawRotation.__wrap(ret);
    }
    /**
     * Put the given rigid-body to sleep.
     * @param {number} handle
     */
    rbSleep(handle) {
        wasm.rawrigidbodyset_rbSleep(this.__wbg_ptr, handle);
    }
    /**
     * Is this rigid-body sleeping?
     * @param {number} handle
     * @returns {boolean}
     */
    rbIsSleeping(handle) {
        const ret = wasm.rawrigidbodyset_rbIsSleeping(this.__wbg_ptr, handle);
        return ret !== 0;
    }
    /**
     * Is the velocity of this rigid-body not zero?
     * @param {number} handle
     * @returns {boolean}
     */
    rbIsMoving(handle) {
        const ret = wasm.rawrigidbodyset_rbIsMoving(this.__wbg_ptr, handle);
        return ret !== 0;
    }
    /**
     * The world-space predicted translation of this rigid-body.
     *
     * If this rigid-body is kinematic this value is set by the `setNextKinematicTranslation`
     * method and is used for estimating the kinematic body velocity at the next timestep.
     * For non-kinematic bodies, this value is currently unspecified.
     * @param {number} handle
     * @returns {RawVector}
     */
    rbNextTranslation(handle) {
        const ret = wasm.rawrigidbodyset_rbNextTranslation(this.__wbg_ptr, handle);
        return RawVector.__wrap(ret);
    }
    /**
     * The world-space predicted orientation of this rigid-body.
     *
     * If this rigid-body is kinematic this value is set by the `setNextKinematicRotation`
     * method and is used for estimating the kinematic body velocity at the next timestep.
     * For non-kinematic bodies, this value is currently unspecified.
     * @param {number} handle
     * @returns {RawRotation}
     */
    rbNextRotation(handle) {
        const ret = wasm.rawrigidbodyset_rbNextRotation(this.__wbg_ptr, handle);
        return RawRotation.__wrap(ret);
    }
    /**
     * Sets the translation of this rigid-body.
     *
     * # Parameters
     * - `x`: the world-space position of the rigid-body along the `x` axis.
     * - `y`: the world-space position of the rigid-body along the `y` axis.
     * - `wakeUp`: forces the rigid-body to wake-up so it is properly affected by forces if it
     * wasn't moving before modifying its position.
     * @param {number} handle
     * @param {number} x
     * @param {number} y
     * @param {boolean} wakeUp
     */
    rbSetTranslation(handle, x, y, wakeUp) {
        wasm.rawrigidbodyset_rbSetTranslation(this.__wbg_ptr, handle, x, y, wakeUp);
    }
    /**
     * Sets the rotation angle of this rigid-body.
     *
     * # Parameters
     * - `angle`: the rotation angle, in radians.
     * - `wakeUp`: forces the rigid-body to wake-up so it is properly affected by forces if it
     * wasn't moving before modifying its position.
     * @param {number} handle
     * @param {number} angle
     * @param {boolean} wakeUp
     */
    rbSetRotation(handle, angle, wakeUp) {
        wasm.rawrigidbodyset_rbSetRotation(this.__wbg_ptr, handle, angle, wakeUp);
    }
    /**
     * Sets the linear velocity of this rigid-body.
     * @param {number} handle
     * @param {RawVector} linvel
     * @param {boolean} wakeUp
     */
    rbSetLinvel(handle, linvel, wakeUp) {
        _assertClass(linvel, RawVector);
        wasm.rawrigidbodyset_rbSetLinvel(this.__wbg_ptr, handle, linvel.__wbg_ptr, wakeUp);
    }
    /**
     * Sets the angular velocity of this rigid-body.
     * @param {number} handle
     * @param {number} angvel
     * @param {boolean} wakeUp
     */
    rbSetAngvel(handle, angvel, wakeUp) {
        wasm.rawrigidbodyset_rbSetAngvel(this.__wbg_ptr, handle, angvel, wakeUp);
    }
    /**
     * If this rigid body is kinematic, sets its future translation after the next timestep integration.
     *
     * This should be used instead of `rigidBody.setTranslation` to make the dynamic object
     * interacting with this kinematic body behave as expected. Internally, Rapier will compute
     * an artificial velocity for this rigid-body from its current position and its next kinematic
     * position. This velocity will be used to compute forces on dynamic bodies interacting with
     * this body.
     *
     * # Parameters
     * - `x`: the world-space position of the rigid-body along the `x` axis.
     * - `y`: the world-space position of the rigid-body along the `y` axis.
     * @param {number} handle
     * @param {number} x
     * @param {number} y
     */
    rbSetNextKinematicTranslation(handle, x, y) {
        wasm.rawrigidbodyset_rbSetNextKinematicTranslation(this.__wbg_ptr, handle, x, y);
    }
    /**
     * If this rigid body is kinematic, sets its future rotation after the next timestep integration.
     *
     * This should be used instead of `rigidBody.setRotation` to make the dynamic object
     * interacting with this kinematic body behave as expected. Internally, Rapier will compute
     * an artificial velocity for this rigid-body from its current position and its next kinematic
     * position. This velocity will be used to compute forces on dynamic bodies interacting with
     * this body.
     *
     * # Parameters
     * - `angle`: the rotation angle, in radians.
     * @param {number} handle
     * @param {number} angle
     */
    rbSetNextKinematicRotation(handle, angle) {
        wasm.rawrigidbodyset_rbSetNextKinematicRotation(this.__wbg_ptr, handle, angle);
    }
    /**
     * @param {number} handle
     * @param {RawColliderSet} colliders
     */
    rbRecomputeMassPropertiesFromColliders(handle, colliders) {
        _assertClass(colliders, RawColliderSet);
        wasm.rawrigidbodyset_rbRecomputeMassPropertiesFromColliders(this.__wbg_ptr, handle, colliders.__wbg_ptr);
    }
    /**
     * @param {number} handle
     * @param {number} mass
     * @param {boolean} wake_up
     */
    rbSetAdditionalMass(handle, mass, wake_up) {
        wasm.rawrigidbodyset_rbSetAdditionalMass(this.__wbg_ptr, handle, mass, wake_up);
    }
    /**
     * @param {number} handle
     * @param {number} mass
     * @param {RawVector} centerOfMass
     * @param {number} principalAngularInertia
     * @param {boolean} wake_up
     */
    rbSetAdditionalMassProperties(handle, mass, centerOfMass, principalAngularInertia, wake_up) {
        _assertClass(centerOfMass, RawVector);
        wasm.rawrigidbodyset_rbSetAdditionalMassProperties(this.__wbg_ptr, handle, mass, centerOfMass.__wbg_ptr, principalAngularInertia, wake_up);
    }
    /**
     * The linear velocity of this rigid-body.
     * @param {number} handle
     * @returns {RawVector}
     */
    rbLinvel(handle) {
        const ret = wasm.rawrigidbodyset_rbLinvel(this.__wbg_ptr, handle);
        return RawVector.__wrap(ret);
    }
    /**
     * The angular velocity of this rigid-body.
     * @param {number} handle
     * @returns {number}
     */
    rbAngvel(handle) {
        const ret = wasm.rawrigidbodyset_rbAngvel(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * The velocity of the given world-space point on this rigid-body.
     * @param {number} handle
     * @param {RawVector} point
     * @returns {RawVector}
     */
    rbVelocityAtPoint(handle, point) {
        _assertClass(point, RawVector);
        const ret = wasm.rawrigidbodyset_rbVelocityAtPoint(this.__wbg_ptr, handle, point.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @param {number} handle
     * @param {boolean} locked
     * @param {boolean} wake_up
     */
    rbLockTranslations(handle, locked, wake_up) {
        wasm.rawrigidbodyset_rbLockTranslations(this.__wbg_ptr, handle, locked, wake_up);
    }
    /**
     * @param {number} handle
     * @param {boolean} allow_x
     * @param {boolean} allow_y
     * @param {boolean} wake_up
     */
    rbSetEnabledTranslations(handle, allow_x, allow_y, wake_up) {
        wasm.rawrigidbodyset_rbSetEnabledTranslations(this.__wbg_ptr, handle, allow_x, allow_y, wake_up);
    }
    /**
     * @param {number} handle
     * @param {boolean} locked
     * @param {boolean} wake_up
     */
    rbLockRotations(handle, locked, wake_up) {
        wasm.rawrigidbodyset_rbLockRotations(this.__wbg_ptr, handle, locked, wake_up);
    }
    /**
     * @param {number} handle
     * @returns {number}
     */
    rbDominanceGroup(handle) {
        const ret = wasm.rawrigidbodyset_rbDominanceGroup(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * @param {number} handle
     * @param {number} group
     */
    rbSetDominanceGroup(handle, group) {
        wasm.rawrigidbodyset_rbSetDominanceGroup(this.__wbg_ptr, handle, group);
    }
    /**
     * @param {number} handle
     * @param {boolean} enabled
     */
    rbEnableCcd(handle, enabled) {
        wasm.rawrigidbodyset_rbEnableCcd(this.__wbg_ptr, handle, enabled);
    }
    /**
     * @param {number} handle
     * @param {number} prediction
     */
    rbSetSoftCcdPrediction(handle, prediction) {
        wasm.rawrigidbodyset_rbSetSoftCcdPrediction(this.__wbg_ptr, handle, prediction);
    }
    /**
     * The mass of this rigid-body.
     * @param {number} handle
     * @returns {number}
     */
    rbMass(handle) {
        const ret = wasm.rawrigidbodyset_rbMass(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * The inverse of the mass of a rigid-body.
     *
     * If this is zero, the rigid-body is assumed to have infinite mass.
     * @param {number} handle
     * @returns {number}
     */
    rbInvMass(handle) {
        const ret = wasm.rawrigidbodyset_rbInvMass(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * The inverse mass taking into account translation locking.
     * @param {number} handle
     * @returns {RawVector}
     */
    rbEffectiveInvMass(handle) {
        const ret = wasm.rawrigidbodyset_rbEffectiveInvMass(this.__wbg_ptr, handle);
        return RawVector.__wrap(ret);
    }
    /**
     * The center of mass of a rigid-body expressed in its local-space.
     * @param {number} handle
     * @returns {RawVector}
     */
    rbLocalCom(handle) {
        const ret = wasm.rawrigidbodyset_rbLocalCom(this.__wbg_ptr, handle);
        return RawVector.__wrap(ret);
    }
    /**
     * The world-space center of mass of the rigid-body.
     * @param {number} handle
     * @returns {RawVector}
     */
    rbWorldCom(handle) {
        const ret = wasm.rawrigidbodyset_rbWorldCom(this.__wbg_ptr, handle);
        return RawVector.__wrap(ret);
    }
    /**
     * The inverse of the principal angular inertia of the rigid-body.
     *
     * Components set to zero are assumed to be infinite along the corresponding principal axis.
     * @param {number} handle
     * @returns {number}
     */
    rbInvPrincipalInertiaSqrt(handle) {
        const ret = wasm.rawrigidbodyset_rbInvPrincipalInertiaSqrt(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * The angular inertia along the principal inertia axes of the rigid-body.
     * @param {number} handle
     * @returns {number}
     */
    rbPrincipalInertia(handle) {
        const ret = wasm.rawrigidbodyset_rbPrincipalInertia(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * The square-root of the world-space inverse angular inertia tensor of the rigid-body,
     * taking into account rotation locking.
     * @param {number} handle
     * @returns {number}
     */
    rbEffectiveWorldInvInertiaSqrt(handle) {
        const ret = wasm.rawrigidbodyset_rbEffectiveWorldInvInertiaSqrt(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * The effective world-space angular inertia (that takes the potential rotation locking into account) of
     * this rigid-body.
     * @param {number} handle
     * @returns {number}
     */
    rbEffectiveAngularInertia(handle) {
        const ret = wasm.rawrigidbodyset_rbEffectiveAngularInertia(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * Wakes this rigid-body up.
     *
     * A dynamic rigid-body that does not move during several consecutive frames will
     * be put to sleep by the physics engine, i.e., it will stop being simulated in order
     * to avoid useless computations.
     * This method forces a sleeping rigid-body to wake-up. This is useful, e.g., before modifying
     * the position of a dynamic body so that it is properly simulated afterwards.
     * @param {number} handle
     */
    rbWakeUp(handle) {
        wasm.rawrigidbodyset_rbWakeUp(this.__wbg_ptr, handle);
    }
    /**
     * Is Continuous Collision Detection enabled for this rigid-body?
     * @param {number} handle
     * @returns {boolean}
     */
    rbIsCcdEnabled(handle) {
        const ret = wasm.rawrigidbodyset_rbIsCcdEnabled(this.__wbg_ptr, handle);
        return ret !== 0;
    }
    /**
     * @param {number} handle
     * @returns {number}
     */
    rbSoftCcdPrediction(handle) {
        const ret = wasm.rawrigidbodyset_rbSoftCcdPrediction(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * The number of colliders attached to this rigid-body.
     * @param {number} handle
     * @returns {number}
     */
    rbNumColliders(handle) {
        const ret = wasm.rawrigidbodyset_rbNumColliders(this.__wbg_ptr, handle);
        return ret >>> 0;
    }
    /**
     * Retrieves the `i-th` collider attached to this rigid-body.
     *
     * # Parameters
     * - `at`: The index of the collider to retrieve. Must be a number in `[0, this.numColliders()[`.
     *         This index is **not** the same as the unique identifier of the collider.
     * @param {number} handle
     * @param {number} at
     * @returns {number}
     */
    rbCollider(handle, at) {
        const ret = wasm.rawrigidbodyset_rbCollider(this.__wbg_ptr, handle, at);
        return ret;
    }
    /**
     * The status of this rigid-body: fixed, dynamic, or kinematic.
     * @param {number} handle
     * @returns {RawRigidBodyType}
     */
    rbBodyType(handle) {
        const ret = wasm.rawrigidbodyset_rbBodyType(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * Set a new status for this rigid-body: fixed, dynamic, or kinematic.
     * @param {number} handle
     * @param {RawRigidBodyType} status
     * @param {boolean} wake_up
     */
    rbSetBodyType(handle, status, wake_up) {
        wasm.rawrigidbodyset_rbSetBodyType(this.__wbg_ptr, handle, status, wake_up);
    }
    /**
     * Is this rigid-body fixed?
     * @param {number} handle
     * @returns {boolean}
     */
    rbIsFixed(handle) {
        const ret = wasm.rawrigidbodyset_rbIsFixed(this.__wbg_ptr, handle);
        return ret !== 0;
    }
    /**
     * Is this rigid-body kinematic?
     * @param {number} handle
     * @returns {boolean}
     */
    rbIsKinematic(handle) {
        const ret = wasm.rawrigidbodyset_rbIsKinematic(this.__wbg_ptr, handle);
        return ret !== 0;
    }
    /**
     * Is this rigid-body dynamic?
     * @param {number} handle
     * @returns {boolean}
     */
    rbIsDynamic(handle) {
        const ret = wasm.rawrigidbodyset_rbIsDynamic(this.__wbg_ptr, handle);
        return ret !== 0;
    }
    /**
     * The linear damping coefficient of this rigid-body.
     * @param {number} handle
     * @returns {number}
     */
    rbLinearDamping(handle) {
        const ret = wasm.rawrigidbodyset_rbLinearDamping(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * The angular damping coefficient of this rigid-body.
     * @param {number} handle
     * @returns {number}
     */
    rbAngularDamping(handle) {
        const ret = wasm.rawrigidbodyset_rbAngularDamping(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * @param {number} handle
     * @param {number} factor
     */
    rbSetLinearDamping(handle, factor) {
        wasm.rawrigidbodyset_rbSetLinearDamping(this.__wbg_ptr, handle, factor);
    }
    /**
     * @param {number} handle
     * @param {number} factor
     */
    rbSetAngularDamping(handle, factor) {
        wasm.rawrigidbodyset_rbSetAngularDamping(this.__wbg_ptr, handle, factor);
    }
    /**
     * @param {number} handle
     * @param {boolean} enabled
     */
    rbSetEnabled(handle, enabled) {
        wasm.rawrigidbodyset_rbSetEnabled(this.__wbg_ptr, handle, enabled);
    }
    /**
     * @param {number} handle
     * @returns {boolean}
     */
    rbIsEnabled(handle) {
        const ret = wasm.rawrigidbodyset_rbIsEnabled(this.__wbg_ptr, handle);
        return ret !== 0;
    }
    /**
     * @param {number} handle
     * @returns {number}
     */
    rbGravityScale(handle) {
        const ret = wasm.rawrigidbodyset_rbGravityScale(this.__wbg_ptr, handle);
        return ret;
    }
    /**
     * @param {number} handle
     * @param {number} factor
     * @param {boolean} wakeUp
     */
    rbSetGravityScale(handle, factor, wakeUp) {
        wasm.rawrigidbodyset_rbSetGravityScale(this.__wbg_ptr, handle, factor, wakeUp);
    }
    /**
     * Resets to zero all user-added forces added to this rigid-body.
     * @param {number} handle
     * @param {boolean} wakeUp
     */
    rbResetForces(handle, wakeUp) {
        wasm.rawrigidbodyset_rbResetForces(this.__wbg_ptr, handle, wakeUp);
    }
    /**
     * Resets to zero all user-added torques added to this rigid-body.
     * @param {number} handle
     * @param {boolean} wakeUp
     */
    rbResetTorques(handle, wakeUp) {
        wasm.rawrigidbodyset_rbResetTorques(this.__wbg_ptr, handle, wakeUp);
    }
    /**
     * Adds a force at the center-of-mass of this rigid-body.
     *
     * # Parameters
     * - `force`: the world-space force to apply on the rigid-body.
     * - `wakeUp`: should the rigid-body be automatically woken-up?
     * @param {number} handle
     * @param {RawVector} force
     * @param {boolean} wakeUp
     */
    rbAddForce(handle, force, wakeUp) {
        _assertClass(force, RawVector);
        wasm.rawrigidbodyset_rbAddForce(this.__wbg_ptr, handle, force.__wbg_ptr, wakeUp);
    }
    /**
     * Applies an impulse at the center-of-mass of this rigid-body.
     *
     * # Parameters
     * - `impulse`: the world-space impulse to apply on the rigid-body.
     * - `wakeUp`: should the rigid-body be automatically woken-up?
     * @param {number} handle
     * @param {RawVector} impulse
     * @param {boolean} wakeUp
     */
    rbApplyImpulse(handle, impulse, wakeUp) {
        _assertClass(impulse, RawVector);
        wasm.rawrigidbodyset_rbApplyImpulse(this.__wbg_ptr, handle, impulse.__wbg_ptr, wakeUp);
    }
    /**
     * Adds a torque at the center-of-mass of this rigid-body.
     *
     * # Parameters
     * - `torque`: the torque to apply on the rigid-body.
     * - `wakeUp`: should the rigid-body be automatically woken-up?
     * @param {number} handle
     * @param {number} torque
     * @param {boolean} wakeUp
     */
    rbAddTorque(handle, torque, wakeUp) {
        wasm.rawrigidbodyset_rbAddTorque(this.__wbg_ptr, handle, torque, wakeUp);
    }
    /**
     * Applies an impulsive torque at the center-of-mass of this rigid-body.
     *
     * # Parameters
     * - `torque impulse`: the torque impulse to apply on the rigid-body.
     * - `wakeUp`: should the rigid-body be automatically woken-up?
     * @param {number} handle
     * @param {number} torque_impulse
     * @param {boolean} wakeUp
     */
    rbApplyTorqueImpulse(handle, torque_impulse, wakeUp) {
        wasm.rawrigidbodyset_rbApplyTorqueImpulse(this.__wbg_ptr, handle, torque_impulse, wakeUp);
    }
    /**
     * Adds a force at the given world-space point of this rigid-body.
     *
     * # Parameters
     * - `force`: the world-space force to apply on the rigid-body.
     * - `point`: the world-space point where the impulse is to be applied on the rigid-body.
     * - `wakeUp`: should the rigid-body be automatically woken-up?
     * @param {number} handle
     * @param {RawVector} force
     * @param {RawVector} point
     * @param {boolean} wakeUp
     */
    rbAddForceAtPoint(handle, force, point, wakeUp) {
        _assertClass(force, RawVector);
        _assertClass(point, RawVector);
        wasm.rawrigidbodyset_rbAddForceAtPoint(this.__wbg_ptr, handle, force.__wbg_ptr, point.__wbg_ptr, wakeUp);
    }
    /**
     * Applies an impulse at the given world-space point of this rigid-body.
     *
     * # Parameters
     * - `impulse`: the world-space impulse to apply on the rigid-body.
     * - `point`: the world-space point where the impulse is to be applied on the rigid-body.
     * - `wakeUp`: should the rigid-body be automatically woken-up?
     * @param {number} handle
     * @param {RawVector} impulse
     * @param {RawVector} point
     * @param {boolean} wakeUp
     */
    rbApplyImpulseAtPoint(handle, impulse, point, wakeUp) {
        _assertClass(impulse, RawVector);
        _assertClass(point, RawVector);
        wasm.rawrigidbodyset_rbApplyImpulseAtPoint(this.__wbg_ptr, handle, impulse.__wbg_ptr, point.__wbg_ptr, wakeUp);
    }
    /**
     * @param {number} handle
     * @returns {number}
     */
    rbAdditionalSolverIterations(handle) {
        const ret = wasm.rawrigidbodyset_rbAdditionalSolverIterations(this.__wbg_ptr, handle);
        return ret >>> 0;
    }
    /**
     * @param {number} handle
     * @param {number} iters
     */
    rbSetAdditionalSolverIterations(handle, iters) {
        wasm.rawrigidbodyset_rbSetAdditionalSolverIterations(this.__wbg_ptr, handle, iters);
    }
    /**
     * An arbitrary user-defined 32-bit integer
     * @param {number} handle
     * @returns {number}
     */
    rbUserData(handle) {
        const ret = wasm.rawrigidbodyset_rbUserData(this.__wbg_ptr, handle);
        return ret >>> 0;
    }
    /**
     * Sets the user-defined 32-bit integer of this rigid-body.
     *
     * # Parameters
     * - `data`: an arbitrary user-defined 32-bit integer.
     * @param {number} handle
     * @param {number} data
     */
    rbSetUserData(handle, data) {
        wasm.rawrigidbodyset_rbSetUserData(this.__wbg_ptr, handle, data);
    }
    /**
     * Retrieves the constant force(s) the user added to this rigid-body.
     * Returns zero if the rigid-body is not dynamic.
     * @param {number} handle
     * @returns {RawVector}
     */
    rbUserForce(handle) {
        const ret = wasm.rawrigidbodyset_rbUserForce(this.__wbg_ptr, handle);
        return RawVector.__wrap(ret);
    }
    /**
     * Retrieves the constant torque(s) the user added to this rigid-body.
     * Returns zero if the rigid-body is not dynamic.
     * @param {number} handle
     * @returns {number}
     */
    rbUserTorque(handle) {
        const ret = wasm.rawrigidbodyset_rbUserTorque(this.__wbg_ptr, handle);
        return ret;
    }
    constructor() {
        const ret = wasm.rawrigidbodyset_new();
        this.__wbg_ptr = ret >>> 0;
        RawRigidBodySetFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {boolean} enabled
     * @param {RawVector} translation
     * @param {RawRotation} rotation
     * @param {number} gravityScale
     * @param {number} mass
     * @param {boolean} massOnly
     * @param {RawVector} centerOfMass
     * @param {RawVector} linvel
     * @param {number} angvel
     * @param {number} principalAngularInertia
     * @param {boolean} translationEnabledX
     * @param {boolean} translationEnabledY
     * @param {boolean} rotationsEnabled
     * @param {number} linearDamping
     * @param {number} angularDamping
     * @param {RawRigidBodyType} rb_type
     * @param {boolean} canSleep
     * @param {boolean} sleeping
     * @param {number} softCcdPrediciton
     * @param {boolean} ccdEnabled
     * @param {number} dominanceGroup
     * @param {number} additional_solver_iterations
     * @returns {number}
     */
    createRigidBody(enabled, translation, rotation, gravityScale, mass, massOnly, centerOfMass, linvel, angvel, principalAngularInertia, translationEnabledX, translationEnabledY, rotationsEnabled, linearDamping, angularDamping, rb_type, canSleep, sleeping, softCcdPrediciton, ccdEnabled, dominanceGroup, additional_solver_iterations) {
        _assertClass(translation, RawVector);
        _assertClass(rotation, RawRotation);
        _assertClass(centerOfMass, RawVector);
        _assertClass(linvel, RawVector);
        const ret = wasm.rawrigidbodyset_createRigidBody(this.__wbg_ptr, enabled, translation.__wbg_ptr, rotation.__wbg_ptr, gravityScale, mass, massOnly, centerOfMass.__wbg_ptr, linvel.__wbg_ptr, angvel, principalAngularInertia, translationEnabledX, translationEnabledY, rotationsEnabled, linearDamping, angularDamping, rb_type, canSleep, sleeping, softCcdPrediciton, ccdEnabled, dominanceGroup, additional_solver_iterations);
        return ret;
    }
    /**
     * @param {number} handle
     * @param {RawIslandManager} islands
     * @param {RawColliderSet} colliders
     * @param {RawImpulseJointSet} joints
     * @param {RawMultibodyJointSet} articulations
     */
    remove(handle, islands, colliders, joints, articulations) {
        _assertClass(islands, RawIslandManager);
        _assertClass(colliders, RawColliderSet);
        _assertClass(joints, RawImpulseJointSet);
        _assertClass(articulations, RawMultibodyJointSet);
        wasm.rawrigidbodyset_remove(this.__wbg_ptr, handle, islands.__wbg_ptr, colliders.__wbg_ptr, joints.__wbg_ptr, articulations.__wbg_ptr);
    }
    /**
     * The number of rigid-bodies on this set.
     * @returns {number}
     */
    len() {
        const ret = wasm.rawcolliderset_len(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Checks if a rigid-body with the given integer handle exists.
     * @param {number} handle
     * @returns {boolean}
     */
    contains(handle) {
        const ret = wasm.rawrigidbodyset_contains(this.__wbg_ptr, handle);
        return ret !== 0;
    }
    /**
     * Applies the given JavaScript function to the integer handle of each rigid-body managed by this set.
     *
     * # Parameters
     * - `f(handle)`: the function to apply to the integer handle of each rigid-body managed by this set. Called as `f(collider)`.
     * @param {Function} f
     */
    forEachRigidBodyHandle(f) {
        try {
            wasm.rawrigidbodyset_forEachRigidBodyHandle(this.__wbg_ptr, addBorrowedObject(f));
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * @param {RawColliderSet} colliders
     */
    propagateModifiedBodyPositionsToColliders(colliders) {
        _assertClass(colliders, RawColliderSet);
        wasm.rawrigidbodyset_propagateModifiedBodyPositionsToColliders(this.__wbg_ptr, colliders.__wbg_ptr);
    }
}

const RawRotationFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawrotation_free(ptr >>> 0, 1));
/**
 * A rotation quaternion.
 */
export class RawRotation {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawRotation.prototype);
        obj.__wbg_ptr = ptr;
        RawRotationFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawRotationFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawrotation_free(ptr, 0);
    }
    /**
     * The identity rotation.
     * @returns {RawRotation}
     */
    static identity() {
        const ret = wasm.rawrotation_identity();
        return RawRotation.__wrap(ret);
    }
    /**
     * The rotation with thegiven angle.
     * @param {number} angle
     * @returns {RawRotation}
     */
    static fromAngle(angle) {
        const ret = wasm.rawrotation_fromAngle(angle);
        return RawRotation.__wrap(ret);
    }
    /**
     * The imaginary part of this complex number.
     * @returns {number}
     */
    get im() {
        const ret = wasm.rawintegrationparameters_dt(this.__wbg_ptr);
        return ret;
    }
    /**
     * The real part of this complex number.
     * @returns {number}
     */
    get re() {
        const ret = wasm.rawrotation_re(this.__wbg_ptr);
        return ret;
    }
    /**
     * The rotation angle in radians.
     * @returns {number}
     */
    get angle() {
        const ret = wasm.rawrotation_angle(this.__wbg_ptr);
        return ret;
    }
}

const RawSerializationPipelineFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawserializationpipeline_free(ptr >>> 0, 1));

export class RawSerializationPipeline {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawSerializationPipelineFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawserializationpipeline_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.rawserializationpipeline_new();
        this.__wbg_ptr = ret >>> 0;
        RawSerializationPipelineFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {RawVector} gravity
     * @param {RawIntegrationParameters} integrationParameters
     * @param {RawIslandManager} islands
     * @param {RawBroadPhase} broadPhase
     * @param {RawNarrowPhase} narrowPhase
     * @param {RawRigidBodySet} bodies
     * @param {RawColliderSet} colliders
     * @param {RawImpulseJointSet} impulse_joints
     * @param {RawMultibodyJointSet} multibody_joints
     * @returns {Uint8Array | undefined}
     */
    serializeAll(gravity, integrationParameters, islands, broadPhase, narrowPhase, bodies, colliders, impulse_joints, multibody_joints) {
        _assertClass(gravity, RawVector);
        _assertClass(integrationParameters, RawIntegrationParameters);
        _assertClass(islands, RawIslandManager);
        _assertClass(broadPhase, RawBroadPhase);
        _assertClass(narrowPhase, RawNarrowPhase);
        _assertClass(bodies, RawRigidBodySet);
        _assertClass(colliders, RawColliderSet);
        _assertClass(impulse_joints, RawImpulseJointSet);
        _assertClass(multibody_joints, RawMultibodyJointSet);
        const ret = wasm.rawserializationpipeline_serializeAll(this.__wbg_ptr, gravity.__wbg_ptr, integrationParameters.__wbg_ptr, islands.__wbg_ptr, broadPhase.__wbg_ptr, narrowPhase.__wbg_ptr, bodies.__wbg_ptr, colliders.__wbg_ptr, impulse_joints.__wbg_ptr, multibody_joints.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * @param {Uint8Array} data
     * @returns {RawDeserializedWorld | undefined}
     */
    deserializeAll(data) {
        const ret = wasm.rawserializationpipeline_deserializeAll(this.__wbg_ptr, addHeapObject(data));
        return ret === 0 ? undefined : RawDeserializedWorld.__wrap(ret);
    }
}

const RawShapeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawshape_free(ptr >>> 0, 1));

export class RawShape {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawShape.prototype);
        obj.__wbg_ptr = ptr;
        RawShapeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawShapeFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawshape_free(ptr, 0);
    }
    /**
     * @param {number} hx
     * @param {number} hy
     * @returns {RawShape}
     */
    static cuboid(hx, hy) {
        const ret = wasm.rawshape_cuboid(hx, hy);
        return RawShape.__wrap(ret);
    }
    /**
     * @param {number} hx
     * @param {number} hy
     * @param {number} borderRadius
     * @returns {RawShape}
     */
    static roundCuboid(hx, hy, borderRadius) {
        const ret = wasm.rawshape_roundCuboid(hx, hy, borderRadius);
        return RawShape.__wrap(ret);
    }
    /**
     * @param {number} radius
     * @returns {RawShape}
     */
    static ball(radius) {
        const ret = wasm.rawshape_ball(radius);
        return RawShape.__wrap(ret);
    }
    /**
     * @param {RawVector} normal
     * @returns {RawShape}
     */
    static halfspace(normal) {
        _assertClass(normal, RawVector);
        const ret = wasm.rawshape_halfspace(normal.__wbg_ptr);
        return RawShape.__wrap(ret);
    }
    /**
     * @param {number} halfHeight
     * @param {number} radius
     * @returns {RawShape}
     */
    static capsule(halfHeight, radius) {
        const ret = wasm.rawshape_capsule(halfHeight, radius);
        return RawShape.__wrap(ret);
    }
    /**
     * @param {RawVector} voxel_size
     * @param {Int32Array} grid_coords
     * @returns {RawShape}
     */
    static voxels(voxel_size, grid_coords) {
        _assertClass(voxel_size, RawVector);
        const ptr0 = passArray32ToWasm0(grid_coords, wasm.__wbindgen_export_2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rawshape_voxels(voxel_size.__wbg_ptr, ptr0, len0);
        return RawShape.__wrap(ret);
    }
    /**
     * @param {RawVector} voxel_size
     * @param {Float32Array} points
     * @returns {RawShape}
     */
    static voxelsFromPoints(voxel_size, points) {
        _assertClass(voxel_size, RawVector);
        const ptr0 = passArrayF32ToWasm0(points, wasm.__wbindgen_export_2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rawshape_voxelsFromPoints(voxel_size.__wbg_ptr, ptr0, len0);
        return RawShape.__wrap(ret);
    }
    /**
     * @param {Float32Array} vertices
     * @param {Uint32Array} indices
     * @returns {RawShape}
     */
    static polyline(vertices, indices) {
        const ptr0 = passArrayF32ToWasm0(vertices, wasm.__wbindgen_export_2);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_export_2);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.rawshape_polyline(ptr0, len0, ptr1, len1);
        return RawShape.__wrap(ret);
    }
    /**
     * @param {Float32Array} vertices
     * @param {Uint32Array} indices
     * @param {number} flags
     * @returns {RawShape | undefined}
     */
    static trimesh(vertices, indices, flags) {
        const ptr0 = passArrayF32ToWasm0(vertices, wasm.__wbindgen_export_2);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_export_2);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.rawshape_trimesh(ptr0, len0, ptr1, len1, flags);
        return ret === 0 ? undefined : RawShape.__wrap(ret);
    }
    /**
     * @param {Float32Array} heights
     * @param {RawVector} scale
     * @returns {RawShape}
     */
    static heightfield(heights, scale) {
        const ptr0 = passArrayF32ToWasm0(heights, wasm.__wbindgen_export_2);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(scale, RawVector);
        const ret = wasm.rawshape_heightfield(ptr0, len0, scale.__wbg_ptr);
        return RawShape.__wrap(ret);
    }
    /**
     * @param {RawVector} p1
     * @param {RawVector} p2
     * @returns {RawShape}
     */
    static segment(p1, p2) {
        _assertClass(p1, RawVector);
        _assertClass(p2, RawVector);
        const ret = wasm.rawshape_segment(p1.__wbg_ptr, p2.__wbg_ptr);
        return RawShape.__wrap(ret);
    }
    /**
     * @param {RawVector} p1
     * @param {RawVector} p2
     * @param {RawVector} p3
     * @returns {RawShape}
     */
    static triangle(p1, p2, p3) {
        _assertClass(p1, RawVector);
        _assertClass(p2, RawVector);
        _assertClass(p3, RawVector);
        const ret = wasm.rawshape_triangle(p1.__wbg_ptr, p2.__wbg_ptr, p3.__wbg_ptr);
        return RawShape.__wrap(ret);
    }
    /**
     * @param {RawVector} p1
     * @param {RawVector} p2
     * @param {RawVector} p3
     * @param {number} borderRadius
     * @returns {RawShape}
     */
    static roundTriangle(p1, p2, p3, borderRadius) {
        _assertClass(p1, RawVector);
        _assertClass(p2, RawVector);
        _assertClass(p3, RawVector);
        const ret = wasm.rawshape_roundTriangle(p1.__wbg_ptr, p2.__wbg_ptr, p3.__wbg_ptr, borderRadius);
        return RawShape.__wrap(ret);
    }
    /**
     * @param {Float32Array} points
     * @returns {RawShape | undefined}
     */
    static convexHull(points) {
        const ptr0 = passArrayF32ToWasm0(points, wasm.__wbindgen_export_2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rawshape_convexHull(ptr0, len0);
        return ret === 0 ? undefined : RawShape.__wrap(ret);
    }
    /**
     * @param {Float32Array} points
     * @param {number} borderRadius
     * @returns {RawShape | undefined}
     */
    static roundConvexHull(points, borderRadius) {
        const ptr0 = passArrayF32ToWasm0(points, wasm.__wbindgen_export_2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rawshape_roundConvexHull(ptr0, len0, borderRadius);
        return ret === 0 ? undefined : RawShape.__wrap(ret);
    }
    /**
     * @param {Float32Array} vertices
     * @returns {RawShape | undefined}
     */
    static convexPolyline(vertices) {
        const ptr0 = passArrayF32ToWasm0(vertices, wasm.__wbindgen_export_2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rawshape_convexPolyline(ptr0, len0);
        return ret === 0 ? undefined : RawShape.__wrap(ret);
    }
    /**
     * @param {Float32Array} vertices
     * @param {number} borderRadius
     * @returns {RawShape | undefined}
     */
    static roundConvexPolyline(vertices, borderRadius) {
        const ptr0 = passArrayF32ToWasm0(vertices, wasm.__wbindgen_export_2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rawshape_roundConvexPolyline(ptr0, len0, borderRadius);
        return ret === 0 ? undefined : RawShape.__wrap(ret);
    }
    /**
     * @param {RawVector} shapePos1
     * @param {RawRotation} shapeRot1
     * @param {RawVector} shapeVel1
     * @param {RawShape} shape2
     * @param {RawVector} shapePos2
     * @param {RawRotation} shapeRot2
     * @param {RawVector} shapeVel2
     * @param {number} target_distance
     * @param {number} maxToi
     * @param {boolean} stop_at_penetration
     * @returns {RawShapeCastHit | undefined}
     */
    castShape(shapePos1, shapeRot1, shapeVel1, shape2, shapePos2, shapeRot2, shapeVel2, target_distance, maxToi, stop_at_penetration) {
        _assertClass(shapePos1, RawVector);
        _assertClass(shapeRot1, RawRotation);
        _assertClass(shapeVel1, RawVector);
        _assertClass(shape2, RawShape);
        _assertClass(shapePos2, RawVector);
        _assertClass(shapeRot2, RawRotation);
        _assertClass(shapeVel2, RawVector);
        const ret = wasm.rawshape_castShape(this.__wbg_ptr, shapePos1.__wbg_ptr, shapeRot1.__wbg_ptr, shapeVel1.__wbg_ptr, shape2.__wbg_ptr, shapePos2.__wbg_ptr, shapeRot2.__wbg_ptr, shapeVel2.__wbg_ptr, target_distance, maxToi, stop_at_penetration);
        return ret === 0 ? undefined : RawShapeCastHit.__wrap(ret);
    }
    /**
     * @param {RawVector} shapePos1
     * @param {RawRotation} shapeRot1
     * @param {RawShape} shape2
     * @param {RawVector} shapePos2
     * @param {RawRotation} shapeRot2
     * @returns {boolean}
     */
    intersectsShape(shapePos1, shapeRot1, shape2, shapePos2, shapeRot2) {
        _assertClass(shapePos1, RawVector);
        _assertClass(shapeRot1, RawRotation);
        _assertClass(shape2, RawShape);
        _assertClass(shapePos2, RawVector);
        _assertClass(shapeRot2, RawRotation);
        const ret = wasm.rawshape_intersectsShape(this.__wbg_ptr, shapePos1.__wbg_ptr, shapeRot1.__wbg_ptr, shape2.__wbg_ptr, shapePos2.__wbg_ptr, shapeRot2.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {RawVector} shapePos1
     * @param {RawRotation} shapeRot1
     * @param {RawShape} shape2
     * @param {RawVector} shapePos2
     * @param {RawRotation} shapeRot2
     * @param {number} prediction
     * @returns {RawShapeContact | undefined}
     */
    contactShape(shapePos1, shapeRot1, shape2, shapePos2, shapeRot2, prediction) {
        _assertClass(shapePos1, RawVector);
        _assertClass(shapeRot1, RawRotation);
        _assertClass(shape2, RawShape);
        _assertClass(shapePos2, RawVector);
        _assertClass(shapeRot2, RawRotation);
        const ret = wasm.rawshape_contactShape(this.__wbg_ptr, shapePos1.__wbg_ptr, shapeRot1.__wbg_ptr, shape2.__wbg_ptr, shapePos2.__wbg_ptr, shapeRot2.__wbg_ptr, prediction);
        return ret === 0 ? undefined : RawShapeContact.__wrap(ret);
    }
    /**
     * @param {RawVector} shapePos
     * @param {RawRotation} shapeRot
     * @param {RawVector} point
     * @returns {boolean}
     */
    containsPoint(shapePos, shapeRot, point) {
        _assertClass(shapePos, RawVector);
        _assertClass(shapeRot, RawRotation);
        _assertClass(point, RawVector);
        const ret = wasm.rawshape_containsPoint(this.__wbg_ptr, shapePos.__wbg_ptr, shapeRot.__wbg_ptr, point.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {RawVector} shapePos
     * @param {RawRotation} shapeRot
     * @param {RawVector} point
     * @param {boolean} solid
     * @returns {RawPointProjection}
     */
    projectPoint(shapePos, shapeRot, point, solid) {
        _assertClass(shapePos, RawVector);
        _assertClass(shapeRot, RawRotation);
        _assertClass(point, RawVector);
        const ret = wasm.rawshape_projectPoint(this.__wbg_ptr, shapePos.__wbg_ptr, shapeRot.__wbg_ptr, point.__wbg_ptr, solid);
        return RawPointProjection.__wrap(ret);
    }
    /**
     * @param {RawVector} shapePos
     * @param {RawRotation} shapeRot
     * @param {RawVector} rayOrig
     * @param {RawVector} rayDir
     * @param {number} maxToi
     * @returns {boolean}
     */
    intersectsRay(shapePos, shapeRot, rayOrig, rayDir, maxToi) {
        _assertClass(shapePos, RawVector);
        _assertClass(shapeRot, RawRotation);
        _assertClass(rayOrig, RawVector);
        _assertClass(rayDir, RawVector);
        const ret = wasm.rawshape_intersectsRay(this.__wbg_ptr, shapePos.__wbg_ptr, shapeRot.__wbg_ptr, rayOrig.__wbg_ptr, rayDir.__wbg_ptr, maxToi);
        return ret !== 0;
    }
    /**
     * @param {RawVector} shapePos
     * @param {RawRotation} shapeRot
     * @param {RawVector} rayOrig
     * @param {RawVector} rayDir
     * @param {number} maxToi
     * @param {boolean} solid
     * @returns {number}
     */
    castRay(shapePos, shapeRot, rayOrig, rayDir, maxToi, solid) {
        _assertClass(shapePos, RawVector);
        _assertClass(shapeRot, RawRotation);
        _assertClass(rayOrig, RawVector);
        _assertClass(rayDir, RawVector);
        const ret = wasm.rawshape_castRay(this.__wbg_ptr, shapePos.__wbg_ptr, shapeRot.__wbg_ptr, rayOrig.__wbg_ptr, rayDir.__wbg_ptr, maxToi, solid);
        return ret;
    }
    /**
     * @param {RawVector} shapePos
     * @param {RawRotation} shapeRot
     * @param {RawVector} rayOrig
     * @param {RawVector} rayDir
     * @param {number} maxToi
     * @param {boolean} solid
     * @returns {RawRayIntersection | undefined}
     */
    castRayAndGetNormal(shapePos, shapeRot, rayOrig, rayDir, maxToi, solid) {
        _assertClass(shapePos, RawVector);
        _assertClass(shapeRot, RawRotation);
        _assertClass(rayOrig, RawVector);
        _assertClass(rayDir, RawVector);
        const ret = wasm.rawshape_castRayAndGetNormal(this.__wbg_ptr, shapePos.__wbg_ptr, shapeRot.__wbg_ptr, rayOrig.__wbg_ptr, rayDir.__wbg_ptr, maxToi, solid);
        return ret === 0 ? undefined : RawRayIntersection.__wrap(ret);
    }
}

const RawShapeCastHitFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawshapecasthit_free(ptr >>> 0, 1));

export class RawShapeCastHit {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawShapeCastHit.prototype);
        obj.__wbg_ptr = ptr;
        RawShapeCastHitFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawShapeCastHitFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawshapecasthit_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    time_of_impact() {
        const ret = wasm.rawrotation_re(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {RawVector}
     */
    witness1() {
        const ret = wasm.rawshapecasthit_witness1(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @returns {RawVector}
     */
    witness2() {
        const ret = wasm.rawcollidershapecasthit_witness1(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @returns {RawVector}
     */
    normal1() {
        const ret = wasm.rawcollidershapecasthit_witness2(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @returns {RawVector}
     */
    normal2() {
        const ret = wasm.rawcollidershapecasthit_normal1(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
}

const RawShapeContactFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawshapecontact_free(ptr >>> 0, 1));

export class RawShapeContact {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawShapeContact.prototype);
        obj.__wbg_ptr = ptr;
        RawShapeContactFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawShapeContactFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawshapecontact_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    distance() {
        const ret = wasm.rawcontactforceevent_total_force_magnitude(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {RawVector}
     */
    point1() {
        const ret = wasm.rawpointprojection_point(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @returns {RawVector}
     */
    point2() {
        const ret = wasm.rawpointcolliderprojection_point(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @returns {RawVector}
     */
    normal1() {
        const ret = wasm.rawcontactforceevent_total_force(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * @returns {RawVector}
     */
    normal2() {
        const ret = wasm.rawcharactercollision_translationDeltaApplied(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
}

const RawVectorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawvector_free(ptr >>> 0, 1));
/**
 * A vector.
 */
export class RawVector {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawVector.prototype);
        obj.__wbg_ptr = ptr;
        RawVectorFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawVectorFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawvector_free(ptr, 0);
    }
    /**
     * Creates a new vector filled with zeros.
     * @returns {RawVector}
     */
    static zero() {
        const ret = wasm.rawvector_zero();
        return RawVector.__wrap(ret);
    }
    /**
     * Creates a new 2D vector from its two components.
     *
     * # Parameters
     * - `x`: the `x` component of this 2D vector.
     * - `y`: the `y` component of this 2D vector.
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        const ret = wasm.rawvector_new(x, y);
        this.__wbg_ptr = ret >>> 0;
        RawVectorFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * The `x` component of this vector.
     * @returns {number}
     */
    get x() {
        const ret = wasm.rawrotation_re(this.__wbg_ptr);
        return ret;
    }
    /**
     * Sets the `x` component of this vector.
     * @param {number} x
     */
    set x(x) {
        wasm.rawvector_set_x(this.__wbg_ptr, x);
    }
    /**
     * The `y` component of this vector.
     * @returns {number}
     */
    get y() {
        const ret = wasm.rawintegrationparameters_dt(this.__wbg_ptr);
        return ret;
    }
    /**
     * Sets the `y` component of this vector.
     * @param {number} y
     */
    set y(y) {
        wasm.rawintegrationparameters_set_dt(this.__wbg_ptr, y);
    }
    /**
     * Create a new 2D vector from this vector with its components rearranged as `{x, y}`.
     * @returns {RawVector}
     */
    xy() {
        const ret = wasm.rawvector_xy(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
    /**
     * Create a new 2D vector from this vector with its components rearranged as `{y, x}`.
     * @returns {RawVector}
     */
    yx() {
        const ret = wasm.rawvector_yx(this.__wbg_ptr);
        return RawVector.__wrap(ret);
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_bind_c8359b1cba058168 = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).bind(getObject(arg1), getObject(arg2), getObject(arg3));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_609cc3eee51ed158 = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_7cccdd69e0791ae2 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_833bed5770ea2041 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2), getObject(arg3));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_b8adc8b1d0a0d8eb = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2), getObject(arg3), getObject(arg4));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_length_3b4f022188ae8db6 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_length_a446193dc22c12f8 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_new_a12002a7f91c75be = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_d97e637ebe145a9a = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_e6b7e69acd4c7354 = function(arg0, arg1, arg2) {
        const ret = new Float32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithlength_5a5efe313cfd59f1 = function(arg0) {
        const ret = new Float32Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_rawcontactforceevent_new = function(arg0) {
        const ret = RawContactForceEvent.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_rawraycolliderintersection_new = function(arg0) {
        const ret = RawRayColliderIntersection.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_10bad9bee0e9c58b = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_set_65595bdd868b3009 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedFloat32ArrayMemory0 = null;
    cachedInt32ArrayMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;



    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('rapier_wasm2d_bg.wasm', "<deleted>");
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;

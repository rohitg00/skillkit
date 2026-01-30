import { Vector, Rotation } from "../math";
import { RawColliderSet, RawShape } from "../raw";
import { ShapeContact } from "./contact";
import { PointProjection } from "./point";
import { Ray, RayIntersection } from "./ray";
import { ShapeCastHit } from "./toi";
import { ColliderHandle } from "./collider";
export declare abstract class Shape {
    abstract intoRaw(): RawShape;
    /**
     * The concrete type of this shape.
     */
    abstract get type(): ShapeType;
    /**
     * instant mode without cache
     */
    static fromRaw(rawSet: RawColliderSet, handle: ColliderHandle): Shape;
    /**
     * Computes the time of impact between two moving shapes.
     * @param shapePos1 - The initial position of this sahpe.
     * @param shapeRot1 - The rotation of this shape.
     * @param shapeVel1 - The velocity of this shape.
     * @param shape2 - The second moving shape.
     * @param shapePos2 - The initial position of the second shape.
     * @param shapeRot2 - The rotation of the second shape.
     * @param shapeVel2 - The velocity of the second shape.
     * @param targetDistance − If the shape moves closer to this distance from a collider, a hit
     *                         will be returned.
     * @param maxToi - The maximum time when the impact can happen.
     * @param stopAtPenetration - If set to `false`, the linear shape-cast won’t immediately stop if
     *   the shape is penetrating another shape at its starting point **and** its trajectory is such
     *   that it’s on a path to exit that penetration state.
     * @returns If the two moving shapes collider at some point along their trajectories, this returns the
     *  time at which the two shape collider as well as the contact information during the impact. Returns
     *  `null`if the two shapes never collide along their paths.
     */
    castShape(shapePos1: Vector, shapeRot1: Rotation, shapeVel1: Vector, shape2: Shape, shapePos2: Vector, shapeRot2: Rotation, shapeVel2: Vector, targetDistance: number, maxToi: number, stopAtPenetration: boolean): ShapeCastHit | null;
    /**
     * Tests if this shape intersects another shape.
     *
     * @param shapePos1 - The position of this shape.
     * @param shapeRot1 - The rotation of this shape.
     * @param shape2  - The second shape to test.
     * @param shapePos2 - The position of the second shape.
     * @param shapeRot2 - The rotation of the second shape.
     * @returns `true` if the two shapes intersect, `false` if they don’t.
     */
    intersectsShape(shapePos1: Vector, shapeRot1: Rotation, shape2: Shape, shapePos2: Vector, shapeRot2: Rotation): boolean;
    /**
     * Computes one pair of contact points between two shapes.
     *
     * @param shapePos1 - The initial position of this sahpe.
     * @param shapeRot1 - The rotation of this shape.
     * @param shape2 - The second shape.
     * @param shapePos2 - The initial position of the second shape.
     * @param shapeRot2 - The rotation of the second shape.
     * @param prediction - The prediction value, if the shapes are separated by a distance greater than this value, test will fail.
     * @returns `null` if the shapes are separated by a distance greater than prediction, otherwise contact details. The result is given in world-space.
     */
    contactShape(shapePos1: Vector, shapeRot1: Rotation, shape2: Shape, shapePos2: Vector, shapeRot2: Rotation, prediction: number): ShapeContact | null;
    containsPoint(shapePos: Vector, shapeRot: Rotation, point: Vector): boolean;
    projectPoint(shapePos: Vector, shapeRot: Rotation, point: Vector, solid: boolean): PointProjection;
    intersectsRay(ray: Ray, shapePos: Vector, shapeRot: Rotation, maxToi: number): boolean;
    castRay(ray: Ray, shapePos: Vector, shapeRot: Rotation, maxToi: number, solid: boolean): number;
    castRayAndGetNormal(ray: Ray, shapePos: Vector, shapeRot: Rotation, maxToi: number, solid: boolean): RayIntersection;
}
/**
 * An enumeration representing the type of a shape.
 */
export declare enum ShapeType {
    Ball = 0,
    Cuboid = 1,
    Capsule = 2,
    Segment = 3,
    Polyline = 4,
    Triangle = 5,
    TriMesh = 6,
    HeightField = 7,
    ConvexPolygon = 9,
    RoundCuboid = 10,
    RoundTriangle = 11,
    RoundConvexPolygon = 12,
    HalfSpace = 13,
    Voxels = 14
}
/**
 * Flags controlling the behavior of the triangle mesh creation and of some
 * operations involving triangle meshes.
 */
export declare enum TriMeshFlags {
    /**
     * If set, any triangle that results in a failing half-hedge topology computation will be deleted.
     */
    DELETE_BAD_TOPOLOGY_TRIANGLES = 4,
    /**
     * If set, the trimesh will be assumed to be oriented (with outward normals).
     *
     * The pseudo-normals of its vertices and edges will be computed.
     */
    ORIENTED = 8,
    /**
     * If set, the duplicate vertices of the trimesh will be merged.
     *
     * Two vertices with the exact same coordinates will share the same entry on the
     * vertex buffer and the index buffer is adjusted accordingly.
     */
    MERGE_DUPLICATE_VERTICES = 16,
    /**
     * If set, the triangles sharing two vertices with identical index values will be removed.
     *
     * Because of the way it is currently implemented, this methods implies that duplicate
     * vertices will be merged. It will no longer be the case in the future once we decouple
     * the computations.
     */
    DELETE_DEGENERATE_TRIANGLES = 32,
    /**
     * If set, two triangles sharing three vertices with identical index values (in any order)
     * will be removed.
     *
     * Because of the way it is currently implemented, this methods implies that duplicate
     * vertices will be merged. It will no longer be the case in the future once we decouple
     * the computations.
     */
    DELETE_DUPLICATE_TRIANGLES = 64,
    /**
     * If set, a special treatment will be applied to contact manifold calculation to eliminate
     * or fix contacts normals that could lead to incorrect bumps in physics simulation
     * (especially on flat surfaces).
     *
     * This is achieved by taking into account adjacent triangle normals when computing contact
     * points for a given triangle.
     *
     * /!\ NOT SUPPORTED IN THE 2D VERSION OF RAPIER.
     */
    FIX_INTERNAL_EDGES = 144
}
/**
 * A shape that is a sphere in 3D and a circle in 2D.
 */
export declare class Ball extends Shape {
    readonly type = ShapeType.Ball;
    /**
     * The balls radius.
     */
    radius: number;
    /**
     * Creates a new ball with the given radius.
     * @param radius - The balls radius.
     */
    constructor(radius: number);
    intoRaw(): RawShape;
}
export declare class HalfSpace extends Shape {
    readonly type = ShapeType.HalfSpace;
    /**
     * The outward normal of the half-space.
     */
    normal: Vector;
    /**
     * Creates a new halfspace delimited by an infinite plane.
     *
     * @param normal - The outward normal of the plane.
     */
    constructor(normal: Vector);
    intoRaw(): RawShape;
}
/**
 * A shape that is a box in 3D and a rectangle in 2D.
 */
export declare class Cuboid extends Shape {
    readonly type = ShapeType.Cuboid;
    /**
     * The half extent of the cuboid along each coordinate axis.
     */
    halfExtents: Vector;
    /**
     * Creates a new 2D rectangle.
     * @param hx - The half width of the rectangle.
     * @param hy - The helf height of the rectangle.
     */
    constructor(hx: number, hy: number);
    intoRaw(): RawShape;
}
/**
 * A shape that is a box in 3D and a rectangle in 2D, with round corners.
 */
export declare class RoundCuboid extends Shape {
    readonly type = ShapeType.RoundCuboid;
    /**
     * The half extent of the cuboid along each coordinate axis.
     */
    halfExtents: Vector;
    /**
     * The radius of the cuboid's round border.
     */
    borderRadius: number;
    /**
     * Creates a new 2D rectangle.
     * @param hx - The half width of the rectangle.
     * @param hy - The helf height of the rectangle.
     * @param borderRadius - The radius of the borders of this cuboid. This will
     *   effectively increase the half-extents of the cuboid by this radius.
     */
    constructor(hx: number, hy: number, borderRadius: number);
    intoRaw(): RawShape;
}
/**
 * A shape that is a capsule.
 */
export declare class Capsule extends Shape {
    readonly type = ShapeType.Capsule;
    /**
     * The radius of the capsule's basis.
     */
    radius: number;
    /**
     * The capsule's half height, along the `y` axis.
     */
    halfHeight: number;
    /**
     * Creates a new capsule with the given radius and half-height.
     * @param halfHeight - The balls half-height along the `y` axis.
     * @param radius - The balls radius.
     */
    constructor(halfHeight: number, radius: number);
    intoRaw(): RawShape;
}
/**
 * A shape that is a segment.
 */
export declare class Segment extends Shape {
    readonly type = ShapeType.Segment;
    /**
     * The first point of the segment.
     */
    a: Vector;
    /**
     * The second point of the segment.
     */
    b: Vector;
    /**
     * Creates a new segment shape.
     * @param a - The first point of the segment.
     * @param b - The second point of the segment.
     */
    constructor(a: Vector, b: Vector);
    intoRaw(): RawShape;
}
/**
 * A shape that is a segment.
 */
export declare class Triangle extends Shape {
    readonly type = ShapeType.Triangle;
    /**
     * The first point of the triangle.
     */
    a: Vector;
    /**
     * The second point of the triangle.
     */
    b: Vector;
    /**
     * The second point of the triangle.
     */
    c: Vector;
    /**
     * Creates a new triangle shape.
     *
     * @param a - The first point of the triangle.
     * @param b - The second point of the triangle.
     * @param c - The third point of the triangle.
     */
    constructor(a: Vector, b: Vector, c: Vector);
    intoRaw(): RawShape;
}
/**
 * A shape that is a triangle with round borders and a non-zero thickness.
 */
export declare class RoundTriangle extends Shape {
    readonly type = ShapeType.RoundTriangle;
    /**
     * The first point of the triangle.
     */
    a: Vector;
    /**
     * The second point of the triangle.
     */
    b: Vector;
    /**
     * The second point of the triangle.
     */
    c: Vector;
    /**
     * The radius of the triangles's rounded edges and vertices.
     * In 3D, this is also equal to half the thickness of the round triangle.
     */
    borderRadius: number;
    /**
     * Creates a new triangle shape with round corners.
     *
     * @param a - The first point of the triangle.
     * @param b - The second point of the triangle.
     * @param c - The third point of the triangle.
     * @param borderRadius - The radius of the borders of this triangle. In 3D,
     *   this is also equal to half the thickness of the triangle.
     */
    constructor(a: Vector, b: Vector, c: Vector, borderRadius: number);
    intoRaw(): RawShape;
}
/**
 * A shape that is a triangle mesh.
 */
export declare class Polyline extends Shape {
    readonly type = ShapeType.Polyline;
    /**
     * The vertices of the polyline.
     */
    vertices: Float32Array;
    /**
     * The indices of the segments.
     */
    indices: Uint32Array;
    /**
     * Creates a new polyline shape.
     *
     * @param vertices - The coordinates of the polyline's vertices.
     * @param indices - The indices of the polyline's segments. If this is `null` or not provided, then
     *    the vertices are assumed to form a line strip.
     */
    constructor(vertices: Float32Array, indices?: Uint32Array);
    intoRaw(): RawShape;
}
/**
 * A shape made of voxels.
 */
export declare class Voxels extends Shape {
    readonly type = ShapeType.Voxels;
    /**
     * The points or grid coordinates used to initialize the voxels.
     */
    data: Float32Array | Int32Array;
    /**
     * The dimensions of each voxel.
     */
    voxelSize: Vector;
    /**
     * Creates a new shape made of voxels.
     *
     * @param data - Defines the set of voxels. If this is a `Int32Array` then
     *               each voxel is defined from its (signed) grid coordinates,
     *               with 3 (resp 2) contiguous integers per voxel in 3D (resp 2D).
     *               If this is a `Float32Array`, each voxel will be such that
     *               they contain at least one point from this array (where each
     *               point is defined from 3 (resp 2) contiguous numbers per point
     *               in 3D (resp 2D).
     * @param voxelSize - The size of each voxel.
     */
    constructor(data: Float32Array | Int32Array, voxelSize: Vector);
    intoRaw(): RawShape;
}
/**
 * A shape that is a triangle mesh.
 */
export declare class TriMesh extends Shape {
    readonly type = ShapeType.TriMesh;
    /**
     * The vertices of the triangle mesh.
     */
    vertices: Float32Array;
    /**
     * The indices of the triangles.
     */
    indices: Uint32Array;
    /**
     * The triangle mesh flags.
     */
    flags: TriMeshFlags;
    /**
     * Creates a new triangle mesh shape.
     *
     * @param vertices - The coordinates of the triangle mesh's vertices.
     * @param indices - The indices of the triangle mesh's triangles.
     */
    constructor(vertices: Float32Array, indices: Uint32Array, flags?: TriMeshFlags);
    intoRaw(): RawShape;
}
/**
 * A shape that is a convex polygon.
 */
export declare class ConvexPolygon extends Shape {
    readonly type = ShapeType.ConvexPolygon;
    /**
     * The vertices of the convex polygon.
     */
    vertices: Float32Array;
    /**
     * Do we want to assume the vertices already form a convex hull?
     */
    skipConvexHullComputation: boolean;
    /**
     * Creates a new convex polygon shape.
     *
     * @param vertices - The coordinates of the convex polygon's vertices.
     * @param skipConvexHullComputation - If set to `true`, the input points will
     *   be assumed to form a convex polyline and no convex-hull computation will
     *   be done automatically.
     */
    constructor(vertices: Float32Array, skipConvexHullComputation: boolean);
    intoRaw(): RawShape;
}
/**
 * A shape that is a convex polygon.
 */
export declare class RoundConvexPolygon extends Shape {
    readonly type = ShapeType.RoundConvexPolygon;
    /**
     * The vertices of the convex polygon.
     */
    vertices: Float32Array;
    /**
     * Do we want to assume the vertices already form a convex hull?
     */
    skipConvexHullComputation: boolean;
    /**
     * The radius of the convex polygon's rounded edges and vertices.
     */
    borderRadius: number;
    /**
     * Creates a new convex polygon shape.
     *
     * @param vertices - The coordinates of the convex polygon's vertices.
     * @param borderRadius - The radius of the borders of this convex polygon.
     * @param skipConvexHullComputation - If set to `true`, the input points will
     *   be assumed to form a convex polyline and no convex-hull computation will
     *   be done automatically.
     */
    constructor(vertices: Float32Array, borderRadius: number, skipConvexHullComputation: boolean);
    intoRaw(): RawShape;
}
/**
 * A shape that is a heightfield.
 */
export declare class Heightfield extends Shape {
    readonly type = ShapeType.HeightField;
    /**
     * The heights of the heightfield, along its local `y` axis.
     */
    heights: Float32Array;
    /**
     * The heightfield's length along its local `x` axis.
     */
    scale: Vector;
    /**
     * Creates a new heightfield shape.
     *
     * @param heights - The heights of the heightfield, along its local `y` axis.
     * @param scale - The scale factor applied to the heightfield.
     */
    constructor(heights: Float32Array, scale: Vector);
    intoRaw(): RawShape;
}

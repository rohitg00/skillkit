import { RawQueryPipeline } from "../raw";
import { ColliderHandle, ColliderSet, InteractionGroups, PointColliderProjection, Ray, RayColliderIntersection, RayColliderHit, Shape, ColliderShapeCastHit } from "../geometry";
import { RigidBodyHandle, RigidBodySet } from "../dynamics";
import { Rotation, Vector } from "../math";
/**
 * Flags for excluding whole sets of colliders from a scene query.
 */
export declare enum QueryFilterFlags {
    /**
     * Exclude from the query any collider attached to a fixed rigid-body and colliders with no rigid-body attached.
     */
    EXCLUDE_FIXED = 1,
    /**
     * Exclude from the query any collider attached to a dynamic rigid-body.
     */
    EXCLUDE_KINEMATIC = 2,
    /**
     * Exclude from the query any collider attached to a kinematic rigid-body.
     */
    EXCLUDE_DYNAMIC = 4,
    /**
     * Exclude from the query any collider that is a sensor.
     */
    EXCLUDE_SENSORS = 8,
    /**
     * Exclude from the query any collider that is not a sensor.
     */
    EXCLUDE_SOLIDS = 16,
    /**
     * Excludes all colliders not attached to a dynamic rigid-body.
     */
    ONLY_DYNAMIC = 3,
    /**
     * Excludes all colliders not attached to a kinematic rigid-body.
     */
    ONLY_KINEMATIC = 5,
    /**
     * Exclude all colliders attached to a non-fixed rigid-body
     * (this will not exclude colliders not attached to any rigid-body).
     */
    ONLY_FIXED = 6
}
/**
 * A pipeline for performing queries on all the colliders of a scene.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `queryPipeline.free()`
 * once you are done using it (and all the rigid-bodies it created).
 */
export declare class QueryPipeline {
    raw: RawQueryPipeline;
    /**
     * Release the WASM memory occupied by this query pipeline.
     */
    free(): void;
    constructor(raw?: RawQueryPipeline);
    /**
     * Updates the acceleration structure of the query pipeline.
     * @param colliders - The set of colliders taking part in this pipeline.
     */
    update(colliders: ColliderSet): void;
    /**
     * Find the closest intersection between a ray and a set of collider.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param ray - The ray to cast.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the length of the ray to `ray.dir.norm() * maxToi`.
     * @param solid - If `false` then the ray will attempt to hit the boundary of a shape, even if its
     *   origin already lies inside of a shape. In other terms, `true` implies that all shapes are plain,
     *   whereas `false` implies that all shapes are hollow for this ray-cast.
     * @param groups - Used to filter the colliders that can or cannot be hit by the ray.
     * @param filter - The callback to filter out which collider will be hit.
     */
    castRay(bodies: RigidBodySet, colliders: ColliderSet, ray: Ray, maxToi: number, solid: boolean, filterFlags?: QueryFilterFlags, filterGroups?: InteractionGroups, filterExcludeCollider?: ColliderHandle, filterExcludeRigidBody?: RigidBodyHandle, filterPredicate?: (collider: ColliderHandle) => boolean): RayColliderHit | null;
    /**
     * Find the closest intersection between a ray and a set of collider.
     *
     * This also computes the normal at the hit point.
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param ray - The ray to cast.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the length of the ray to `ray.dir.norm() * maxToi`.
     * @param solid - If `false` then the ray will attempt to hit the boundary of a shape, even if its
     *   origin already lies inside of a shape. In other terms, `true` implies that all shapes are plain,
     *   whereas `false` implies that all shapes are hollow for this ray-cast.
     * @param groups - Used to filter the colliders that can or cannot be hit by the ray.
     */
    castRayAndGetNormal(bodies: RigidBodySet, colliders: ColliderSet, ray: Ray, maxToi: number, solid: boolean, filterFlags?: QueryFilterFlags, filterGroups?: InteractionGroups, filterExcludeCollider?: ColliderHandle, filterExcludeRigidBody?: RigidBodyHandle, filterPredicate?: (collider: ColliderHandle) => boolean): RayColliderIntersection | null;
    /**
     * Cast a ray and collects all the intersections between a ray and the scene.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param ray - The ray to cast.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the length of the ray to `ray.dir.norm() * maxToi`.
     * @param solid - If `false` then the ray will attempt to hit the boundary of a shape, even if its
     *   origin already lies inside of a shape. In other terms, `true` implies that all shapes are plain,
     *   whereas `false` implies that all shapes are hollow for this ray-cast.
     * @param groups - Used to filter the colliders that can or cannot be hit by the ray.
     * @param callback - The callback called once per hit (in no particular order) between a ray and a collider.
     *   If this callback returns `false`, then the cast will stop and no further hits will be detected/reported.
     */
    intersectionsWithRay(bodies: RigidBodySet, colliders: ColliderSet, ray: Ray, maxToi: number, solid: boolean, callback: (intersect: RayColliderIntersection) => boolean, filterFlags?: QueryFilterFlags, filterGroups?: InteractionGroups, filterExcludeCollider?: ColliderHandle, filterExcludeRigidBody?: RigidBodyHandle, filterPredicate?: (collider: ColliderHandle) => boolean): void;
    /**
     * Gets the handle of up to one collider intersecting the given shape.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param shapePos - The position of the shape used for the intersection test.
     * @param shapeRot - The orientation of the shape used for the intersection test.
     * @param shape - The shape used for the intersection test.
     * @param groups - The bit groups and filter associated to the ray, in order to only
     *   hit the colliders with collision groups compatible with the ray's group.
     */
    intersectionWithShape(bodies: RigidBodySet, colliders: ColliderSet, shapePos: Vector, shapeRot: Rotation, shape: Shape, filterFlags?: QueryFilterFlags, filterGroups?: InteractionGroups, filterExcludeCollider?: ColliderHandle, filterExcludeRigidBody?: RigidBodyHandle, filterPredicate?: (collider: ColliderHandle) => boolean): ColliderHandle | null;
    /**
     * Find the projection of a point on the closest collider.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param point - The point to project.
     * @param solid - If this is set to `true` then the collider shapes are considered to
     *   be plain (if the point is located inside of a plain shape, its projection is the point
     *   itself). If it is set to `false` the collider shapes are considered to be hollow
     *   (if the point is located inside of an hollow shape, it is projected on the shape's
     *   boundary).
     * @param groups - The bit groups and filter associated to the point to project, in order to only
     *   project on colliders with collision groups compatible with the ray's group.
     */
    projectPoint(bodies: RigidBodySet, colliders: ColliderSet, point: Vector, solid: boolean, filterFlags?: QueryFilterFlags, filterGroups?: InteractionGroups, filterExcludeCollider?: ColliderHandle, filterExcludeRigidBody?: RigidBodyHandle, filterPredicate?: (collider: ColliderHandle) => boolean): PointColliderProjection | null;
    /**
     * Find the projection of a point on the closest collider.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param point - The point to project.
     * @param groups - The bit groups and filter associated to the point to project, in order to only
     *   project on colliders with collision groups compatible with the ray's group.
     */
    projectPointAndGetFeature(bodies: RigidBodySet, colliders: ColliderSet, point: Vector, filterFlags?: QueryFilterFlags, filterGroups?: InteractionGroups, filterExcludeCollider?: ColliderHandle, filterExcludeRigidBody?: RigidBodyHandle, filterPredicate?: (collider: ColliderHandle) => boolean): PointColliderProjection | null;
    /**
     * Find all the colliders containing the given point.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param point - The point used for the containment test.
     * @param groups - The bit groups and filter associated to the point to test, in order to only
     *   test on colliders with collision groups compatible with the ray's group.
     * @param callback - A function called with the handles of each collider with a shape
     *   containing the `point`.
     */
    intersectionsWithPoint(bodies: RigidBodySet, colliders: ColliderSet, point: Vector, callback: (handle: ColliderHandle) => boolean, filterFlags?: QueryFilterFlags, filterGroups?: InteractionGroups, filterExcludeCollider?: ColliderHandle, filterExcludeRigidBody?: RigidBodyHandle, filterPredicate?: (collider: ColliderHandle) => boolean): void;
    /**
     * Casts a shape at a constant linear velocity and retrieve the first collider it hits.
     * This is similar to ray-casting except that we are casting a whole shape instead of
     * just a point (the ray origin).
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param shapePos - The initial position of the shape to cast.
     * @param shapeRot - The initial rotation of the shape to cast.
     * @param shapeVel - The constant velocity of the shape to cast (i.e. the cast direction).
     * @param shape - The shape to cast.
     * @param targetDistance − If the shape moves closer to this distance from a collider, a hit
     *                       will be returned.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the distance traveled by the shape to `shapeVel.norm() * maxToi`.
     * @param stopAtPenetration - If set to `false`, the linear shape-cast won’t immediately stop if
     *   the shape is penetrating another shape at its starting point **and** its trajectory is such
     *   that it’s on a path to exit that penetration state.
     * @param groups - The bit groups and filter associated to the shape to cast, in order to only
     *   test on colliders with collision groups compatible with this group.
     */
    castShape(bodies: RigidBodySet, colliders: ColliderSet, shapePos: Vector, shapeRot: Rotation, shapeVel: Vector, shape: Shape, targetDistance: number, maxToi: number, stopAtPenetration: boolean, filterFlags?: QueryFilterFlags, filterGroups?: InteractionGroups, filterExcludeCollider?: ColliderHandle, filterExcludeRigidBody?: RigidBodyHandle, filterPredicate?: (collider: ColliderHandle) => boolean): ColliderShapeCastHit | null;
    /**
     * Retrieve all the colliders intersecting the given shape.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param shapePos - The position of the shape to test.
     * @param shapeRot - The orientation of the shape to test.
     * @param shape - The shape to test.
     * @param groups - The bit groups and filter associated to the shape to test, in order to only
     *   test on colliders with collision groups compatible with this group.
     * @param callback - A function called with the handles of each collider intersecting the `shape`.
     */
    intersectionsWithShape(bodies: RigidBodySet, colliders: ColliderSet, shapePos: Vector, shapeRot: Rotation, shape: Shape, callback: (handle: ColliderHandle) => boolean, filterFlags?: QueryFilterFlags, filterGroups?: InteractionGroups, filterExcludeCollider?: ColliderHandle, filterExcludeRigidBody?: RigidBodyHandle, filterPredicate?: (collider: ColliderHandle) => boolean): void;
    /**
     * Finds the handles of all the colliders with an AABB intersecting the given AABB.
     *
     * @param aabbCenter - The center of the AABB to test.
     * @param aabbHalfExtents - The half-extents of the AABB to test.
     * @param callback - The callback that will be called with the handles of all the colliders
     *                   currently intersecting the given AABB.
     */
    collidersWithAabbIntersectingAabb(aabbCenter: Vector, aabbHalfExtents: Vector, callback: (handle: ColliderHandle) => boolean): void;
}

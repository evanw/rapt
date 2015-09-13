// porting notes:
//
// - a prefix of "ref_" on the variable name means it was a non-const reference in C++
//	 this is handled like so:
//
//	 // C++
//	 void func(int& foo) {
//		 foo = 2;
//	 }
//
//	 void main() {
//		 int foo;
//		 func(foo);
//		 cout << foo << endl;
//	 }
//
//	 // JavaScript
//	 function func(ref_foo) {
//		 ref_foo.ref = 2;
//	 }
//
//	 function main() {
//		 var ref_foo = {};
//		 func(ref_foo);
//		 console.log(ref_foo.ref);
//	 }
//
// - gameState is a global, so all functions that take gameState as an argument in C++ don't now




// static class CollisionDetector
function CollisionDetector() {}

var MAX_VELOCITY = 30;
var MAX_COLLISIONS = 20;
// if the collision detection system fails, what elasticity should we use?
var MAX_EMERGENCY_ELASTICITY = 0.5;
var ON_MARGIN = 0.01;
var MAX_LOS_DISTANCE_SQUARED = 625;

// how far should we push something out if there's an emergency?
var EMERGENCY_PUSH_DISTANCE = 0.1;

////////////////////////////////////////////////////////////////////////////////
// public functions
////////////////////////////////////////////////////////////////////////////////

// collisions
CollisionDetector.collideEntityWorld = function(entity, ref_deltaPosition, ref_velocity, elasticity, world, emergency) {
	return this.collideShapeWorld(entity.getShape(), ref_deltaPosition, ref_velocity, elasticity, world, entity.getColor(), emergency);
};
CollisionDetector.collideShapeWorld = function(shape, ref_deltaPosition, ref_velocity, elasticity, world, color, emergency) {
	// only chuck norris may divide by zero
	if(ref_deltaPosition.ref.lengthSquared() < 0.000000000001)
	{
		ref_deltaPosition.ref = new Vector(0, 0);
		return null;
	}

	// clamp the velocity, so this won't blow up
	// if we don't, the aabb will get too big.
	if(ref_velocity.ref.lengthSquared() > MAX_VELOCITY * MAX_VELOCITY) {
		ref_velocity.ref = ref_velocity.ref.unit().mul(MAX_VELOCITY);
	}

	// this stores the contact that happened last (if any)
	// since this can hit multiple items in a single timestep
	var lastContact = null;

	var originalDelta = ref_deltaPosition.ref;
	var originalVelocity = ref_velocity.ref;

	// try this up to a certain number of times, if we get there we are PROBABLY stuck.
	for(var i = 0; i < MAX_COLLISIONS; i++)
	{
		// check all the edges in the expanded bounding box of the swept area
		var newShape = shape.copy();
		newShape.moveBy(ref_deltaPosition.ref);
		var areaToCheck = shape.getAabb().union(newShape.getAabb());
		var edges = world.getEdgesInAabb(areaToCheck, color);

		// make a temporary new contact in case there is (another) collision
		var newContact = null;

		// see if this setting for deltaPosition causes a collision
		for (var it = 0; it < edges.length; it++)
		{
			var edge = edges[it];
			var segmentContact = this.collideShapeSegment(shape, ref_deltaPosition.ref, edge.segment);
			if(newContact === null || (segmentContact !== null && segmentContact.proportionOfDelta < newContact.proportionOfDelta)) {
				newContact = segmentContact;
			}
		}

		// if we didn't hit anything this iteration, return our last hit
		// on the first iteration, this means return NULL
		if(newContact === null)
		{
			this.emergencyCollideShapeWorld(shape, ref_deltaPosition, ref_velocity, world);
			return lastContact;
		}

		// modify the velocity to not be pointing into the edge
		var velocityPerpendicular = ref_velocity.ref.projectOntoAUnitVector(newContact.normal);
		var velocityParallel = ref_velocity.ref.sub(velocityPerpendicular);
		ref_velocity.ref = velocityParallel.add(velocityPerpendicular.mul(-elasticity));

		// push the delta-position out of the edge
		var deltaPerpendicular = ref_deltaPosition.ref.projectOntoAUnitVector(newContact.normal);
		var deltaParallel = ref_deltaPosition.ref.sub(deltaPerpendicular);

		// TODO: This was here when I ported this, but it is incorrect because it
		// stops you short of an edge, which is good except the distance from that
		// edge grows with your speed.	A correct version is after this.
		// ref_deltaPosition.ref = ref_deltaPosition.ref.mul(newContact.proportionOfDelta).projectOntoAUnitVector(newContact.normal).mul(-elasticity).add(deltaParallel).add(newContact.normal.mul(0.001));

		var proportionLeft = 1 - newContact.proportionOfDelta;
		ref_deltaPosition.ref = ref_deltaPosition.ref.mul(newContact.proportionOfDelta).add(deltaPerpendicular.mul(-elasticity*proportionLeft)).add(deltaParallel.mul(proportionLeft)).add(newContact.normal.mul(0.0001));

		// the newly found contact is now the last one
		lastContact = newContact;
	}

	if(typeof console !== 'undefined' && console.log) {
		console.log("Collision loop ran out, damn!");
	}

	// if we are all looped out, take some emergency collision prevention measures.
	ref_deltaPosition.ref = new Vector(0, 0);
	ref_velocity.ref = originalVelocity.mul(-(elasticity < MAX_EMERGENCY_ELASTICITY ? elasticity : MAX_EMERGENCY_ELASTICITY));
	if(emergency) {
		this.emergencyCollideShapeWorld(shape, {ref: originalDelta}, ref_velocity, world);
	}
	return lastContact;
};

// overlaps
CollisionDetector.overlapShapePlayers = function(shape) {
	var players = [];
	if(this.overlapShapes(gameState.playerA.getShape(), shape)) {
		players.push(gameState.playerA);
	}
	if(this.overlapShapes(gameState.playerB.getShape(), shape)) {
		players.push(gameState.playerB);
	}
	return players;
};
CollisionDetector.overlapPlayers = function() {
	return this.overlapShapes(gameState.playerA.getShape(), gameState.playerB.getShape());
};

// on-edges
CollisionDetector.onEntityWorld = function(entity, edgeQuad, world) {
	this.penetrationEntityWorld(entity, edgeQuad, world);
	edgeQuad.throwOutIfGreaterThan(ON_MARGIN);
};

// line of sight
CollisionDetector.lineOfSightWorld = function(eye, target, world) {
	// if the target is too far, we can't see it
	if(target.sub(eye).lengthSquared() > (MAX_LOS_DISTANCE_SQUARED)) {
		return null;
	}

	var edges = world.getEdgesInAabb(new AABB(eye, target), EDGE_ENEMIES);
	var minLosProportion = 1.1;
	var ref_edgeProportion = {};  // throwaway
	var ref_contactPoint = {};	// throwaway
	var firstEdge = null;
	for (var it = 0; it < edges.length; it++)
	{
		// this is only for edges that face towards the eye
		if(target.sub(eye).dot(edges[it].segment.normal) >= 0) {
			continue;
		}

		// find the edge closest to the viewer
		var ref_losProportion = {};

		// if the LOS is not blocked by this edge, then ignore this edge
		if(!this.intersectSegments(new Segment(eye, target), edges[it].segment, ref_losProportion, ref_edgeProportion, ref_contactPoint)) {
			continue;
		}

		// if another edge was already closer, ignore this edge
		if(ref_losProportion.ref >= minLosProportion) {
			continue;
		}

		// otherwise this is the closest edge to the eye
		minLosProportion = ref_losProportion.ref;
		firstEdge = edges[it];
	}

	return firstEdge;
};

// puts the closest point in the world into worldpoint and the one on the shape
// to shapepoint, returns the distance to the closest point in the world to the shape
// will always find any point within radius of any point on the shape, may find ones farther out
// returns infinity if nothing was found within radius
CollisionDetector.closestToEntityWorld = function(entity, radius, ref_shapePoint, ref_worldPoint, world) {
	var shape = entity.getShape();
	var boundingBox = shape.getAabb().expand(radius);
	var edges = world.getEdgesInAabb(boundingBox, entity.getColor());

	var distance = Number.POSITIVE_INFINITY;
	for (var it = 0; it < edges.length; it++)
	{
		var ref_thisShapePoint = {}, ref_thisWorldPoint = {};
		var thisDistance = this.closestToShapeSegment(shape, ref_thisShapePoint, ref_thisWorldPoint, edges[it].segment);
		if(thisDistance < distance)
		{
			distance = thisDistance;
			ref_shapePoint.ref = ref_thisShapePoint.ref;
			ref_worldPoint.ref = ref_thisWorldPoint.ref;
		}
	}
	return distance;
};

CollisionDetector.containsPointShape = function(point, shape) {
	switch(shape.getType())
	{
	case SHAPE_CIRCLE:
		return (point.sub(shape.center).lengthSquared() < shape.radius * shape.radius);

	case SHAPE_AABB:
		return (point.x >= shape.lowerLeft.x &&
			   point.x <= shape.lowerLeft.x + shape.size.x &&
			   point.y >= shape.lowerLeft.y &&
			   point.y <= shape.lowerLeft.y + shape.size.y);

	case SHAPE_POLYGON:
		var len = shape.vertices.length;
		for (var i = 0; i < len; ++i) {
			// Is this point outside this edge?  if so, it's not inside the polygon
			if (point.sub(shape.vertices[i].add(shape.center)).dot(shape.segments[i].normal) > 0) {
				return false;
			}
		}
		// if the point was inside all of the edges, then it's inside the polygon.
		return true;
	}

	alert('assertion failed in CollisionDetector.containsPointShape');
};

// intersect, disregards entity color
CollisionDetector.intersectEntitySegment = function(entity, segment) {
	return this.intersectShapeSegment(entity.getShape(), segment);
};

////////////////////////////////////////////////////////////////////////////////
// private functions
////////////////////////////////////////////////////////////////////////////////

// INTERSECTIONS
CollisionDetector.intersectSegments = function(segment0, segment1, ref_segmentProportion0, ref_segmentProportion1, ref_contactPoint) {
	var segStart0 = segment0.start;
	var segEnd0 = segment0.end;
	var segSize0 = segEnd0.sub(segStart0);
	var segStart1 = segment1.start;
	var segEnd1 = segment1.end;
	var segSize1 = segEnd1.sub(segStart1);

	// make sure these aren't parallel
	if(Math.abs(segSize0.dot(segSize1.flip())) < 0.000001) {
		return false;
	}

	// calculate the point of intersection...
	ref_segmentProportion0.ref = ((segStart1.y - segStart0.y) * segSize1.x + (segStart0.x - segStart1.x) * segSize1.y) /
		(segSize0.y  * segSize1.x - segSize1.y * segSize0.x);
	ref_segmentProportion1.ref = ((segStart0.y - segStart1.y) * segSize0.x + (segStart1.x - segStart0.x) * segSize0.y) /
		(segSize1.y * segSize0.x - segSize0.y  * segSize1.x);

	// where do these actually meet?
	ref_contactPoint.ref = segStart0.add(segSize0.mul(ref_segmentProportion0.ref));

	// make sure the point of intersection is inside segment0
	if(ref_segmentProportion0.ref < 0 || ref_segmentProportion0.ref > 1) {
		return false;
	}

	// make sure the point of intersection is inside segment1
	if(ref_segmentProportion1.ref < 0 || ref_segmentProportion1.ref > 1) {
		return false;
	}

	// now that we've checked all this, the segments do intersect.
	return true;
};
CollisionDetector.intersectCircleLine = function(circle, line, ref_lineProportion0, ref_lineProportion1) {
	// variables taken from http://local.wasp.uwa.edu.au/~pbourke/geometry/sphereline/
	// thanks, internet!

	var lineStart = line.start;
	var lineEnd = line.end;
	var lineSize = lineEnd.sub(lineStart);

	// find quadratic equation variables
	var a = lineSize.lengthSquared();
	var b = 2 * lineSize.dot(lineStart.sub(circle.center));
	var c = lineStart.sub(circle.center).lengthSquared() - circle.radius * circle.radius;

	var insideSqrt = b * b - 4 * a * c;
	if(insideSqrt < 0) {
		return false;
	}

	// calculate the point of intersection...
	ref_lineProportion0.ref = (-b - Math.sqrt(insideSqrt)) * 0.5 / a;
	ref_lineProportion1.ref = (-b + Math.sqrt(insideSqrt)) * 0.5 / a;

	return true;
};
CollisionDetector.intersectShapeSegment = function(shape, segment) {
	switch(shape.getType())
	{
	case SHAPE_CIRCLE:
		return this.intersectCircleSegment(shape, segment);

	case SHAPE_AABB:
		return this.intersectPolygonSegment(shape.getPolygon(), segment);

	case SHAPE_POLYGON:
		return this.intersectPolygonSegment(shape, segment);
	}

	alert('assertion failed in CollisionDetector.intersectShapeSegment');
};
CollisionDetector.intersectCircleSegment = function(circle, segment) {
	var ref_lineProportion0 = {}, ref_lineProportion1 = {};
	if(!this.intersectCircleLine(circle, segment, ref_lineProportion0, ref_lineProportion1)) {
		return false;
	}

	if(ref_lineProportion0.ref >= 0 && ref_lineProportion0.ref <= 1) {
		return true;
	}

	return (ref_lineProportion1.ref >= 0 && ref_lineProportion1.ref <= 1);
};
CollisionDetector.intersectPolygonSegment = function(polygon, segment) {
	// may fail on large enemies (if the segment is inside)

	var ref_segmentProportion0 = {}, ref_segmentProportion1 = {}, ref_contactPoint = {};
	for(var i = 0; i < polygon.vertices.length; i++) {
		if(this.intersectSegments(polygon.getSegment(i), segment, ref_segmentProportion0, ref_segmentProportion1, ref_contactPoint)) {
			return true;
		}
	}

	return false;
};

// COLLISIONS
CollisionDetector.collideShapeSegment = function(shape, deltaPosition, segment) {
	var segmentNormal = segment.normal;

	// if the shape isn't traveling into this edge, then it can't collide with it
	if(deltaPosition.dot(segmentNormal) > 0.0) {
		return null;
	}

	switch(shape.getType())
	{
	case SHAPE_CIRCLE:
		return this.collideCircleSegment(shape, deltaPosition, segment);

	case SHAPE_AABB:
		return this.collidePolygonSegment(shape.getPolygon(), deltaPosition, segment);

	case SHAPE_POLYGON:
		return this.collidePolygonSegment(shape, deltaPosition, segment);
	}

	alert('assertion failed in CollisionDetector.collideShapeSegment');
};
CollisionDetector.collideCircleSegment = function(circle, deltaPosition, segment) {
	var segmentNormal = segment.normal;

	// a directed radius towards the segment
	var radiusToLine = segmentNormal.mul(-circle.radius);

	// position of this circle after being moved
	var newCircle = new Circle(circle.center.add(deltaPosition), circle.radius);

	// the point on the new circle farthest "in" this segment
	var newCircleInnermost = newCircle.center.add(radiusToLine);

	var endedInside = newCircleInnermost.sub(segment.start).dot(segmentNormal) < 0.001;

	// if the circle didn't end inside this segment, then it's not a collision.
	if(!endedInside) {
		return null;
	}

	// the point on the circle farthest "in" this segment, before moving
	var circleInnermost = newCircleInnermost.sub(deltaPosition);

	// did this circle start completely outside this segment?
	var startedOutside = circleInnermost.sub(segment.start).dot(segmentNormal) > 0;

	// if the circle started outside this segment, then it might have hit the flat part of this segment
	if(startedOutside) {
		var ref_segmentProportion = {}, ref_proportionOfDelta = {}, ref_contactPoint = {};
		if(this.intersectSegments(segment, new Segment(circleInnermost, newCircleInnermost), ref_segmentProportion, ref_proportionOfDelta, ref_contactPoint)) {
			// we can return this because the circle will always hit the flat part before it hits an end
			return new Contact(ref_contactPoint.ref, segmentNormal, ref_proportionOfDelta.ref);
		}
	}

	// get the contacts that occurred when the edge of the circle hit an endpoint of this edge.
	var startContact = this.collideCirclePoint(circle, deltaPosition, segment.start);
	var endContact = this.collideCirclePoint(circle, deltaPosition, segment.end);

	// select the collision that occurred first
	if(!startContact && !endContact) { return null; }
	if(startContact && !endContact) { return startContact; }
	if(!startContact && endContact) { return endContact; }
	if(startContact.proportionOfDelta < endContact.proportionOfDelta) { return startContact; }
	return endContact;
};
CollisionDetector.collideCirclePoint = function(circle, deltaPosition, point) {
	// deltaProportion1 is a throwaway
	// we can only use segmentProportion0 because segmentProportion1 represents the intersection
	// when the circle travels so that the point moves OUT of it, so we don't want to stop it from doing that.
	var ref_deltaProportion0 = {}, ref_deltaProportion1 = {};

	// BUGFIX: shock hawks were disappearing on Traps when deltaPosition was very small, which caused
	// us to try to solve a quadratic with a second order coefficient of zero and put NaNs everywhere
	var delta = deltaPosition.length();
	if (delta < 0.0000001) {
		return false;
	}

	// if these don't intersect at all, then forget about it.
	if(!this.intersectCircleLine(circle, new Segment(point, point.sub(deltaPosition)), ref_deltaProportion0, ref_deltaProportion1)) {
		return null;
	}

	// check that this actually happens inside of the segment.
	if(ref_deltaProportion0.ref < 0 || ref_deltaProportion0.ref > 1) {
		return null;
	}

	// find where the circle will be at the time of the collision
	var circleCenterWhenCollides = circle.center.add(deltaPosition.mul(ref_deltaProportion0.ref));

	return new Contact(point, circleCenterWhenCollides.sub(point).unit(), ref_deltaProportion0.ref);
};
CollisionDetector.collidePolygonSegment = function(polygon, deltaPosition, segment) {
	// use these for storing parameters about the collision.
	var ref_edgeProportion = {}; // throwaway
	var ref_deltaProportion = {}; // how far into the timestep we get before colliding
	var ref_contactPoint = {}; // where we collide

	// if this was touching the segment before, NO COLLISION
	if(this.intersectPolygonSegment(polygon, segment)) {
		return null;
	}

	// the first instance of contact
	var firstContact = null;
	var i;

	// for each side of the polygon, check the edge's endpoints for a collision
	for(i = 0; i < polygon.vertices.length; i++)
	{
		var edgeEndpoints = [segment.start, segment.end];
		var edgeMiddle = segment.start.add(segment.end).div(2);

		// for each endpoint of the edge
		for(var j = 0; j < 2; j++)
		{
			var polygonSegment = polygon.getSegment(i);
			// if the polygon is trying to pass out of the edge, no collision
			if(polygonSegment.normal.dot(edgeEndpoints[j].sub(edgeMiddle)) > 0) {
				continue;
			}

			// if these don't intersect, ignore this edge
			if(!this.intersectSegments(polygonSegment,
									  new Segment(edgeEndpoints[j], edgeEndpoints[j].sub(deltaPosition)),
									  ref_edgeProportion, ref_deltaProportion, ref_contactPoint)) {
				continue;
			}

			// if this contact is sooner, or if there wasn't one before, then we'll use this one
			if(!firstContact || ref_deltaProportion.ref < firstContact.proportionOfDelta) {
				firstContact = new Contact(ref_contactPoint.ref, polygonSegment.normal.mul(-1), ref_deltaProportion.ref);
			}
		}
	}

	// for each point of the polygon, check for a collision
	for(i = 0; i < polygon.vertices.length; i++)
	{
        var vertex = polygon.getVertex(i);
		// if these don't intersect, ignore this edge
		if(!this.intersectSegments(segment, new Segment(vertex, vertex.add(deltaPosition)), ref_edgeProportion, ref_deltaProportion, ref_contactPoint)) {
			continue;
		}

		// if this contact is sooner, or if there wasn't one before, then we'll use this one
		if(!firstContact || ref_deltaProportion.ref < firstContact.proportionOfDelta) {
			firstContact = new Contact(ref_contactPoint.ref, segment.normal, ref_deltaProportion.ref);
		}
	}

	// return the first instance of contact
	return firstContact;
};

// EMERGENCY COLLISIONS, PREVENTS FALLING THROUGH FLOORS
CollisionDetector.emergencyCollideShapeWorld = function(shape, ref_deltaPosition, ref_velocity, world) {
	// do we need to push this shape anywhere?
	var push = false;

	var newShape = shape.copy();
	newShape.moveBy(ref_deltaPosition.ref);

	if(newShape.getAabb().getBottom() < 0) { push = true; }
	if(newShape.getAabb().getTop() > world.height) { push = true; }
	if(newShape.getAabb().getLeft() < 0) { push = true; }
	if(newShape.getAabb().getRight() > world.width) { push = true; }

	if(!push)
	{
		var cells = world.getCellsInAabb(newShape.getAabb());
		for (var it = 0; it < cells.length; it++)
		{
			var cellShape = cells[it].getShape();
			if(!cellShape) {
				continue;
			}

			if(this.overlapShapes(newShape, cellShape))
			{
				push = true;
				break;
			}
		}
	}

	if(push)
	{
		var minX = Math.floor(newShape.getCenter().x) - 3;
		var maxX = Math.floor(newShape.getCenter().x) + 3;
		var minY = Math.floor(newShape.getCenter().y) - 3;
		var maxY = Math.floor(newShape.getCenter().y) + 3;

		// find the closest open square, push toward that
		var bestSafety = world.safety;
		for(var x = minX; x <= maxX; x++)
		{
			for(var y = minY; y <= maxY; y++)
			{
				// if this cell doesn't exist or has a shape in it, not good to push towards.
				if(!world.getCell(x, y) || world.getCell(x, y).type != CELL_EMPTY) {
					continue;
				}

				// loop through centers of squares and replace if closer
				var candidateSafety = new Vector(x + 0.5, y + 0.5);
				if(candidateSafety.sub(newShape.getCenter()).lengthSquared() < bestSafety.sub(newShape.getCenter()).lengthSquared()) {
					bestSafety = candidateSafety;
				}
			}
		}

		newShape.moveBy(bestSafety.sub(newShape.getCenter()).unit().mul(EMERGENCY_PUSH_DISTANCE));
		ref_deltaPosition.ref = newShape.getCenter().sub(shape.getCenter());

		// REMOVED TO PREVENT STOPPING WHEELIGATORS / THE PLAYER
		// ref_velocity.ref = new Vector(0, 0);
	}
};

// OVERLAPS
CollisionDetector.overlapShapes = function(shape0, shape1) {
	var shapeTempPointer = null;
	var shape0Pointer = shape0.copy();
	var shape1Pointer = shape1.copy();

	// convert aabb's to polygons
	if(shape0Pointer.getType() == SHAPE_AABB)
	{
		shapeTempPointer = shape0Pointer;
		shape0Pointer = shape0Pointer.getPolygon();
	}
	if(shape1Pointer.getType() == SHAPE_AABB)
	{
		shapeTempPointer = shape1Pointer;
		shape1Pointer = shape1Pointer.getPolygon();
	}

	// swap the shapes so that they're in order
	if(shape0Pointer.getType() > shape1Pointer.getType())
	{
		shapeTempPointer = shape1Pointer;
		shape1Pointer = shape0Pointer;
		shape0Pointer = shapeTempPointer;
	}

	var result;
	var shape0Type = shape0Pointer.getType();
	var shape1Type = shape1Pointer.getType();

	// if they're both circles
	if(shape0Type == SHAPE_CIRCLE && shape1Type == SHAPE_CIRCLE) {
		result = this.overlapCircles(shape0Pointer, shape1Pointer);
	}

	// if one is a circle and one is a polygon
	else if(shape0Type == SHAPE_CIRCLE && shape1Type == SHAPE_POLYGON) {
		result = this.overlapCirclePolygon(shape0Pointer, shape1Pointer);
	}

	// if both are polygons
	else if(shape0Type == SHAPE_POLYGON && shape1Type == SHAPE_POLYGON) {
		result = this.overlapPolygons(shape0Pointer, shape1Pointer);
	}

	// we would only get here if we received an impossible pair of shapes.
	else {
		alert('assertion failed in CollisionDetector.overlapShapes');
	}

	return result;
};
CollisionDetector.overlapCircles = function(circle0, circle1) {
	return circle1.getCenter().sub(circle0.getCenter()).lengthSquared() <= (circle0.radius + circle1.radius) * (circle0.radius + circle1.radius);
};
CollisionDetector.overlapCirclePolygon = function(circle, polygon) {
	// see if any point on the border of the the polygon is in the circle
	var len = polygon.vertices.length;
	for(var i = 0; i < len; ++i)
	{
		// if a segment of the polygon crosses the edge of the circle
		if(this.intersectCircleSegment(circle, polygon.getSegment(i))) {
			return true;
		}

		// if a vertex of the polygon is inside the circle
		if(polygon.getVertex(i).sub(circle.center).lengthSquared() < circle.radius * circle.radius) {
			return true;
		}
	}

	// otherwise, the circle could be completely inside the polygon
	var point = circle.center;
	for (var i = 0; i < len; ++i) {
		// Is this point outside this edge?  if so, it's not inside the polygon
		if (point.sub(polygon.vertices[i].add(polygon.center)).dot(polygon.segments[i].normal) > 0) {
			return false;
		}
	}
	// if the point was inside all of the edges, then it's inside the polygon.
	return true;
};

CollisionDetector.overlapPolygons = function(polygon0, polygon1) {
	var i;
	var len0 = polygon0.vertices.length;
	var len1 = polygon1.vertices.length;

	// see if any corner of polygon 0 is inside of polygon 1
	for(i = 0; i < len0; ++i) {
		if(this.containsPointPolygon(polygon0.vertices[i].add(polygon0.center), polygon1)) {
			return true;
		}
	}

	// see if any corner of polygon 1 is inside of polygon 0
	for(i = 0; i < len1; ++i) {
		if(this.containsPointPolygon(polygon1.vertices[i].add(polygon1.center), polygon0)) {
			return true;
		}
	}

	return false;
};

// CONTAINS
CollisionDetector.containsPointPolygon = function(point, polygon) {
	var len = polygon.vertices.length;
	for (var i = 0; i < len; ++i) {
		// Is this point outside this edge?  if so, it's not inside the polygon
		if (point.sub(polygon.vertices[i].add(polygon.center)).dot(polygon.segments[i].normal) > 0) {
			return false;
		}
	}
	// if the point was inside all of the edges, then it's inside the polygon.
	return true;
};

// DISTANCES
CollisionDetector.distanceShapeSegment = function(shape, segment) {
	// if the two are intersecting, the distance is obviously 0
	if(this.intersectShapeSegment(shape, segment)) {
		return 0;
	}

	var ref_shapePoint = {}, ref_worldPoint = {};
	return this.closestToShapeSegment(shape, ref_shapePoint, ref_worldPoint, segment);
};
CollisionDetector.distanceShapePoint = function(shape, point) {
	switch(shape.getType())
	{
	case SHAPE_CIRCLE:
		return this.distanceCirclePoint(shape, point);

	case SHAPE_AABB:
		return this.distancePolygonPoint(shape.getPolygon(), point);

	case SHAPE_POLYGON:
		return this.distancePolygonPoint(shape, point);
	}

	alert('assertion failed in CollisionDetector.distanceShapePoint');
};
CollisionDetector.distanceCirclePoint = function(circle, point) {
	var distance = circle.center.sub(point).length();
	return distance > circle.radius ? distance - circle.radius : 0;
};
CollisionDetector.distancePolygonPoint = function(polygon, point) {
	var ref_polygonEdgeProportion = {}, ref_distanceProportion = {};
	var ref_closestPointOnPolygonEdge = {};	   //throwaway
	var distance = Number.POSITIVE_INFINITY;

	// see how close each endpoint of the segment is to a point on the middle of a polygon edge
	for(var i = 0; i < polygon.vertices.length; i++)
	{
		var polygonSegment = polygon.getSegment(i);

		// find where this segment endpoint projects onto the polygon edge
		this.intersectSegments(polygonSegment, new Segment(point, point.add(polygonSegment.normal)), ref_polygonEdgeProportion, ref_distanceProportion, ref_closestPointOnPolygonEdge);

		// if this projects beyond the endpoints of the polygon's edge, ignore it
		if(ref_polygonEdgeProportion.ref < 0 || ref_polygonEdgeProportion.ref > 1) {
			continue;
		}

		var thisDistance = Math.abs(ref_distanceProportion.ref);

		if(thisDistance < distance) {
			distance = thisDistance;
		}
	}

	return distance;
};

// CLOSEST TO
CollisionDetector.closestToShapeSegment = function(shape, ref_shapePoint, ref_segmentPoint, segment) {
	switch(shape.getType())
	{
	case SHAPE_CIRCLE:
		return this.closestToCircleSegment(shape, ref_shapePoint, ref_segmentPoint, segment);

	case SHAPE_AABB:
		return this.closestToPolygonSegment(shape.getPolygon(), ref_shapePoint, ref_segmentPoint, segment);

	case SHAPE_POLYGON:
		return this.closestToPolygonSegment(shape, ref_shapePoint, ref_segmentPoint, segment);
	}

	alert('assertion failed in CollisionDetector.closestToShapeSegment');
};
CollisionDetector.closestToCircleSegment = function(circle, ref_shapePoint, ref_segmentPoint, segment) {
	// see if the closest point is in the middle of the segment
	var ref_segmentProportion = {}, ref_projectProportion = {};
	this.intersectSegments(segment, new Segment(circle.center, circle.center.sub(segment.normal)), ref_segmentProportion, ref_projectProportion, ref_segmentPoint);

	// if the closest point is in the middle of the segment
	if(ref_segmentProportion.ref >= 0 && ref_segmentProportion.ref <= 1)
	{
		// this returns the distance of the circle from the segment, along the normal
		// since the normal is a unit vector and is also the shortest path, this works.
		ref_shapePoint.ref = circle.center.sub(segment.normal.mul(circle.radius * (ref_projectProportion.ref > 0 ? 1 : -1)));
		return ref_segmentPoint.ref.sub(circle.center).length() - circle.radius;
	}

	// otherwise, the closest point is one of the ends
	var distanceSquaredToStart = circle.center.sub(segment.start).lengthSquared();
	var distanceSquaredToEnd = circle.center.sub(segment.end).lengthSquared();

	// if the start is closer, use it
	if(distanceSquaredToStart < distanceSquaredToEnd)
	{
		ref_segmentPoint.ref = segment.start;
		// this was WAY off in the version before the port, was relative to circle.center instead of absolute:
		ref_shapePoint.ref = circle.center.add(ref_segmentPoint.ref.sub(circle.center).unit().mul(circle.radius));
		return Math.sqrt(distanceSquaredToStart) - circle.radius;
	}

	// otherwise, the end is closer
	ref_segmentPoint.ref = segment.end;
	// this was WAY off in the version before the port, was relative to circle.center instead of absolute:
	ref_shapePoint.ref = circle.center.add(ref_segmentPoint.ref.sub(circle.center).unit().mul(circle.radius));
	return Math.sqrt(distanceSquaredToEnd) - circle.radius;
};
CollisionDetector.closestToPolygonSegment = function(polygon, ref_shapePoint, ref_segmentPoint, segment) {
	var distance = Number.POSITIVE_INFINITY;
	var thisDistance;

	// check every pair of points for distance
	for(var i = 0; i < polygon.vertices.length; i++)
	{
		var polygonPoint = polygon.getVertex(i);

		for(var j = 0; j < 2; j++)
		{
			var thisSegmentPoint = j == 0 ? segment.start : segment.end;
			thisDistance = polygonPoint.sub(thisSegmentPoint).length();

			if(thisDistance < distance)
			{
				distance = thisDistance;
				ref_segmentPoint.ref = thisSegmentPoint;
				ref_shapePoint.ref = polygonPoint;
			}
		}
	}

	var ref_edgeProportion = {}, ref_polygonDistanceProportion = {}, ref_closestPoint = {};

	// see how close each vertex of the polygon is to a point in the middle of the edge
	for(var i = 0; i < polygon.vertices.length; i++)
	{
		var polygonPoint = polygon.getVertex(i);

		// find where this polygon vertex projects onto the edge
		this.intersectSegments(segment, new Segment(polygonPoint, polygonPoint.sub(segment.normal)), ref_edgeProportion, ref_polygonDistanceProportion, ref_closestPoint);

		// if this projects beyond the endpoints of the edge, ignore it
		if(ref_edgeProportion.ref < 0 || ref_edgeProportion.ref > 1) {
			continue;
		}

		// the distance along the normal of the segment from the segment to this vertex of the polygon
		thisDistance = Math.abs(ref_polygonDistanceProportion.ref);

		// if this is the closest we've found, use this
		if(thisDistance < distance)
		{
			distance = thisDistance;
			ref_segmentPoint.ref = ref_closestPoint.ref;
			ref_shapePoint.ref = polygonPoint;
		}

	}

	var ref_polygonEdgeProportion = {}, ref_distanceProportion = {};

	// see how close each endpoint of the segment is to a point on the middle of a polygon edge
	for(var i = 0; i < polygon.vertices.length; i++)
	{
		var polygonSegment = polygon.getSegment(i);

		for(var j = 0; j < 2; j++)
		{
			var thisSegmentPoint = j == 0 ? segment.start : segment.end;

			// find where this segment endpoint projects onto the polygon edge
			this.intersectSegments(polygonSegment, new Segment(thisSegmentPoint, thisSegmentPoint.add(polygonSegment.normal)), ref_polygonEdgeProportion, ref_distanceProportion, ref_closestPoint);

			// if this projects beyond the endpoints of the polygon's edge, ignore it
			if(ref_polygonEdgeProportion.ref < 0 || ref_polygonEdgeProportion.ref > 1) {
				continue;
			}

			thisDistance = Math.abs(ref_distanceProportion.ref);

			if(thisDistance < distance)
			{
				distance = thisDistance;
				ref_segmentPoint.ref = thisSegmentPoint;
				ref_shapePoint.ref = ref_closestPoint.ref;
			}
		}

	}

	return distance;
};

// PENETRATIONS
CollisionDetector.penetrationEntityWorld = function(entity, edgeQuad, world) {
	var shape = entity.getShape();

	edgeQuad.nullifyEdges();

	var edges = world.getEdgesInAabb(shape.getAabb().expand(0.1), entity.getColor());
	for (var it = 0; it < edges.length; it++)
	{
		// if the polygon isn't close to this segment, forget about it
		var thisDistance = this.distanceShapeSegment(shape, edges[it].segment);
		if(thisDistance > 0.01) {
			continue;
		}

		// if the penetration is negative, ignore this segment
		var thisPenetration = this.penetrationShapeSegment(shape, edges[it].segment);
		if(thisPenetration < 0) {
			continue;
		}

		edgeQuad.minimize(edges[it], thisPenetration);
	}
};
CollisionDetector.penetrationShapeSegment = function(shape, segment) {
	switch(shape.getType())
	{
	case SHAPE_CIRCLE:
		return this.penetrationCircleSegment(shape, segment);

	case SHAPE_AABB:
		return this.penetrationPolygonSegment(shape.getPolygon(), segment);

	case SHAPE_POLYGON:
		return this.penetrationPolygonSegment(shape, segment);
	}

	alert('assertion failed in CollisionDetector.penetrationShapeSegment');
};
CollisionDetector.penetrationCircleSegment = function(circle, segment) {
	// a directed radius towards the segment
	var radiusToLine = segment.normal.mul(-circle.radius);

	// position on the circle closest to the inside of the line
	var innermost = circle.center.add(radiusToLine);

	// map this onto the normal.
	return innermost.sub(segment.start).dot(segment.normal);
};
CollisionDetector.penetrationPolygonSegment = function(polygon, segment) {
	var innermost = Number.POSITIVE_INFINITY;
	var ref_edgeProportion = {}, ref_penetrationProportion = {}, ref_closestPointOnSegment = {};

	// check the penetration of each vertex of the polygon
	for(var i = 0; i < polygon.vertices.length; i++)
	{
        var vertex = polygon.getVertex(i);
		// find where this polygon point projects onto the segment
		this.intersectSegments(
				segment,
				new Segment(vertex, vertex.sub(segment.normal)),
				ref_edgeProportion, ref_penetrationProportion, ref_closestPointOnSegment);

		// if this point projects onto the segment outside of its endpoints, don't consider this point to be projected
		// into this edge
		if(ref_edgeProportion.ref < 0 || ref_edgeProportion.ref > 1) {
			continue;
		}

		// the penetration of this vertex
		if(ref_penetrationProportion.ref < innermost) {
			innermost = ref_penetrationProportion.ref;
		}
	}

	return innermost;
};

// @ts-check
/**
 * Verlet Integration Physics Engine
 * Based on: https://code.tutsplus.com/simulate-tearable-cloth-and-ragdolls-with-simple-verlet-integration--gamedev-519t
 *
 * A simple, stable physics engine for two-point tow-trailer simulations.
 * Uses Verlet Integration with constraint solving via relaxation.
 */

export class PointMass {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {boolean} [pinned]
	 */
	constructor(x, y, pinned = false) {
		this.x = x
		this.y = y
		this.lastX = x
		this.lastY = y
		this.accX = 0
		this.accY = 0
		this.pinX = pinned ? x : null
		this.pinY = pinned ? y : null
		this.damping = 1
	}

	/**
	 * Update position using Verlet Integration
	 * @param {number} deltaTime
	 */
	update(deltaTime) {
		if (this.pinX != null) {
			this.x = this.pinX
		}
		if (this.pinY != null) {
			this.y = this.pinY
		}

		// Apply inertia: velocity is difference between current and last position
		const velX = this.x - this.lastX
		const velY = this.y - this.lastY

		// Store current position as last position
		this.lastX = this.x
		this.lastY = this.y

		// Apply acceleration and inertia
		const timestepSq = deltaTime * deltaTime
		this.x += velX * this.damping + this.accX * timestepSq
		this.y += velY * this.damping + this.accY * timestepSq

		// Reset acceleration (gravity will be reapplied each frame)
		this.accX = 0
		this.accY = 0
	}

	/**
	 * Add acceleration (e.g., gravity)
	 * @param {number} forceX
	 * @param {number} forceY
	 */
	addForce(forceX, forceY) {
		this.accX += forceX
		this.accY += forceY
	}

	/**
	 * Constrain to boundaries
	 * @param {number} minX
	 * @param {number} minY
	 * @param {number} maxX
	 * @param {number} maxY
	 */
	constrainToBox(minX, minY, maxX, maxY) {
		if (this.x < minX) {
			this.x = minX
			if (this.lastX < minX) this.lastX = minX
		}
		if (this.x > maxX) {
			this.x = maxX
			if (this.lastX > maxX) this.lastX = maxX
		}
		if (this.y < minY) {
			this.y = minY
			if (this.lastY < minY) this.lastY = minY
		}
		if (this.y > maxY) {
			this.y = maxY
			if (this.lastY > maxY) this.lastY = maxY
		}
	}
}

export class LinkConstraint {
	/**
	 * @param {PointMass} p1
	 * @param {PointMass} p2
	 * @param {number | null} [restingDistance]
	 * @param {number} [stiffness]
	 * @param {number | null} [tearDistance]
	 * @param {boolean} [rigid]
	 */
	constructor(p1, p2, restingDistance = null, stiffness = 0.95, tearDistance = null, rigid = true) {
		this.p1 = p1
		this.p2 = p2
		this.restingDistance = restingDistance || this.calculateDistance(p1, p2)
		this.stiffness = stiffness
		this.tearDistance = tearDistance || this.restingDistance * 1.5
		this.isTorn = false
		this.rigid = rigid
	}

	/**
	 * @param {PointMass} p1
	 * @param {PointMass} p2
	 * @returns {number}
	 */
	calculateDistance(p1, p2) {
		const dx = p1.x - p2.x
		const dy = p1.y - p2.y
		return Math.sqrt(dx * dx + dy * dy)
	}

	/** Solve the distance constraint */
	solve() {
		if (this.isTorn) return

		const diffX = this.p1.x - this.p2.x
		const diffY = this.p1.y - this.p2.y
		const d = Math.sqrt(diffX * diffX + diffY * diffY)

		if (d > this.tearDistance) {
			this.isTorn = true
			return
		}

		// Prevent division by zero
		if (d === 0) return

		// If not rigid (rope), only apply correction if stretched beyond resting distance
		if (!this.rigid && d < this.restingDistance) return

		// Calculate how much to move each point
		const difference = (this.restingDistance - d) / d

		// If one point is pinned, the other moves the full distance
		// If both are free, they share the movement (0.5 each)
		let p1Scale = 0.5
		let p2Scale = 0.5

		if (this.p1.pinX !== null || this.p1.pinY !== null) {
			p1Scale = 0
			p2Scale = 1
		} else if (this.p2.pinX !== null || this.p2.pinY !== null) {
			p1Scale = 1
			p2Scale = 0
		}

		const offset = difference * this.stiffness

		const offsetX = diffX * offset
		const offsetY = diffY * offset

		this.p1.x += offsetX * p1Scale
		this.p1.y += offsetY * p1Scale
		this.p2.x -= offsetX * p2Scale
		this.p2.y -= offsetY * p2Scale
	}
}

export class TowTrailer {
	/**
	 * @param {number} towX
	 * @param {number} towY
	 * @param {number} trailX
	 * @param {number} trailY
	 * @param {number} [ropeLength]
	 */
	constructor(towX, towY, trailX, trailY, ropeLength) {
		ropeLength ??= ((towX - trailX) ** 2 + (towY - trailY) ** 2) ** (1 / 2)
		this.towPoint = new PointMass(towX, towY, false)
		this.trailPoint = new PointMass(trailX, trailY, false)
		// High tear distance to prevent accidental tearing
		this.rope = new LinkConstraint(this.towPoint, this.trailPoint, ropeLength, 1, ropeLength * 100, false)
	}

	/**
	 * Update physics
	 * @param {number} deltaTime
	 */
	update(deltaTime) {
		// Only update trail point - tow point is controlled externally
		this.trailPoint.update(deltaTime)
	}

	/** Solve rope constraint */
	solveConstraints() {
		this.rope.solve()
	}

	/**
	 * Apply gravity
	 * @param {number} gravity
	 */
	applyGravity(gravity) {
		// Only apply gravity to trail point - tow point is controlled externally
		this.trailPoint.addForce(0, gravity)
	}

	/**
	 * Constrain to box
	 * @param {number} minX
	 * @param {number} minY
	 * @param {number} maxX
	 * @param {number} maxY
	 */
	constrainToBox(minX, minY, maxX, maxY) {
		// Only constrain trail point - tow point is controlled externally
		this.trailPoint.constrainToBox(minX, minY, maxX, maxY)
	}

	/**
	 * Get the tow point
	 * @returns {PointMass}
	 */
	getTowPoint() {
		return this.towPoint
	}

	/**
	 * Get the trail point
	 * @returns {PointMass}
	 */
	getTrailPoint() {
		return this.trailPoint
	}

	/**
	 * Pull the tow point in a given direction
	 * @param {number} directionDegrees Direction in degrees (0 = up, 90 = east, 180 = down, 270 = west)
	 * @param {number} [force] Magnitude of the pulling force
	 */
	pull(directionDegrees, force = 1) {
		const radians = (directionDegrees * Math.PI) / 180
		const forceX = Math.sin(radians) * force
		const forceY = -Math.cos(radians) * force
		this.towPoint.addForce(forceX, forceY)
	}
}

export class VerletEngine {
	/**
	 * @param {number} width
	 * @param {number} height
	 * @param {number} [gravity]
	 */
	constructor(width, height, gravity = 0.3) {
		this.width = width
		this.height = height
		this.gravity = gravity
		/** @type {TowTrailer[]} */
		this.bodies = []
		this.constraintIterations = 3
		this.timestep = 0.016 // ~60 FPS
		this.leftoverTime = 0
	}

	/** @param {TowTrailer} body */
	addBody(body) {
		this.bodies.push(body)
	}

	/** @param {number} deltaTime */
	update(deltaTime) {
		this.leftoverTime += deltaTime
		const timesteps = Math.floor(this.leftoverTime / this.timestep)
		this.leftoverTime -= timesteps * this.timestep

		for (let i = 0; i < timesteps; ++i) {
			this.#physicsUpdate()
		}
	}

	#physicsUpdate() {
		for (const body of this.bodies) {
			body.applyGravity(this.gravity)
			body.update(this.timestep)
		}

		// Solve constraints multiple times for stability
		for (let i = 0; i < this.constraintIterations; ++i) {
			for (const body of this.bodies) {
				body.solveConstraints()
			}
		}

		// Constrain to box
		for (const body of this.bodies) {
			body.constrainToBox(0, 0, this.width, this.height)
		}
	}
}

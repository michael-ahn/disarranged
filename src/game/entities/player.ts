//
// Copyright 2016 Michael Ahn m3ahn@edu.uwaterloo.ca
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { Entity } from "./entity";
import { vec3, mat4, vec2 } from "../../lib/gl-matrix";
import { Actor } from "../../actors/actor";
import { ArenaActor } from "../../actors/arena_actor";
import { CharacterActor } from "../../actors/character_actor";

export class Player extends Entity {

    //--------------------------------------------------------------------------
    // Public members
    //--------------------------------------------------------------------------

    // The coordinate system basis vectors for the player's movement
    public readonly forwardBasis = vec3.create();
    public readonly sideBasis = vec3.create();

    public constructor(actor: CharacterActor, ground: ArenaActor) {
        super(actor);
        this.character = actor;
        this.speed = 0.5;
        this.ground = ground;
        vec3.set(this.lowerBounds, -50, -50, -50);
        vec3.set(this.upperBounds, 50, 50, 50);
    }

    // Set's the player's direction with the given direction influences
    public setDirection(verticalInput: number, horizontalInput: number) {
        let normalize = verticalInput !== 0 && horizontalInput !== 0 ? 0.7071 : 1;
        this.direction[0] = horizontalInput * normalize;
        this.direction[2] = verticalInput * normalize;
    }

    // Performs a jump, if possible
    public jump() {
        if (this.isAirborne)
            return;
        this.isAirborne = true;
        this.direction[1] = 1.0;
    }

    // Orients the directional movement at the target entity
    public orientMovement(target: Entity) {
        // Get the unit vector pointing at the enemy
        vec3.subtract(this.forwardBasis, target.position, this.position);
        // Zero the y dimension and normalize
        this.forwardBasis[1] = 0;
        vec3.normalize(this.forwardBasis, this.forwardBasis);
        // Let the side basis be the rotated vector
        this.sideBasis[0] = this.forwardBasis[2];
        this.sideBasis[2] = -this.forwardBasis[0];
    }

    // Move the player one step
    public tick(time: number) {
        // Dampen lateral movement in the air
        if (this.isAirborne) {
            this.direction[0] *= 0.75;
            this.direction[2] *= 0.75;
        }

        // Add contribution in the forward direction
        if (this.direction[2] !== 0) {
            vec3.scaleAndAdd(this.position, this.position, this.forwardBasis, this.direction[2] * this.speed);
        }
        // Add contribution in the side direction
        if (this.direction[0] !== 0) {
            vec3.scaleAndAdd(this.position, this.position, this.sideBasis, this.direction[0] * this.speed);
        }
        // Add contribution from jumping
        if (this.direction[1] !== 0) {
            this.position[1] += this.direction[1] * this.speed;
        }

        // Clamp to bounds
        vec2.set(this.scratch2Vec, this.position[0], this.position[2]);
        let groundDistance = vec2.length(this.scratch2Vec);
        if (groundDistance <= 2) {
            vec3.scale(this.position, this.position, 2.0 / groundDistance);
        }
        vec3.min(this.position, this.upperBounds, vec3.max(this.position, this.lowerBounds, this.position));

        // Sample the ground height at our current location
        let floor = this.ground.sampleHeight(this.position[0], this.position[2]);

        // Ground the player if they're jumping and hit the ground
        if (this.isAirborne) {
            // Apply gravity to the player
            this.direction[1] -= 0.05;

            // Ground the player if they hit the ground while falling
            if (this.direction[1] < 0 && this.position[1] <= floor) {
                this.isAirborne = false;
                this.position[1] = floor;
                this.direction[1] = 0;
            }
        } else {
            // Stick the player to the floor
            this.position[1] = floor;
        }
    
        // Move the actor to the final position
        this.character.tick(time, this.position, this.forwardBasis, this.direction[2], this.direction[0], this.isAirborne);
    }

    //--------------------------------------------------------------------------
    // Private members
    //--------------------------------------------------------------------------

    // The character model
    private readonly character: CharacterActor;

    // The ground object to collide with
    private readonly ground: ArenaActor;

    // Whether the player is currently in the air
    private isAirborne = false;

    // Bounding box of game
    private readonly lowerBounds = vec3.create();
    private readonly upperBounds = vec3.create();
    private readonly scratch2Vec = vec2.create();

}

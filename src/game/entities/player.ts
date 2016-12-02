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
import { vec3, mat4 } from "../../lib/gl-matrix";
import { Actor } from "../../actors/actor";
import { ArenaActor } from "../../actors/arena_actor";

export class Player extends Entity {

    //--------------------------------------------------------------------------
    // Public members
    //--------------------------------------------------------------------------

    public constructor(actor: Actor, ground: ArenaActor) {
        super(actor);
        this.speed = 0.5;
        this.ground = ground;
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

    // Move the player one step
    public move() {
        // Dampen lateral movement in the air
        if (this.isAirborne) {
            this.direction[0] *= 0.5;
            this.direction[2] *= 0.5;
        }

        // Update the position vector
        vec3.scaleAndAdd(this.position, this.position, this.direction, this.speed);

        // Sample the ground height at our current location
        let floor = this.ground.sampleHeight(this.position[0], this.position[2]);

        // Raise the standing height by our distance to the origin of the model
        floor += 0.9;

        // Ground the player if they're jumping and hit the ground
        if (this.isAirborne) {
            // Apply gravity to the player
            this.direction[1] -= 0.03;

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
        mat4.fromTranslation(this.actor.modelTransform, this.position);
    }

    //--------------------------------------------------------------------------
    // Private members
    //--------------------------------------------------------------------------

    // The ground object to collide with
    private readonly ground: ArenaActor;

    // The current moving direction of the player, based on input
    private readonly direction = vec3.create();

    // Whether the player is currently in the air
    private isAirborne = false;

}

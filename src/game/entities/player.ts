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
import { vec3 } from "../../lib/gl-matrix";
import { BasicActor } from "../../actors/basic_actor";

export class Player extends Entity {

    //--------------------------------------------------------------------------
    // Public members
    //--------------------------------------------------------------------------

    public constructor(actor: BasicActor) {
        super(actor);
        this.speed = 0.5;
    }

    // Moves the player one step with the given directional influences
    public moveWithInputs(verticalInput: number, horizontalInput: number) {
        let normalize = verticalInput !== 0 && horizontalInput !== 0 ? 0.7071 : 1;
        this.inputDirection[0] = horizontalInput * normalize;
        this.inputDirection[2] = verticalInput * normalize;
        this.move(this.inputDirection)
    }

    // Performs a jump, if possible
    public jump() {
        if (this.isAirborne)
            return;
        this.isAirborne = true;
        this.inputDirection[1] = 1.0;
    }

    // Move the player one step
    public move(dir: vec3) {
        // Ground the player if they're jumping and hit the ground
        if (this.isAirborne) {
            // Ground the player if they hit the ground while falling
            if (this.inputDirection[1] < 0 && this.position[1] <= 0) {
                this.isAirborne = false;
                this.position[1] = 0;
                this.inputDirection[1] = 0;
            }
            // Dampen lateral movement in the air
            this.inputDirection[0] *= 0.5;
            this.inputDirection[2] *= 0.5;
        }

        // Move the player
        super.move(dir);

        // Apply gravity to the player
        if (this.isAirborne) {
            this.inputDirection[1] -= 0.03;
        }
    }

    //--------------------------------------------------------------------------
    // Private members
    //--------------------------------------------------------------------------

    // The current walking direction of the player, based on input
    private readonly inputDirection = vec3.create();

    // Whether the player is currently in the air
    private isAirborne = false;

}

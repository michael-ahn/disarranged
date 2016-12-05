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

export class Projectile extends Entity {

    //--------------------------------------------------------------------------
    // Public members
    //--------------------------------------------------------------------------

    public constructor(actor: Actor, ground: ArenaActor) {
        super(actor);
        this.ground = ground;
        this.speed = 3.0;
    }

    public setTarget(target: Entity, hitCallback: () => void) {
        this.target = target;
        this.hitCallback = hitCallback;
        vec3.subtract(this.direction, target.position, this.position);
        vec3.normalize(this.direction, this.direction);
        this.isDead = false;
    }

    public tick() {
        if (this.isDead) {
            return;
        }

        // Check for hits
        let targetDist = vec3.distance(this.position, this.target.position);
        if (targetDist < this.hitRadius) {
            this.isDead = true;
            if (this.hitCallback) {
                this.hitCallback();
            }
            return;
        }

        // Check collision with ground
        let floor = this.ground.sampleHeight(this.position[0], this.position[2]);
        if (Math.abs(floor - this.position[1]) < this.hitRadius / 2) {
            this.isDead = true;
            return;
        }

        // Check out of range
        let travelDist = vec3.length(this.position);
        if (travelDist > 30) {
            this.isDead = true;
            return;
        }

        vec3.scaleAndAdd(this.position, this.position, this.direction, this.speed);
    }

    //--------------------------------------------------------------------------
    // Private members
    //--------------------------------------------------------------------------

    private ground: ArenaActor;
    private hitRadius = 2;
    private target: Entity;
    private hitCallback: () => void;
    private isDead: boolean;
    private readonly scratchVec: vec3;

}
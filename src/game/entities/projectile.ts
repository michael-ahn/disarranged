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
import { MissileActor } from "../../actors/missile_actor";
import { ArenaActor } from "../../actors/arena_actor";

export class Projectile extends Entity {

    //--------------------------------------------------------------------------
    // Public members
    //--------------------------------------------------------------------------

    public readonly missile: MissileActor;

    public constructor(actor: MissileActor, ground: ArenaActor) {
        super(actor);
        this.speed = 0.75;
        this.missile = actor;
        this.ground = ground;
        this.dead = true;
        this.missile.isVisible = false;
    }

    public setTarget(target: Entity, position: vec3, direction: vec3, hitCallback: (hit: boolean) => void) {
        // Configure target
        this.target = target;
        this.hitCallback = hitCallback;
        this.dead = false;
        this.missile.isVisible = true;
        // Set travel direction and position
        vec3.copy(this.position, position);
        vec3.normalize(this.direction, direction);
        this.missile.setFacing(this.direction);
    }

    public kill(hit: boolean) {
        this.dead = true;
        this.missile.isVisible = false;
        if (this.hitCallback) {
            this.hitCallback(hit);
        }
    }

    public tick(time: number) {
        if (this.dead) {
            return;
        }

        // Check for hits
        let targetDist = vec3.distance(this.position, this.target.position);
        if (targetDist < this.hitRadius) {
            this.kill(true);
            return;
        }

        // Check collision with ground
        let floor = this.ground.sampleHeight(this.position[0], this.position[2]);
        if (this.position[1] < floor + this.hitRadius / 4) {
            this.kill(false);
            return;
        }

        // Check out of range
        let travelDist = vec3.length(this.position);
        if (travelDist > 70) {
            this.kill(false);
            return;
        }

        vec3.scaleAndAdd(this.position, this.position, this.direction, this.speed);
        this.missile.tick(time, this.position);
    }

    //--------------------------------------------------------------------------
    // Private members
    //--------------------------------------------------------------------------

    private readonly ground: ArenaActor;
    private hitRadius = 2;
    private target: Entity;
    private hitCallback: (hit: boolean) => void;
    private dead: boolean;
    private readonly scratchVec: vec3;

}
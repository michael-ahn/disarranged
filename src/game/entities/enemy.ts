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
import { Projectile } from "./projectile";
import { Player } from "./player";
import { vec3, mat4 } from "../../lib/gl-matrix";
import { Actor } from "../../actors/actor";
import { EnemyActor } from "../../actors/enemy_actor";
import { ArenaActor } from "../../actors/arena_actor";
import { MissileActor } from "../../actors/missile_actor";

export class Enemy extends Entity {

    //--------------------------------------------------------------------------
    // Public members
    //--------------------------------------------------------------------------

    public missileCooldown: number = 0;

    public constructor(actor: EnemyActor, ground: ArenaActor, player: Player, missiles: MissileActor[]) {
        super(actor);
        this.character = actor;
        this.target = player;

        // Create projectiles
        for (let missile of missiles) {
            this.availableMissiles.push(new Projectile(missile, ground));
        }
    }

    public tick(time: number) {
        if (this.missileCooldown <= 0) {
            this.missileCooldown = 0.5;
            this.fireProjectile();
        } else {
            this.missileCooldown -= time - this.lastTime;
        }
        this.lastTime = time;

        this.character.tick(time);
        for (let missile of this.usedMissiles) {
            missile.tick(time);
        }
    }

    public fireProjectile() {
        if (this.availableMissiles.length === 0)
            return;
        let missile = this.availableMissiles.pop();
        this.usedMissiles.add(missile);

        // Get launch position
        vec3.copy(this.launchOrigin, this.position);
        this.launchOrigin[1] += 2.0;

        // Get direction to player
        vec3.subtract(this.launcVec, this.target.position, this.launchOrigin);
        this.launcVec[1] += 1.5;

        missile.setTarget(this.target, this.launchOrigin, this.launcVec, (hit: boolean) => {
            this.usedMissiles.delete(missile);
            this.availableMissiles.push(missile);
            // if (hit) {
            //     console.log("Hit!");
            // }
        });
    }

    //--------------------------------------------------------------------------
    // Private members
    //--------------------------------------------------------------------------

    private readonly character: EnemyActor;
    private readonly target: Player;

    // Missiles
    private readonly availableMissiles: Projectile[] = [];
    private readonly usedMissiles: Set<Projectile> = new Set();
    private readonly launchOrigin = vec3.create();
    private readonly launcVec = vec3.create();
    private readonly perturbVec = vec3.create();
    private lastTime = 0;

}
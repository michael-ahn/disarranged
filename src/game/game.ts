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

import { Keyboard, KeyCode } from "../util/keyboard";
import { Entity } from "./entities/entity";
import { Player } from "./entities/player";
import { Enemy } from "./entities/enemy";

import { Actor } from "../actors/actor";
import { ArenaActor } from "../actors/arena_actor";
import { CharacterActor } from "../actors/character_actor";
import { EnemyActor } from "../actors/enemy_actor";

export class Game {

    //--------------------------------------------------------------------------
    // Public members
    //--------------------------------------------------------------------------

    // All of the drawable actors for the game
    public readonly actors: Actor[];

    // The player's data object
    public readonly player: Player;

    // The enemy's data object
    public readonly enemy: Enemy;

    // Ground object
    public readonly ground: ArenaActor;

    public constructor(gl: WebGLRenderingContext, input: Keyboard) {
        this.gl = gl;

        let arenaActor = new ArenaActor(this.gl);
        let playerActor = new CharacterActor(this.gl);
        let enemyActor = new EnemyActor(this.gl);

        this.player = new Player(playerActor, arenaActor);
        this.player.position[2] = -10;
        this.enemy = new Enemy(enemyActor, arenaActor);
        this.ground = arenaActor;

        this.actors = [ arenaActor, playerActor, enemyActor ];

        // Hook up player actions
        input.registerEvent(KeyCode.SPACE, () => this.player.jump());
    }

    // Progresses the game state by one tick
    public tick(input: Keyboard) {
        // Update the player's orientation
        this.player.orientMovement(this.enemy);

        // Move the player based on the current directional input
        let verticalInput = input.isKeyDown(KeyCode.UP) ? 1 : (input.isKeyDown(KeyCode.DOWN) ? -1 : 0);
        let horizontalInput = input.isKeyDown(KeyCode.LEFT) ? 1 : (input.isKeyDown(KeyCode.RIGHT) ? -1 : 0);
        this.player.setDirection(verticalInput, horizontalInput);
        this.player.tick();

    }

    //--------------------------------------------------------------------------
    // Private members
    //--------------------------------------------------------------------------

    private readonly gl: WebGLRenderingContext;
}

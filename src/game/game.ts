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

import { Actor } from "../actors/actor";
import { BasicActor } from "../actors/basic_actor";

export class Game {

    private entities: Entity[];
    private player: Player;

    public actors: Actor[];

    private readonly gl: WebGLRenderingContext;

    public constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.init();
    }

    // Progresses the game state by one tick
    public tick(input: Keyboard) {
        let verticalInput = input.isKeyDown(KeyCode.UP) ? 1 : (input.isKeyDown(KeyCode.DOWN) ? -1 : 0);
        let horizontalInput = input.isKeyDown(KeyCode.LEFT) ? -1 : (input.isKeyDown(KeyCode.RIGHT) ? 1 : 0);
        this.player.moveWithInputs(verticalInput, horizontalInput);

    }

    // Reset the state of the game
    private init() {
        this.actors = [
            new BasicActor(this.gl)
        ];

        this.player = new Player(this.actors[0]);

        this.entities = [this.player];
    }

}

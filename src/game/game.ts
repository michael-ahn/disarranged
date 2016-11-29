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

export abstract class Game {

    private input: Keyboard;

    private entities: Entity[];
    private player: Player;

    public constructor(input: Keyboard) {
        this.input = input;

        this.entities = [];
        this.player = new Player();
    }

    public tick() {
        let verticalInput = this.input.isKeyDown(KeyCode.UP) ? 1 : (this.input.isKeyDown(KeyCode.DOWN) ? -1 : 0);
        let horizontalInput = this.input.isKeyDown(KeyCode.LEFT) ? -1 : (this.input.isKeyDown(KeyCode.RIGHT) ? 1 : 0);
        this.player.moveWithInputs(verticalInput, horizontalInput);

    }

}

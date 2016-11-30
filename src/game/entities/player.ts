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

    // The current walking direction of the player, based on input
    private readonly inputDirection = vec3.create();

    public constructor(actor: BasicActor) {
        super(actor);
        this.speed = 0.5;
    }

    public moveWithInputs(verticalInput: number, horizontalInput: number) {
        let normalize = verticalInput !== 0 && horizontalInput !== 0 ? 0.7071 : 1;
        this.inputDirection[0] = horizontalInput * normalize;
        this.inputDirection[1] = verticalInput * normalize;
        this.move(this.inputDirection)
    }


}

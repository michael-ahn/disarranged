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

import { vec3, mat4 } from "../../lib/gl-matrix";
import { Actor } from "../../actors/actor";

export abstract class Entity {

    // The visual for the entity
    public readonly actor: Actor;

    // The current position in world space
    public readonly position = vec3.create();

    // The distance travelled per game tick
    public speed = 0;

    protected constructor(actor: Actor) {
        this.actor = actor;
    }

    // Moves the entity one step
    public abstract tick(): void;

}

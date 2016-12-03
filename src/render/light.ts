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

import { mat4, vec3 } from "../lib/gl-matrix";

export class Light {

    //--------------------------------------------------------------------------
    // Public members
    //--------------------------------------------------------------------------

    // The position of the light
    public readonly position = vec3.create();

    // The view transformation matrix for this light
    public readonly viewTransform = mat4.create();

    // The projection matrix for this light
    public readonly projectTransform = mat4.create();

    // The combined Project * View matrix
    public readonly projectViewTransform = mat4.create();

    public constructor(x: number, y: number, z: number, size: number) {
        vec3.set(this.position, x, y, z);
        vec3.normalize(this.position, this.position);
        // Look at the center
        mat4.lookAt(this.viewTransform, this.position, [0, 0, 0], [0, 1, 0]);
        // Direct light so do an orthographic projection
        let distance = 255, end = 64;
        mat4.ortho(this.projectTransform, -size, size, -size, size, end - distance, end);

        mat4.multiply(this.projectViewTransform, this.projectTransform, this.viewTransform);
    }

}
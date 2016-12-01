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
import { Entity } from "../game/entities/entity";

export class Camera {

    //--------------------------------------------------------------------------
    // Public members
    //--------------------------------------------------------------------------

    // The world to projected view transformation.
    public readonly viewTransform = mat4.create();

    // The position of the camera in world space.
    public readonly eyePosition = vec3.create();

    // The focal destination of the camera in world space.
    public readonly lookPosition = vec3.create();

    public constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.upDirection.set([0, 1, 0]);
        this.buildProjection();
    }

    public follow(target: Entity) {
        this.eyePosition.set(target.position);
        this.lookPosition.set(target.position);
        this.eyePosition[1] += 5;
        this.eyePosition[2] -= 10;
        this.update();
    }

    // Rebuilds the view transformation matrix using the current eye positon
    // and look position.
    public update() {
        mat4.lookAt(this.scratchMatrix, this.eyePosition, this.lookPosition, this.upDirection);
        mat4.multiply(this.viewTransform, this.perspectiveTransform, this.scratchMatrix);
    }

    // Reconstructs the projection matrix for the camera.
    // Should be called whenever the aspect ratio of the viewport changes
    public buildProjection() {
        mat4.perspective(this.perspectiveTransform,
            3.14159 / 3, // Field of view: 60deg
            this.gl.canvas.clientWidth / this.gl.canvas.clientHeight,
            1, 200.0); // Near and far planes
    }

    //--------------------------------------------------------------------------
    // Private members
    //--------------------------------------------------------------------------

    private readonly gl: WebGLRenderingContext;

    // The projection matrix
    private readonly perspectiveTransform = mat4.create();

    // The orientation of the camera
    private readonly upDirection = vec3.create();

    // Matrix to store intermediate values
    private readonly scratchMatrix = mat4.create();
}

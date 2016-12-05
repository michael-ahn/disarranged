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
import { Player } from "../game/entities/player";
import { ArenaActor } from "../actors/arena_actor";

export class Camera {

    //--------------------------------------------------------------------------
    // Public members
    //--------------------------------------------------------------------------

    // The Projection * View matrix of the camera
    public readonly projectViewTransform = mat4.create();

    // The inverse of the projection matrix
    public readonly invProjectTransform = mat4.create();

    // The inverse of the view matrix
    public readonly invViewTransform = mat4.create();

    // The position of the camera in world space.
    public readonly eyePosition = vec3.create();

    // The focal destination of the camera in world space.
    public readonly lookPosition = vec3.create();

    public constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.upDirection.set([0, 1, 0]);
        this.buildProjection();
    }

    // Looks at the target from the position of the player in 3rd person
    public follow(player: Player, target: Entity, ground: ArenaActor) {
        // Look at the target
        this.lookPosition.set(target.position);
        // View from player but behind by some distance
        vec3.scaleAndAdd(this.eyePosition, player.position, player.forwardBasis, -10);
        // Keep camera above ground
        let floor = ground.sampleHeight(this.eyePosition[0], this.eyePosition[2]);
        this.eyePosition[1] = Math.max(this.eyePosition[1] + 5, floor + 2.5);
        this.update();
    }

    // Rebuilds the view transformation matrix using the current eye positon
    // and look position.
    public update() {
        mat4.lookAt(this.viewTransform, this.eyePosition, this.lookPosition, this.upDirection);
        mat4.invert(this.invViewTransform, this.viewTransform);
        mat4.multiply(this.projectViewTransform, this.projectTransform, this.viewTransform);
    }

    // Reconstructs the projection matrix for the camera.
    // Should be called whenever the aspect ratio of the viewport changes
    public buildProjection() {
        mat4.perspective(this.projectTransform,
            3.14159 / 3, // Field of view: 60deg
            this.gl.canvas.clientWidth / this.gl.canvas.clientHeight,
            1, 200.0); // Near and far planes
        mat4.invert(this.invProjectTransform, this.projectTransform);
    }

    //--------------------------------------------------------------------------
    // Private members
    //--------------------------------------------------------------------------

    private readonly gl: WebGLRenderingContext;

    // The orientation of the camera
    private readonly upDirection = vec3.create();

    // The world to projected view transformation.
    public readonly viewTransform = mat4.create();

    // The projection matrix
    public readonly projectTransform = mat4.create();
}

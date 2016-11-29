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

import { Actor } from "../actors/actor";
import { Program } from "./shader_programs/program";
import { BasicProgram } from "./shader_programs/basic_program";
import { Camera } from "./camera";

// The type of shaders available for rendering with
export const enum RenderStyle {
    Basic = 0,
}

export class Renderer {

    //--------------------------------------------------------------------------
    // Public members
    //--------------------------------------------------------------------------

    // Is true if the renderer successfully initialized actors and programs
    public readonly isReady: boolean;

    public constructor(gl: WebGLRenderingContext) {
        this.gl = gl;

        // Create and initialize shader programs
        this.programs = [];
        this.programs[RenderStyle.Basic] = new BasicProgram(gl);

        // Check that every program compiled correctly
        this.isReady = this.programs.every(p => p.isValid);
    }

    // Draw the given actors onto the viewport
    public drawScene(actors: Actor[], camera: Camera) {
        // Set the camera view-projection matrix
        if (this.activeProgram !== null) {
            this.gl.uniformMatrix4fv(this.activeProgram.uniformViewProject, false, camera.viewTransform);
        }

        for (let actor of actors) {
            // Change the active shader program to the shader the actor needs
            if (this.activeProgramId !== actor.renderStyle) {
                this.activateProgramAtIndex(actor.renderStyle);

                // Set the camera view-projection matrix
                this.gl.uniformMatrix4fv(this.activeProgram.uniformViewProject, false, camera.viewTransform);
            }

            // Set uniforms for this actor
            this.gl.uniformMatrix4fv(this.activeProgram.uniformModel, false, actor.modelTransform);

            actor.draw(this.gl);
        }
    }

    //--------------------------------------------------------------------------
    // Protected/Private members
    //--------------------------------------------------------------------------

    private readonly gl: WebGLRenderingContext;
    private readonly programs: Program[];

    // The currently active shader program
    private activeProgram: Program = null;
    private activeProgramId = -1;
    private activeAttrs = 0;

    private activateProgramAtIndex(index: number) {
        this.activeProgramId = index;

        // Use the shader program associated at the index
        this.activeProgram = this.programs[this.activeProgramId];
        this.gl.useProgram(this.activeProgram.glsl);

        // Enable or disable vertex attributes until we match the program
        if (this.activeProgram.attrCount !== this.activeAttrs) {
            if (this.activeProgram.attrCount > this.activeAttrs) {
                for (; this.activeAttrs < this.activeProgram.attrCount; this.activeAttrs++) {
                    this.gl.enableVertexAttribArray(this.activeAttrs);
                }
            } else {
                for (; this.activeAttrs > this.activeProgram.attrCount; this.activeAttrs--) {
                    this.gl.disableVertexAttribArray(this.activeAttrs - 1);
                }
            }
        }
    }

}

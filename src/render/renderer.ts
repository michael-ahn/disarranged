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

// The type of shaders available for rendering with
export const enum RenderStyle {
    Basic = 0,
}

export class Renderer {

    // Public members
    //---------------
    // Is true if the renderer successfully initialized actors and programs
    public readonly isReady: boolean;

    // Private members
    //----------------
    private readonly gl: WebGLRenderingContext;
    private readonly programs: Program[];

    // The currently active shader program
    private activeProgramIndex = -1;
    private activeAttrs = 0;

    public constructor(gl: WebGLRenderingContext) {
        this.gl = gl;

        // Create and initialize shader programs
        this.programs = [];
        this.programs[RenderStyle.Basic] = new BasicProgram(gl);

        // Check that every program compiled correctly
        this.isReady = this.programs.every(p => p.isValid);
    }

    // Draw the given actors onto the viewport
    public drawScene(actors: Actor[]) {
        for (let actor of actors) {
            // Change the active shader program to the shader the actor needs
            if (this.activeProgramIndex !== actor.renderStyle) {
                this.activateProgramAtIndex(actor.renderStyle);
            }

            // Set uniforms for this actor
            let program = this.programs[this.activeProgramIndex];
            this.gl.uniformMatrix4fv(program.uniformModel, false, actor.modelTransform);

            actor.draw(this.gl);
        }
    }

    private activateProgramAtIndex(index: number) {
        this.activeProgramIndex = index;

        // Use the shader program associated at the index
        let program = this.programs[this.activeProgramIndex];
        this.gl.useProgram(program.glsl);

        // Enable or disable vertex attributes until we match the program
        if (program.attrCount !== this.activeAttrs) {
            if (program.attrCount > this.activeAttrs) {
                for (; this.activeAttrs < program.attrCount; this.activeAttrs++) {
                    this.gl.enableVertexAttribArray(this.activeAttrs);
                }
            } else {
                for (; this.activeAttrs > program.attrCount; this.activeAttrs--) {
                    this.gl.disableVertexAttribArray(this.activeAttrs - 1);
                }
            }
        }
    }

}

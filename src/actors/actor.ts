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

import { mat4 } from "../lib/gl-matrix";
import { RenderStyle } from "../render/renderer";
import { Program } from "../render/shader_programs/program";

export abstract class Actor {

    //--------------------------------------------------------------------------
    // Public members
    //--------------------------------------------------------------------------

    // The render style the actor is drawn in
    public abstract readonly renderStyle: RenderStyle;

    // The world-to-model transform for the vertex data
    public readonly modelTransform = mat4.create();
    public readonly invModelTransform = mat4.create();

    // Additional tranformations matrices for movement
    public readonly staticTransform = mat4.create();
    public readonly dynamicTransform = mat4.create();

    // Scale factor of the UVs
    public uvScale: number = 1.0;

    // Edge sensitivity
    public edgeFactor: number = 1.0;

    // Draws the actor for the given WebGL context
    public draw(gl: WebGLRenderingContext, program: Program) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);

        // Set model transform
        gl.uniformMatrix4fv(program.uniform["u_model"], false, this.modelTransform);
        if ("u_transInvModel" in program.uniform) {
            gl.uniformMatrix4fv(program.uniform["u_transInvModel"], false, this.invModelTransform);
        }
        if ("u_uvScale" in program.uniform) {
            gl.uniform1f(program.uniform["u_uvScale"], this.uvScale);
        }
        if ("u_edgeFactor" in program.uniform) {
            gl.uniform1f(program.uniform["u_edgeFactor"], this.edgeFactor);
        }

        // Configure attributes
        program.enableAttribute(gl, "a_pos", 3, 32, 0);
        program.enableAttribute(gl, "a_norm", 3, 32, 12);
        program.enableAttribute(gl, "a_tex", 2, 32, 24);

        // Draw
        gl.drawElements(gl.TRIANGLES, this.elementCount, gl.UNSIGNED_SHORT, 0);
    }

    //--------------------------------------------------------------------------
    // Protected members
    //--------------------------------------------------------------------------

    // The vertex buffer object for the actor
    protected readonly vbo: WebGLBuffer;

    // The element array for the actor
    protected readonly ebo: WebGLBuffer;

    // The number of elements
    protected readonly elementCount: number;

    protected constructor(gl: WebGLRenderingContext, vboData: Float32Array, eboData: Uint16Array) {
        // Create the element buffer
        if (eboData) {
            this.ebo = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, eboData, gl.STATIC_DRAW);
            this.elementCount = eboData.length;
        }

        // Create the vertex buffer
        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vboData, gl.STATIC_DRAW);
    }
}

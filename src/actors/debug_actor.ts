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

import { Actor } from "./actor";
import { RenderStyle } from "../render/renderer";
import { Program } from "../render/shader_programs/program";

export class DebugActor extends Actor {

    //--------------------------------------------------------------------------
    // Public members
    //--------------------------------------------------------------------------

    public readonly renderStyle = RenderStyle.Basic;

    public constructor(gl: WebGLRenderingContext) {
        super(gl, DebugActor.vertexData, null);
    }

    public draw(gl: WebGLRenderingContext, program: Program) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);

        // Configure attributes
        gl.enableVertexAttribArray(program.attribute["a_pos"]);
        gl.enableVertexAttribArray(program.attribute["a_tex"]);
        gl.vertexAttribPointer(program.attribute["a_pos"], 2, gl.FLOAT, false, 16, 0);
        gl.vertexAttribPointer(program.attribute["a_tex"], 2, gl.FLOAT, false, 16, 8);

        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    //--------------------------------------------------------------------------
    // Private members
    //--------------------------------------------------------------------------

    private static vertexData = new Float32Array([
        0.5,  1,  0, 1,
        0.5, 0.5,  0, 0,
         1,  1,  1, 1,
        0.5, 0.5,  0, 0,
         1, 0.5,  1, 0,
         1,  1,  1, 1
    ]);

}

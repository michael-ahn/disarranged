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

export class BasicActor extends Actor {

    //--------------------------------------------------------------------------
    // Public members
    //--------------------------------------------------------------------------

    public readonly renderStyle = RenderStyle.Basic;

    public constructor(gl: WebGLRenderingContext) {
        super(gl, BasicActor.vertexData, BasicActor.elementData);
    }

    public draw(gl: WebGLRenderingContext) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        super.draw(gl);
    }

    //--------------------------------------------------------------------------
    // Private members
    //--------------------------------------------------------------------------

    private static vertexData = new Float32Array([
        0, 0, 0,
        0, 10, 0,
        -15, 0, 0,
    ]);

    private static elementData = new Uint16Array([
        0, 1, 2,
    ]);

}

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

import { Actor } from './actor';

export class BasicActor extends Actor {

    public readonly renderStyle = Actor.renderStyles.basic;

    private static data = new Float32Array([
        0, 0,
        0, 0.5,
        0.7, 0,
    ]);

    public constructor(gl: WebGLRenderingContext) {
        super(gl, BasicActor.data);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    }

    public draw(gl: WebGLRenderingContext) {
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

}

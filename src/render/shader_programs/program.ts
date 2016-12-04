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

import { mat4 } from "../../lib/gl-matrix";

export abstract class Program {

    //--------------------------------------------------------------------------
    // Public members
    //--------------------------------------------------------------------------

    // The linked glsl program
    public readonly glsl: WebGLProgram;

    // The attributes for the program
    public readonly attribute: { [key:string]: number} = {};

    // The uniforms for the program
    public readonly uniform: { [key:string]: WebGLUniformLocation} = {};

    // Whether the glsl program is valid after construction
    public readonly isValid: boolean;

    // Enables the given attribute for this program if it exists
    public enableAttribute(gl: WebGLRenderingContext, name: string, size: number, stride: number, offset: number) {
        if (name in this.attribute) {
            gl.enableVertexAttribArray(this.attribute[name]);
            gl.vertexAttribPointer(this.attribute[name], size, gl.FLOAT, false, stride, offset);
        }
    }

    // Attaches the given texture to the given index slot
    public attachTexture(gl: WebGLRenderingContext, samplerName: string, texture: WebGLTexture, index: number) {
        gl.activeTexture(gl.TEXTURE0 + index);
        gl.uniform1i(this.uniform[samplerName], index);
        gl.bindTexture(gl.TEXTURE_2D, texture);
    }

    //--------------------------------------------------------------------------
    // Protected members
    //--------------------------------------------------------------------------

    protected constructor(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
        this.vertexShader = Program.createShader(gl, gl.VERTEX_SHADER, vertexSource);
        this.fragmentShader = Program.createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

        if (this.vertexShader && this.fragmentShader) {
            this.glsl = Program.createProgram(gl, this.vertexShader, this.fragmentShader);
        }
        this.isValid = !!this.glsl;
        if (!this.isValid) {
            return;
        }

        // Get the attribute locations
        let attrCount = gl.getProgramParameter(this.glsl, gl.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < attrCount; ++i) {
            let attr = gl.getActiveAttrib(this.glsl, i);
            let location = gl.getAttribLocation(this.glsl, attr.name);
            this.attribute[attr.name] = location;
        }

        // Get the uniform locations
        let uniCount = gl.getProgramParameter(this.glsl, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniCount; ++i) {
            let uni = gl.getActiveUniform(this.glsl, i);
            let location = gl.getUniformLocation(this.glsl, uni.name);
            this.uniform[uni.name] = location;
        }
    }

    //--------------------------------------------------------------------------
    // Private members
    //--------------------------------------------------------------------------

    // Compiles the given shader source code into the specified shader type
    private static createShader(gl: WebGLRenderingContext, shaderType: number, source: string): WebGLShader {
        let shader = gl.createShader(shaderType);
        gl.shaderSource(shader, "\n" + source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            // Print compile error to console
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    // Links the given vertex and fragment shaders into a glsl program.
    // The given attribute list will be bound in order.
    private static createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
        let program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            // Print link error to console
            console.error(gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            return null;
        }

        return program;
    }

    // The compiled shader objects
    private readonly vertexShader: WebGLShader;
    private readonly fragmentShader: WebGLShader;
}

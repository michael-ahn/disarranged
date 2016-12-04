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

import { vec3, mat4 } from "../lib/gl-matrix";
import { WebGraphics } from "../util/webgraphics";
import { Program } from "./shader_programs/program";
import { ShadowProgram } from "./shader_programs/shadow_program";
import { Actor } from "../actors/actor";
import { Light } from "./light";

export class RenderShadows {

    //--------------------------------------------------------------------------
    // Public members
    //--------------------------------------------------------------------------

    // Whether the shadows are ready to render
    public readonly isReady: boolean;

    // The shader program to render the shadows
    public readonly program: ShadowProgram;

    // The dimensions of the shadow map
    public readonly mapSize = 512;

    // The texture storing the depth information
    public readonly depthTexture: WebGLTexture;
    public readonly colourTexture: WebGLTexture;

    public readonly framebuffer: WebGLFramebuffer;

    public constructor(gl: WebGLRenderingContext, size: number) {
        this.gl = gl;
        let canvas = gl.canvas;

        // Create the depth texture used as our shadow map
        this.depthTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, canvas.clientWidth, canvas.clientHeight, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture, 0);

        // Get status and clean up
        let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
        if (!status) {
            console.error("Could not create shadow framebuffer");
            this.isReady = false;
            return;
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // Create the shader program
        this.program = new ShadowProgram(gl);
        this.isReady = this.program.isValid;
    }

    public drawToShadowTexture(actors: Actor[], light: Light) {
        let gl = this.gl;
        let canvas = gl.canvas;

        // Render to the shadow's framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.clear(gl.DEPTH_BUFFER_BIT);

        // Use the shadow shader
        gl.useProgram(this.program.glsl);

        // Move view from the point-of-view of the light
        gl.uniformMatrix4fv(this.program.uniform["u_projectView"], false, light.projectViewTransform);

        // Draw the actors
        for (let actor of actors) {
            actor.draw(gl, this.program);
        }

        // Reset the state
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    //--------------------------------------------------------------------------
    // Private members
    //--------------------------------------------------------------------------

    private readonly gl: WebGLRenderingContext;

}

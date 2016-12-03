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
import { ArenaProgram } from "./shader_programs/arena_program";
import { Camera } from "./camera";
import { Light } from "./light";
import { Shadows } from "./shadows";
import { DebugActor } from "../actors/debug_actor";
import { DebugProgram } from "./shader_programs/debug_program";

// The type of shaders available for rendering with
export const enum RenderStyle {
    Basic = 0,
    Arena = 1,
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
        // this.programs[RenderStyle.Arena] = new ArenaProgram(gl);
        this.meshShader = new ArenaProgram(gl);

        // Check that every program compiled correctly
        // this.isReady = this.programs.every(p => p.isValid);
        this.isReady = this.meshShader.isValid;

        // Create the light for the scene
        this.light = new Light(0, 1, -1, 25);

        // Initialize shadow rendering
        this.shadows = new Shadows(gl, 512);
        this.isReady = this.isReady && this.shadows.isReady;

        // Initialize debugging
        this.debugQuad = new DebugActor(gl);
        this.debugProgram = new DebugProgram(gl);
        this.isReady = this.isReady && this.debugProgram.isValid;

        // Set initial rendering state
        if (this.isReady) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clearDepth(1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        }
    }

    // Draw the given actors onto the viewport
    public draw(actors: Actor[], camera: Camera) {
        let gl = this.gl;
        let canvas = gl.canvas;

        // Draw the shadow map
        this.shadows.drawToShadowTexture(actors, this.light);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        let program = this.meshShader;

        // Set the active program
        gl.useProgram(program.glsl);

        // Set the general uniforms
        gl.uniformMatrix4fv(program.uniform["u_projectView"], false, camera.projectViewTransform);
        gl.uniform3fv(program.uniform["u_lightPos"], this.light.position);
        gl.uniformMatrix4fv(program.uniform["u_lightProjectView"], false, this.light.projectViewTransform);

        // Set the shadow map texture
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(program.uniform["u_shadowMap"], 0);
        gl.bindTexture(gl.TEXTURE_2D, this.shadows.depthTexture);

        // Draw the actors
        for (let actor of actors) {
            actor.draw(gl, program);
        }

        // Reset state
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    //--------------------------------------------------------------------------
    // Private members
    //--------------------------------------------------------------------------

    private readonly gl: WebGLRenderingContext;
    private readonly meshShader: Program;
    private readonly programs: Program[];
    private readonly shadows: Shadows;

    private readonly light: Light;

    private activeProgram: Program;

    // Debugging
    private readonly debugQuad: DebugActor;
    private readonly debugProgram: DebugProgram;

    private drawTextureDebugger(texture: WebGLTexture) {
        let gl = this.gl;
        // Use the debugging shader
        gl.useProgram(this.debugProgram.glsl);

        // Attach the texture to render
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(this.debugProgram.uniform["u_textureMap"], 0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Disable depth testing and draw
        gl.disable(gl.DEPTH_TEST);
        this.debugQuad.draw(gl, this.debugProgram);

        // Reset state
        gl.enable(gl.DEPTH_TEST);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}

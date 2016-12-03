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
import { RenderShadows } from "./render_shadows";
import { QuadActor } from "../actors/quad_actor";
import { DebugActor } from "../actors/debug_actor";
import { DebugProgram } from "./shader_programs/debug_program";
import { DeferredProgram } from "./shader_programs/deferred_program";
import { CompositorProgram } from "./shader_programs/compositor_program";
import { WebGraphics } from "../util/webgraphics";

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
    public readonly isReady: boolean = false;

    public constructor(gl: WebGLRenderingContext) {
        this.gl = gl;

        // Get necessary extensions
        this.extDB = WebGraphics.enableWebGLExtension(gl, "draw_buffers");
        if (!this.extDB) {
            console.error("Draw buffers is not supported!");
            return;
        }
        this.extFLT = WebGraphics.enableWebGLExtension(gl, "OES_texture_float", true);
        if (!this.extFLT) {
            console.error("Float texture is not supported!");
            return;
        }

        // Create and initialize shader programs
        this.meshShader = new ArenaProgram(gl);
        this.deferredProgram = new DeferredProgram(gl);
        this.compositorProgram = new CompositorProgram(gl);
        this.debugProgram = new DebugProgram(gl);
        
        this.programs = [ this.meshShader, this.deferredProgram, this.compositorProgram, this.debugProgram ];

        // Check that every program compiled correctly
        this.isReady = this.programs.every(p => p.isValid);

        this.outputQuad = new QuadActor(gl);

        // Create the light for the scene
        this.light = new Light(0, 1, -1, 25);

        // Initialize shadow rendering
        this.shadows = new RenderShadows(gl, 512);
        this.isReady = this.isReady && this.shadows.isReady;

        // Initialize deferred shading
        this.isReady = this.isReady && this.initializeDeferredShading();

        // Initialize debugging
        this.debugQuad = new DebugActor(gl);
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

    // Draw with deferred shading
    public drawDeferred(actors: Actor[], camera: Camera) {
        let gl = this.gl;
        let canvas = gl.canvas;

        // Draw the shadow map
        
        this.shadows.drawToShadowTexture(actors, this.light);

        let program = this.deferredProgram;

        // Set the active program
        gl.useProgram(program.glsl);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.deferredFramebuffer);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Set the general uniforms
        gl.uniformMatrix4fv(program.uniform["u_projectView"], false, camera.projectViewTransform);
        gl.uniform3fv(program.uniform["u_lightPos"], this.light.position);
        gl.uniformMatrix4fv(program.uniform["u_lightProjectView"], false, this.light.projectViewTransform);

        // Draw the actors
        for (let actor of actors) {
            actor.draw(gl, program);
        }

        // Unbind framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // Setup compositor
        program = this.compositorProgram;
        gl.useProgram(program.glsl);

        // Set target textures
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(program.uniform["u_positionTexture"], 0);
        gl.bindTexture(gl.TEXTURE_2D, this.deferredPosition);
        gl.activeTexture(gl.TEXTURE1);
        gl.uniform1i(program.uniform["u_colourTexture"], 1);
        gl.bindTexture(gl.TEXTURE_2D, this.deferredColour);
        gl.activeTexture(gl.TEXTURE2);
        gl.uniform1i(program.uniform["u_normalTexture"], 2);
        gl.bindTexture(gl.TEXTURE_2D, this.deferredNormal);
        // Set the shadow map texture
        gl.activeTexture(gl.TEXTURE3);
        gl.uniform1i(program.uniform["u_shadowMap"], 3);
        gl.bindTexture(gl.TEXTURE_2D, this.shadows.depthTexture);

        // Draw the quad
        gl.disable(gl.DEPTH_TEST);
        this.outputQuad.draw(gl, program);
        gl.enable(gl.DEPTH_TEST);

        // Reset state
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    //--------------------------------------------------------------------------
    // Private members
    //--------------------------------------------------------------------------

    private readonly gl: WebGLRenderingContext;
    private readonly meshShader: Program;
    private readonly programs: Program[];
    private readonly shadows: RenderShadows;

    private readonly light: Light;

    private activeProgram: Program;

    // Debugging
    private readonly debugQuad: DebugActor;
    private readonly debugProgram: DebugProgram;

    // Deferred shading
    private deferredProgram: DeferredProgram;
    private deferredFramebuffer: WebGLFramebuffer;
    private deferredColour: WebGLTexture;
    private deferredNormal: WebGLTexture;
    private deferredPosition: WebGLTexture;
    private deferredDepth: WebGLTexture;

    private compositorProgram: CompositorProgram;
    private readonly outputQuad: QuadActor;

    // Extensions
    private readonly extDB: any;
    private readonly extFLT: any;

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

    private initializeDeferredShading() {
        let gl = this.gl;
        let canvas = gl.canvas;

        // Create textures
        let width = canvas.clientWidth, height = canvas.clientHeight;
        this.deferredPosition = WebGraphics.createTexture(gl, width, height, gl.RGBA, gl.FLOAT);
        this.deferredColour = WebGraphics.createTexture(gl, width, height, gl.RGBA, gl.FLOAT);
        this.deferredNormal = WebGraphics.createTexture(gl, width, height, gl.RGBA, gl.FLOAT);
        this.deferredDepth = WebGraphics.createTexture(gl, width, height, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT);

        // Create attachments
        this.deferredFramebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.deferredFramebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, this.extDB.COLOR_ATTACHMENT0_WEBGL, gl.TEXTURE_2D, this.deferredPosition, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, this.extDB.COLOR_ATTACHMENT1_WEBGL, gl.TEXTURE_2D, this.deferredColour, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, this.extDB.COLOR_ATTACHMENT2_WEBGL, gl.TEXTURE_2D, this.deferredNormal, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.deferredDepth, 0);

        let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
        if (!status) {
            console.error("Could not create deferred framebuffer");
            return false;
        }

        // Bind render targets
        this.extDB.drawBuffersWEBGL([
            this.extDB.COLOR_ATTACHMENT0_WEBGL,
            this.extDB.COLOR_ATTACHMENT1_WEBGL,
            this.extDB.COLOR_ATTACHMENT2_WEBGL,
        ]);

        // Reset state
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return true;
    }
}

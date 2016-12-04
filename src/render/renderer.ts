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

import { Program } from "./shader_programs/program";
import { BasicProgram } from "./shader_programs/basic_program";
import { ArenaProgram } from "./shader_programs/arena_program";
import { DeferredProgram } from "./shader_programs/deferred_program";
import { PostProcessProgram } from "./shader_programs/postprocess_program";
import { CompositorProgram } from "./shader_programs/compositor_program";
import { DebugProgram } from "./shader_programs/debug_program";

import { RenderShadows } from "./render_shadows";
import { GBuffer } from "./gbuffer";

import { Camera } from "./camera";
import { Light } from "./light";

import { Actor } from "../actors/actor";
import { QuadActor } from "../actors/quad_actor";
import { DebugActor } from "../actors/debug_actor";

import { WebGraphics } from "../util/webgraphics";
import { TextureLoader } from "../util/textureloader";
import { mat4, vec3 } from "../lib/gl-matrix";

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

    public constructor(gl: WebGLRenderingContext, resources: TextureLoader) {
        this.gl = gl;
        this.res = resources;

        // Get necessary extensions
        let extDB = WebGraphics.enableWebGLExtension(gl, "draw_buffers");
        if (!extDB) {
            console.error("Draw buffers is not supported!");
            return;
        }
        if (!WebGraphics.enableWebGLExtension(gl, "depth_texture")) {
            console.error("Depth textures are not supported");
            return;
        }
        if (!WebGraphics.enableWebGLExtension(gl, "OES_texture_float", true)) {
            console.error("Float texture is not supported!");
            return;
        }

        // Create and initialize shader programs
        this.meshShader = new ArenaProgram(gl);
        this.deferredShader = new DeferredProgram(gl);
        this.postProcessShader = new PostProcessProgram(gl);
        this.compositorShader = new CompositorProgram(gl);
        this.debugShader = new DebugProgram(gl);

        // Check that every program compiled correctly
        this.programs = [
            this.meshShader,
            this.deferredShader,
            this.postProcessShader,
            this.compositorShader,
            this.debugShader,
        ];
        this.isReady = this.programs.every(p => p.isValid);

        // Create and initialize actors and objects
        this.outputQuad = new QuadActor(gl);
        this.debugQuad = new DebugActor(gl);
        this.light = new Light(0, 1, -1, 25);

        // Initialize shadow rendering
        this.shadows = new RenderShadows(gl, 512);
        this.isReady = this.isReady && this.shadows.isReady;

        // Initialize deferred shading and gbuffers
        this.deferredGBuffer = new GBuffer(gl, extDB, true, false);
        this.postProcessGBuffer = new GBuffer(gl, extDB, true, false);
        this.isReady = this.isReady &&
                       this.deferredGBuffer.isValid &&
                       this.postProcessGBuffer.isValid;

        // Set initial rendering state
        if (this.isReady) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clearDepth(1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);
        }
    }

    // Draw the scene
    public draw(actors: Actor[], camera: Camera) {
        let gl = this.gl;

        // Generate the shadow map
        this.shadows.drawToShadowTexture(actors, this.light);

        // Do the first deferred rendering step
        this.drawDeferred(actors, camera);

        // Do the post processing step
        this.postProcess(camera);

        // Composite the scene
        this.composite(camera);
    }

    //--------------------------------------------------------------------------
    // Private members
    //--------------------------------------------------------------------------

    private readonly gl: WebGLRenderingContext;
    private readonly res: TextureLoader;
    private readonly programs: Program[];

    // Shaders
    private readonly meshShader: Program;
    private readonly debugShader: DebugProgram;
    private readonly deferredShader: DeferredProgram;
    private readonly postProcessShader: PostProcessProgram;
    private readonly compositorShader: CompositorProgram;

    // Objects
    private readonly light: Light;
    private readonly viewToLightTransform = mat4.create();

    // Subprocesses
    private readonly shadows: RenderShadows;

    // Helper actors
    private readonly outputQuad: QuadActor;
    private readonly debugQuad: DebugActor;

    // GBuffers
    private readonly deferredGBuffer: GBuffer;
    private readonly postProcessGBuffer: GBuffer;

    // Draw with deferred shading and populate the gbuffer
    private drawDeferred(actors: Actor[], camera: Camera) {
        let gl = this.gl;
        let shader = this.deferredShader;

        // Set the active shader program
        gl.useProgram(shader.glsl);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.deferredGBuffer.framebuffer);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Set the general uniforms
        gl.uniformMatrix4fv(shader.uniform["u_projectView"], false, camera.projectViewTransform);
        gl.uniform3fv(shader.uniform["u_lightPos"], this.light.position);
        gl.uniformMatrix4fv(shader.uniform["u_lightProjectView"], false, this.light.projectViewTransform);

        // Draw the actors
        for (let actor of actors) {
            actor.draw(gl, shader);
        }

        // Reset state
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    // Applies effects like contours and shading
    private postProcess(camera: Camera) {
        let gl = this.gl;
        let canvas = gl.canvas;
        let shader = this.postProcessShader;

        // Set the active shader program
        gl.useProgram(shader.glsl);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.postProcessGBuffer.framebuffer);

        // Set uniforms
        mat4.multiply(this.viewToLightTransform, this.light.biasedProjectViewTransform, camera.invViewTransform);
        gl.uniformMatrix4fv(shader.uniform["u_invProj"], false, camera.invProjectTransform);
        gl.uniformMatrix4fv(shader.uniform["u_viewToLight"], false, this.viewToLightTransform);
        gl.uniform2f(shader.uniform["u_invScreenDims"], 1.0 / canvas.clientWidth, 1.0 / canvas.clientHeight);

        // Set target textures from the deferred rendering step
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(shader.uniform["u_colourTexture"], 0);
        gl.bindTexture(gl.TEXTURE_2D, this.deferredGBuffer.colourTexture);
        gl.activeTexture(gl.TEXTURE1);
        gl.uniform1i(shader.uniform["u_normalTexture"], 1);
        gl.bindTexture(gl.TEXTURE_2D, this.deferredGBuffer.normalTexture);
        gl.activeTexture(gl.TEXTURE2);
        gl.uniform1i(shader.uniform["u_depthTexture"], 2);
        gl.bindTexture(gl.TEXTURE_2D, this.deferredGBuffer.depthTexture);
        // Set the shadow map texture from the shadow map step
        gl.activeTexture(gl.TEXTURE3);
        gl.uniform1i(shader.uniform["u_shadowMap"], 3);
        gl.bindTexture(gl.TEXTURE_2D, this.shadows.depthTexture);

         // Draw the quad without depth testing
        gl.disable(gl.DEPTH_TEST);
        this.outputQuad.draw(gl, shader);
        gl.enable(gl.DEPTH_TEST);

        // Reset state
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    // Process all of the textures into one image
    private composite(camera: Camera) {
        let gl = this.gl;
        let canvas = gl.canvas;
        let shader = this.compositorShader;

        gl.useProgram(shader.glsl);

        // Set uniforms
        gl.uniform2f(shader.uniform["u_invScreenDims"], 1.0 / canvas.clientWidth, 1.0 / canvas.clientHeight);

        // Set target textures from the post process step
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(shader.uniform["u_colourTexture"], 0);
        gl.bindTexture(gl.TEXTURE_2D, this.postProcessGBuffer.colourTexture);
        gl.activeTexture(gl.TEXTURE1);
        gl.uniform1i(shader.uniform["u_normalTexture"], 1);
        gl.bindTexture(gl.TEXTURE_2D, this.postProcessGBuffer.normalTexture);

        // Draw the quad without depth testing
        gl.disable(gl.DEPTH_TEST);
        this.outputQuad.draw(gl, shader);
        gl.enable(gl.DEPTH_TEST);

        // Reset state
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    // Draws the given texture in a small quad at the corner of the screen
    private drawTextureDebugger(texture: WebGLTexture) {
        let gl = this.gl;
        // Use the debugging shader
        gl.useProgram(this.debugShader.glsl);

        // Attach the texture to render
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(this.debugShader.uniform["u_textureMap"], 0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Disable depth testing and draw
        gl.disable(gl.DEPTH_TEST);
        this.debugQuad.draw(gl, this.debugShader);

        // Reset state
        gl.enable(gl.DEPTH_TEST);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}

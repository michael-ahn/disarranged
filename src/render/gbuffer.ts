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

import { WebGraphics } from "../util/webgraphics";

export class GBuffer {

    //--------------------------------------------------------------------------
    // Public members
    //--------------------------------------------------------------------------

    // The framebuffer for the G-buffer
    public readonly framebuffer: WebGLFramebuffer;

    // Components of the G-buffer
    public readonly colourTexture: WebGLTexture;
    public readonly normalTexture: WebGLTexture;
    public readonly depthTexture: WebGLTexture;

    // Whether the G-buffer is constructed successfully
    public readonly isValid: boolean;

    public constructor(gl: WebGLRenderingContext, extDB: any) {
        let canvas = gl.canvas;
        let width = canvas.clientWidth, height = canvas.clientHeight;

        // Create textures
        this.colourTexture = WebGraphics.createTexture(gl, width, height, gl.RGBA, gl.FLOAT);
        this.normalTexture = WebGraphics.createTexture(gl, width, height, gl.RGBA, gl.FLOAT);
        this.depthTexture = WebGraphics.createTexture(gl, width, height, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT);

        // Create attachments
        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, extDB.COLOR_ATTACHMENT0_WEBGL, gl.TEXTURE_2D, this.colourTexture, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, extDB.COLOR_ATTACHMENT1_WEBGL, gl.TEXTURE_2D, this.normalTexture, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture, 0);

        // Check validity
        this.isValid = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
        if (!this.isValid) {
            console.error("Could not create gbuffer");
            return;
        }

        // Bind render targets
        extDB.drawBuffersWEBGL([
            extDB.COLOR_ATTACHMENT0_WEBGL,
            extDB.COLOR_ATTACHMENT1_WEBGL,
        ]);

        // Reset state
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        this.isValid = true;
    }

}

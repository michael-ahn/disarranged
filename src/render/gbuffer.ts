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
    public readonly uvTexture: WebGLTexture;
    public readonly depthTexture: WebGLTexture;

    // Whether the G-buffer is constructed successfully
    public readonly isValid: boolean;

    public constructor(gl: WebGLRenderingContext, extDB: any, includeNormals: boolean, includeUV: boolean) {
        let canvas = gl.canvas;
        let width = canvas.clientWidth, height = canvas.clientHeight;

        // Potential attachments
        let attachments: any = [
            extDB.COLOR_ATTACHMENT0_WEBGL,
            extDB.COLOR_ATTACHMENT1_WEBGL,
            extDB.COLOR_ATTACHMENT2_WEBGL,
        ];
        let usedAttachments: any = [];

        // Create framebuffer to contain the G-buffer
        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

        // Create and attach textures to the frame buffer
        this.colourTexture = this.addNewTexture(gl, width, height, attachments, usedAttachments);
        if (includeNormals) {
            this.normalTexture = this.addNewTexture(gl, width, height, attachments, usedAttachments);
        }
        if (includeUV) {
            this.uvTexture = this.addNewTexture(gl, width, height, attachments, usedAttachments);
        }

        // Add the depth component to the framebuffer
        this.depthTexture = WebGraphics.createTexture(gl, width, height, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture, 0);

        // Check validity
        this.isValid = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
        if (!this.isValid) {
            console.error("Could not create gbuffer");
            return;
        }

        // Assign the gl_FragData indices for this framebuffer
        extDB.drawBuffersWEBGL(usedAttachments);

        // Reset state
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        this.isValid = true;
    }

    private addNewTexture(gl: WebGLRenderingContext, width: number, height: number, attachments: any[], usedAttachments: any[]) {
        let texture = WebGraphics.createTexture(gl, width, height, gl.RGBA, gl.FLOAT);
        let attachment = attachments.shift();
        usedAttachments.push(attachment);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, texture, 0);
        return texture;
    }

}

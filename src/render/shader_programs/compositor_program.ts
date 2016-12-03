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

import { Program } from "./program";

export class CompositorProgram extends Program {

    private static vertexSource = [
        "attribute vec2 a_pos;",
        "attribute vec2 a_tex;",

        "varying vec2 v_texCoord;",

        "void main(void) {",
            "v_texCoord = a_tex;",
            "gl_Position = vec4(a_pos, 0.0, 1.0);",
        "}",
    ].join("\n");

    private static fragmentSource = [
        "precision mediump float;",

        "uniform mat4 u_invProj;",
        "uniform mat4 u_viewToLight;",

        "uniform sampler2D u_colourTexture;",
        "uniform sampler2D u_normalTexture;",
        "uniform sampler2D u_depthTexture;",
        "uniform sampler2D u_shadowMap;",

        "varying vec2 v_texCoord;",

        "void main(void) {",
            "vec4 colour = texture2D(u_colourTexture, v_texCoord);",
            "vec4 normal = texture2D(u_normalTexture, v_texCoord);",
            "float depth = texture2D(u_depthTexture, v_texCoord).r;",

            // Calculate light-view-space position from depth
            "vec4 p = u_invProj * (vec4(v_texCoord, depth, 1.0) * 2.0 - 1.0);",
            "vec4 light_pos = u_viewToLight * (p / p.w);",

            // Calculate effect from shadow
            "vec3 shadow_depth = light_pos.xyz / light_pos.w;",
            "float shadow = texture2D(u_shadowMap, shadow_depth.xy).r;",
            "shadow_depth.z = min(shadow_depth.z, 1.0) - 0.005;",
            "float shadowFactor = shadow < shadow_depth.z ? 0.4 : 1.0;",

            // Affect the colour
            "colour.xyz *= shadowFactor;",

            "gl_FragColor = vec4(colour.xyz, 1);",
        "}",
    ].join("\n");

    constructor(gl: WebGLRenderingContext) {
        super(gl, CompositorProgram.vertexSource, CompositorProgram.fragmentSource);
    }

}

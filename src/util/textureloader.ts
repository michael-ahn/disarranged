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

export const enum ImageTexture {
    Pencil = 0,
}

export class TextureLoader {

    //--------------------------------------------------------------------------
    // Public members
    //--------------------------------------------------------------------------

    public constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
    }

    // Begin loading all images
    public loadImages(callback: (success: boolean) => void) {
        // Set initial data
        this.loadCallback = callback;
        this.textures = [];
        this.images = [];
        this.remainingImages = this.imageNames.length;

        // Load each file
        let pathPrefix = "img/", fileSuffix = ".png";
        for (let name of this.imageNames) {
            this.loadImage(pathPrefix + name + fileSuffix);
        }
    }

    // Get the given image texture
    public getTexture(texture: ImageTexture): WebGLTexture {
        return this.textures[texture];
    }

    //--------------------------------------------------------------------------
    // Private members
    //--------------------------------------------------------------------------

    private readonly gl: WebGLRenderingContext;

    private readonly imageNames = [
        "pencillight"
    ];

    private images: HTMLImageElement[];
    private textures: WebGLTexture[];
    private loadCallback: (success: boolean) => void = null;
    private remainingImages: number;

    private loadImage(imageName: string) {
        let texture = this.gl.createTexture();
        this.textures.push(texture);
        let image = new Image();
        this.images.push(image);
        image.onload = () => this.onTextureLoaded(image, texture);
        image.onerror = () => this.onError(imageName);
        image.src = imageName;
    }

    private onTextureLoaded(image: HTMLImageElement, texture: WebGLTexture) {
        let gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);

        this.remainingImages--;
        if (this.remainingImages <= 0 && this.loadCallback) {
            let callback = this.loadCallback;
            this.loadCallback = null;
            callback(true);
        }
    }

    private onError(imageName: string) {
        let callback = this.loadCallback;
        this.loadCallback = null;
        console.error("Could not load texture at path " + imageName);
        callback(false);
    }

}

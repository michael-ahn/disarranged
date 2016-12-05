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

export const enum AudioFile {
    Ballade = 0,
}

export class AudioLoader {

    //--------------------------------------------------------------------------
    // Public members
    //--------------------------------------------------------------------------

    public constructor() {
        this.ctx = new AudioContext();
    }

    public get isReady() {
        return this.ready;
    }

    // Begin loading all images
    public loadSounds(callback: (success: boolean) => void) {
        // Set initial data
        this.loadCallback = callback;
        this.sounds = [];
        this.bufferSources = [];
        this.remainingSounds = this.soundFileNames.length;
        this.ready = false;

        // Load each file
        let pathPrefix = "audio/", fileSuffix = ".ogg";
        for (let name of this.soundFileNames) {
            this.loadSound(pathPrefix + name + fileSuffix);
        }
    }

    // Starts playing the given sound
    public playSound(audio: AudioFile) {
        if (this.bufferSources[audio] !== null) {
            return;
        }
        let source = this.ctx.createBufferSource();
        this.bufferSources[audio] = source;
        source.buffer = this.sounds[audio];

        source.connect(this.ctx.destination);
        source.loop = true;
        source.start();
    }

    // Stops playing the given sound
    public stopSound(audio: AudioFile) {
        if (this.bufferSources[audio] === null) {
            return;
        }
        let source = this.bufferSources[audio];
        source.stop();
        source.disconnect(this.ctx.destination);
        this.bufferSources[audio] = null;
    }

    // Toggles the play/stop state of the sound
    public toggleSound(audio: AudioFile) {
        if (this.bufferSources[audio]) {
            this.stopSound(audio);
        } else {
            this.playSound(audio);
        }
    }

    //--------------------------------------------------------------------------
    // Public members
    //--------------------------------------------------------------------------

    private readonly ctx: AudioContext;
    private ready = false;

    private readonly soundFileNames = [
        "ballade"
    ];

    private sounds: AudioBuffer[] = [];
    private bufferSources: AudioBufferSourceNode[] = [];
    private loadCallback: (success: boolean) => void = null;
    private remainingSounds: number;

    private loadSound(soundFile: string) {
        let request = new XMLHttpRequest();
        request.open('GET', soundFile, true);
        request.responseType = 'arraybuffer';
        // Put null audio buffer in array until it is loaded
        let index = this.sounds.length;
        this.sounds.push(null);
        this.bufferSources.push(null);

        // Decode on load
        request.onload = () => this.ctx.decodeAudioData(request.response,
                                (sound: AudioBuffer) => this.onSoundSuccess(sound, index),
                                () => this.onError(soundFile));
        request.send();
    }

    private onSoundSuccess(sound: AudioBuffer, index: number) {
        this.sounds[index] = sound;

        this.remainingSounds--;
        if (this.remainingSounds <= 0 && this.loadCallback) {
            this.ready = true;
            let callback = this.loadCallback;
            this.loadCallback = null;
            callback(true);
        }
    }

    private onError(soundFile: string) {
        let callback = this.loadCallback;
        this.loadCallback = null;
        console.error("Could not load audio file at path " + soundFile);
        callback(false);
    }
}
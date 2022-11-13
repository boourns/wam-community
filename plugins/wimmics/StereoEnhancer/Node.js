
/*
Code generated with Faust version 2.52.7
Compilation options: -lang wasm-ib -cn StereoEnhancer -es 1 -mcd 16 -single -ftz 2 
*/

function getJSONStereoEnhancer() {
	return '{"name": "StereoEnhancer","filename": "StereoEnhancer.dsp","version": "2.52.7","compile_options": "-lang wasm-ib -cn StereoEnhancer -es 1 -mcd 16 -single -ftz 2","include_pathnames": ["/usr/local/share/faust","/usr/local/share/faust","/usr/share/faust",".","/tmp/sessions/5F6A9940495D4EB3543F4A5F2ABB2A1BD4AD033E/web/wap"],"size": 1049248,"inputs": 2,"outputs": 2,"meta": [ { "basics_lib_name": "Faust Basic Element Library" },{ "basics_lib_version": "0.8" },{ "category": "Misc" },{ "compile_options": "-single -scal -I libraries/ -I project/ -lang wasm" },{ "delays_lib_name": "Faust Delay Library" },{ "delays_lib_version": "0.1" },{ "filename": "StereoEnhancer.dsp" },{ "filters_lib_fir_author": "Julius O. Smith III" },{ "filters_lib_fir_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_fir_license": "MIT-style STK-4.3 license" },{ "filters_lib_highpass_author": "Julius O. Smith III" },{ "filters_lib_highpass_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_iir_author": "Julius O. Smith III" },{ "filters_lib_iir_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_iir_license": "MIT-style STK-4.3 license" },{ "filters_lib_lowpass0_highpass1": "MIT-style STK-4.3 license" },{ "filters_lib_lowpass0_highpass1_author": "Julius O. Smith III" },{ "filters_lib_lowpass_author": "Julius O. Smith III" },{ "filters_lib_lowpass_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_lowpass_license": "MIT-style STK-4.3 license" },{ "filters_lib_name": "Faust Filters Library" },{ "filters_lib_tf2_author": "Julius O. Smith III" },{ "filters_lib_tf2_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_tf2_license": "MIT-style STK-4.3 license" },{ "filters_lib_tf2s_author": "Julius O. Smith III" },{ "filters_lib_tf2s_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_tf2s_license": "MIT-style STK-4.3 license" },{ "filters_lib_version": "0.3" },{ "id": "panoram_enhancer" },{ "library_path0": "/libraries/stdfaust.lib" },{ "library_path1": "/libraries/basics.lib" },{ "library_path2": "/libraries/signals.lib" },{ "library_path3": "/libraries/maths.lib" },{ "library_path4": "/libraries/platform.lib" },{ "library_path5": "/libraries/delays.lib" },{ "library_path6": "/libraries/filters.lib" },{ "maths_lib_author": "GRAME" },{ "maths_lib_copyright": "GRAME" },{ "maths_lib_license": "LGPL with exception" },{ "maths_lib_name": "Faust Math Library" },{ "maths_lib_version": "2.5" },{ "name": "StereoEnhancer" },{ "platform_lib_name": "Generic Platform Library" },{ "platform_lib_version": "0.2" },{ "shortname": "Panoram" },{ "signals_lib_name": "Faust Signal Routing Library" },{ "signals_lib_version": "0.3" },{ "version": "2.52.3" }],"ui": [ {"type": "vgroup","label": "StereoEnhancer","items": [ {"type": "hslider","label": "Delay width","shortname": "Delay_width","address": "/StereoEnhancer/Delay_width","index": 524420,"meta": [{ "name": "Delay" },{ "style": "knob" },{ "tooltip": "Delay Width" }],"init": 0,"min": 0,"max": 1,"step": 0.01},{"type": "hslider","label": "Frequency width","shortname": "Frequency_width","address": "/StereoEnhancer/Frequency_width","index": 524512,"meta": [{ "name": "Frequency" },{ "style": "knob" },{ "tooltip": "Frequency Width" }],"init": 0,"min": 0,"max": 1,"step": 0.01},{"type": "checkbox","label": "bypass","shortname": "bypass","address": "/StereoEnhancer/bypass","index": 28}]}]}';
}
function getBase64CodeStereoEnhancer() { return "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NEE1RjJBQkIyQTFCRDRBRDAzM0Uvd2ViL3dhcCJdLCJzaXplIjogMTA0OTI0OCwiaW5wdXRzIjogMiwib3V0cHV0cyI6IDIsIm1ldGEiOiBbIHsgImJhc2ljc19saWJfbmFtZSI6ICJGYXVzdCBCYXNpYyBFbGVtZW50IExpYnJhcnkiIH0seyAiYmFzaWNzX2xpYl92ZXJzaW9uIjogIjAuOCIgfSx7ICJjYXRlZ29yeSI6ICJNaXNjIiB9LHsgImNvbXBpbGVfb3B0aW9ucyI6ICItc2luZ2xlIC1zY2FsIC1JIGxpYnJhcmllcy8gLUkgcHJvamVjdC8gLWxhbmcgd2FzbSIgfSx7ICJkZWxheXNfbGliX25hbWUiOiAiRmF1c3QgRGVsYXkgTGlicmFyeSIgfSx7ICJkZWxheXNfbGliX3ZlcnNpb24iOiAiMC4xIiB9LHsgImZpbGVuYW1lIjogIlN0ZXJlb0VuaGFuY2VyLmRzcCIgfSx7ICJmaWx0ZXJzX2xpYl9maXJfYXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVyc19saWJfZmlyX2NvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzX2xpYl9maXJfbGljZW5zZSI6ICJNSVQtc3R5bGUgU1RLLTQuMyBsaWNlbnNlIiB9LHsgImZpbHRlcnNfbGliX2hpZ2hwYXNzX2F1dGhvciI6ICJKdWxpdXMgTy4gU21pdGggSUlJIiB9LHsgImZpbHRlcnNfbGliX2hpZ2hwYXNzX2NvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzX2xpYl9paXJfYXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVyc19saWJfaWlyX2NvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzX2xpYl9paXJfbGljZW5zZSI6ICJNSVQtc3R5bGUgU1RLLTQuMyBsaWNlbnNlIiB9LHsgImZpbHRlcnNfbGliX2xvd3Bhc3MwX2hpZ2hwYXNzMSI6ICJNSVQtc3R5bGUgU1RLLTQuMyBsaWNlbnNlIiB9LHsgImZpbHRlcnNfbGliX2xvd3Bhc3MwX2hpZ2hwYXNzMV9hdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzX2xpYl9sb3dwYXNzX2F1dGhvciI6ICJKdWxpdXMgTy4gU21pdGggSUlJIiB9LHsgImZpbHRlcnNfbGliX2xvd3Bhc3NfY29weXJpZ2h0IjogIkNvcHlyaWdodCAoQykgMjAwMy0yMDE5IGJ5IEp1bGl1cyBPLiBTbWl0aCBJSUkgPGpvc0BjY3JtYS5zdGFuZm9yZC5lZHU+IiB9LHsgImZpbHRlcnNfbGliX2xvd3Bhc3NfbGljZW5zZSI6ICJNSVQtc3R5bGUgU1RLLTQuMyBsaWNlbnNlIiB9LHsgImZpbHRlcnNfbGliX25hbWUiOiAiRmF1c3QgRmlsdGVycyBMaWJyYXJ5IiB9LHsgImZpbHRlcnNfbGliX3RmMl9hdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzX2xpYl90ZjJfY29weXJpZ2h0IjogIkNvcHlyaWdodCAoQykgMjAwMy0yMDE5IGJ5IEp1bGl1cyBPLiBTbWl0aCBJSUkgPGpvc0BjY3JtYS5zdGFuZm9yZC5lZHU+IiB9LHsgImZpbHRlcnNfbGliX3RmMl9saWNlbnNlIjogIk1JVC1zdHlsZSBTVEstNC4zIGxpY2Vuc2UiIH0seyAiZmlsdGVyc19saWJfdGYyc19hdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzX2xpYl90ZjJzX2NvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzX2xpYl90ZjJzX2xpY2Vuc2UiOiAiTUlULXN0eWxlIFNUSy00LjMgbGljZW5zZSIgfSx7ICJmaWx0ZXJzX2xpYl92ZXJzaW9uIjogIjAuMyIgfSx7ICJpZCI6ICJwYW5vcmFtX2VuaGFuY2VyIiB9LHsgImxpYnJhcnlfcGF0aDAiOiAiL2xpYnJhcmllcy9zdGRmYXVzdC5saWIiIH0seyAibGlicmFyeV9wYXRoMSI6ICIvbGlicmFyaWVzL2Jhc2ljcy5saWIiIH0seyAibGlicmFyeV9wYXRoMiI6ICIvbGlicmFyaWVzL3NpZ25hbHMubGliIiB9LHsgImxpYnJhcnlfcGF0aDMiOiAiL2xpYnJhcmllcy9tYXRocy5saWIiIH0seyAibGlicmFyeV9wYXRoNCI6ICIvbGlicmFyaWVzL3BsYXRmb3JtLmxpYiIgfSx7ICJsaWJyYXJ5X3BhdGg1IjogIi9saWJyYXJpZXMvZGVsYXlzLmxpYiIgfSx7ICJsaWJyYXJ5X3BhdGg2IjogIi9saWJyYXJpZXMvZmlsdGVycy5saWIiIH0seyAibWF0aHNfbGliX2F1dGhvciI6ICJHUkFNRSIgfSx7ICJtYXRoc19saWJfY29weXJpZ2h0IjogIkdSQU1FIiB9LHsgIm1hdGhzX2xpYl9saWNlbnNlIjogIkxHUEwgd2l0aCBleGNlcHRpb24iIH0seyAibWF0aHNfbGliX25hbWUiOiAiRmF1c3QgTWF0aCBMaWJyYXJ5IiB9LHsgIm1hdGhzX2xpYl92ZXJzaW9uIjogIjIuNSIgfSx7ICJuYW1lIjogIlN0ZXJlb0VuaGFuY2VyIiB9LHsgInBsYXRmb3JtX2xpYl9uYW1lIjogIkdlbmVyaWMgUGxhdGZvcm0gTGlicmFyeSIgfSx7ICJwbGF0Zm9ybV9saWJfdmVyc2lvbiI6ICIwLjIiIH0seyAic2hvcnRuYW1lIjogIlBhbm9yYW0iIH0seyAic2lnbmFsc19saWJfbmFtZSI6ICJGYXVzdCBTaWduYWwgUm91dGluZyBMaWJyYXJ5IiB9LHsgInNpZ25hbHNfbGliX3ZlcnNpb24iOiAiMC4zIiB9LHsgInZlcnNpb24iOiAiMi41Mi4zIiB9XSwidWkiOiBbIHsidHlwZSI6ICJ2Z3JvdXAiLCJsYWJlbCI6ICJTdGVyZW9FbmhhbmNlciIsIml0ZW1zIjogWyB7InR5cGUiOiAiaHNsaWRlciIsImxhYmVsIjogIkRlbGF5IHdpZHRoIiwic2hvcnRuYW1lIjogIkRlbGF5X3dpZHRoIiwiYWRkcmVzcyI6ICIvU3RlcmVvRW5oYW5jZXIvRGVsYXlfd2lkdGgiLCJpbmRleCI6IDUyNDQyMCwibWV0YSI6IFt7ICJuYW1lIjogIkRlbGF5IiB9LHsgInN0eWxlIjogImtub2IiIH0seyAidG9vbHRpcCI6ICJEZWxheSBXaWR0aCIgfV0sImluaXQiOiAwLCJtaW4iOiAwLCJtYXgiOiAxLCJzdGVwIjogMC4wMX0seyJ0eXBlIjogImhzbGlkZXIiLCJsYWJlbCI6ICJGcmVxdWVuY3kgd2lkdGgiLCJzaG9ydG5hbWUiOiAiRnJlcXVlbmN5X3dpZHRoIiwiYWRkcmVzcyI6ICIvU3RlcmVvRW5oYW5jZXIvRnJlcXVlbmN5X3dpZHRoIiwiaW5kZXgiOiA1MjQ1MTIsIm1ldGEiOiBbeyAibmFtZSI6ICJGcmVxdWVuY3kiIH0seyAic3R5bGUiOiAia25vYiIgfSx7ICJ0b29sdGlwIjogIkZyZXF1ZW5jeSBXaWR0aCIgfV0sImluaXQiOiAwLCJtaW4iOiAwLCJtYXgiOiAxLCJzdGVwIjogMC4wMX0seyJ0eXBlIjogImNoZWNrYm94IiwibGFiZWwiOiAiYnlwYXNzIiwic2hvcnRuYW1lIjogImJ5cGFzcyIsImFkZHJlc3MiOiAiL1N0ZXJlb0VuaGFuY2VyL2J5cGFzcyIsImluZGV4IjogMjh9XX1dfQ=="; }

/************************************************************************
 FAUST Architecture File
 Copyright (C) 2003-2019 GRAME, Centre National de Creation Musicale
 ---------------------------------------------------------------------
 This Architecture section is free software; you can redistribute it
 and/or modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 3 of
 the License, or (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with this program; If not, see <http://www.gnu.org/licenses/>.
 
 EXCEPTION : As a special exception, you may create a larger work
 that contains this FAUST architecture section and distribute
 that work under terms of your choice, so long as this FAUST
 architecture section is not modified.
 
 ************************************************************************
 ************************************************************************/

'use strict';

if (typeof (AudioWorkletNode) === "undefined") {
    alert("AudioWorklet is not supported in this browser !")
}

class StereoEnhancerNode extends AudioWorkletNode {

    constructor(context, baseURL, options) {
        super(context, 'StereoEnhancer', options);

        this.baseURL = baseURL;
        this.json = options.processorOptions.json;
        this.json_object = JSON.parse(this.json);

        // JSON parsing functions
        this.parse_ui = function (ui, obj) {
            for (var i = 0; i < ui.length; i++) {
                this.parse_group(ui[i], obj);
            }
        }

        this.parse_group = function (group, obj) {
            if (group.items) {
                this.parse_items(group.items, obj);
            }
        }

        this.parse_items = function (items, obj) {
            for (var i = 0; i < items.length; i++) {
                this.parse_item(items[i], obj);
            }
        }

        this.parse_item = function (item, obj) {
            if (item.type === "vgroup"
                || item.type === "hgroup"
                || item.type === "tgroup") {
                this.parse_items(item.items, obj);
            } else if (item.type === "hbargraph"
                || item.type === "vbargraph") {
                // Keep bargraph adresses
                obj.outputs_items.push(item.address);
            } else if (item.type === "vslider"
                || item.type === "hslider"
                || item.type === "button"
                || item.type === "checkbox"
                || item.type === "nentry") {
                // Keep inputs adresses
                obj.inputs_items.push(item.address);
                obj.descriptor.push(item);
                // Decode MIDI
                if (item.meta !== undefined) {
                    for (var i = 0; i < item.meta.length; i++) {
                        if (item.meta[i].midi !== undefined) {
                            if (item.meta[i].midi.trim() === "pitchwheel") {
                                obj.fPitchwheelLabel.push({
                                    path: item.address,
                                    min: parseFloat(item.min),
                                    max: parseFloat(item.max)
                                });
                            } else if (item.meta[i].midi.trim().split(" ")[0] === "ctrl") {
                                obj.fCtrlLabel[parseInt(item.meta[i].midi.trim().split(" ")[1])]
                                    .push({
                                        path: item.address,
                                        min: parseFloat(item.min),
                                        max: parseFloat(item.max)
                                    });
                            }
                        }
                    }
                }
                // Define setXXX/getXXX, replacing '/c' with 'C' everywhere in the string
                var set_name = "set" + item.address;
                var get_name = "get" + item.address;
                set_name = set_name.replace(/\/./g, (x) => { return x.substr(1, 1).toUpperCase(); });
                get_name = get_name.replace(/\/./g, (x) => { return x.substr(1, 1).toUpperCase(); });
                obj[set_name] = (val) => { obj.setParamValue(item.address, val); };
                obj[get_name] = () => { return obj.getParamValue(item.address); };
                //console.log(set_name);
                //console.log(get_name);
            }
        }

        this.output_handler = null;

        // input/output items
        this.inputs_items = [];
        this.outputs_items = [];
        this.descriptor = [];

        // MIDI
        this.fPitchwheelLabel = [];
        this.fCtrlLabel = new Array(128);
        for (var i = 0; i < this.fCtrlLabel.length; i++) { this.fCtrlLabel[i] = []; }

        // Parse UI
        this.parse_ui(this.json_object.ui, this);

        // Set message handler
        this.port.onmessage = this.handleMessage.bind(this);
        try {
            if (this.parameters) this.parameters.forEach(p => p.automationRate = "k-rate");
        } catch (e) { }
    }

    // To be called by the message port with messages coming from the processor
    handleMessage(event) {
        var msg = event.data;
        if (this.output_handler) {
            this.output_handler(msg.path, msg.value);
        }
    }

    // Public API

    /**
     * Destroy the node, deallocate resources.
     */
    destroy() {
        this.port.postMessage({ type: "destroy" });
        this.port.close();
    }

    /**
     *  Returns a full JSON description of the DSP.
     */
    getJSON() {
        return this.json;
    }

    // For WAP
    async getMetadata() {
        return new Promise(resolve => {
            let real_url = (this.baseURL === "") ? "main.json" : (this.baseURL + "/main.json");
            fetch(real_url).then(responseJSON => {
                return responseJSON.json();
            }).then(json => {
                resolve(json);
            })
        });
    }

    /**
     *  Set the control value at a given path.
     *
     * @param path - a path to the control
     * @param val - the value to be set
     */
    setParamValue(path, val) {
        // Needed for sample accurate control
        this.parameters.get(path).setValueAtTime(val, 0);
    }

    // For WAP
    setParam(path, val) {
        // Needed for sample accurate control
        this.parameters.get(path).setValueAtTime(val, 0);
    }

    /**
     *  Get the control value at a given path.
     *
     * @return the current control value
     */
    getParamValue(path) {
        return this.parameters.get(path).value;
    }

    // For WAP
    getParam(path) {
        return this.parameters.get(path).value;
    }

    /**
     * Setup a control output handler with a function of type (path, value)
     * to be used on each generated output value. This handler will be called
     * each audio cycle at the end of the 'compute' method.
     *
     * @param handler - a function of type function(path, value)
     */
    setOutputParamHandler(handler) {
        this.output_handler = handler;
    }

    /**
     * Get the current output handler.
     */
    getOutputParamHandler() {
        return this.output_handler;
    }

    getNumInputs() {
        return parseInt(this.json_object.inputs);
    }

    getNumOutputs() {
        return parseInt(this.json_object.outputs);
    }

    // For WAP
    inputChannelCount() {
        return parseInt(this.json_object.inputs);
    }

    outputChannelCount() {
        return parseInt(this.json_object.outputs);
    }

    /**
     * Returns an array of all input paths (to be used with setParamValue/getParamValue)
     */
    getParams() {
        return this.inputs_items;
    }

    // For WAP
    getDescriptor() {
        var desc = {};
        for (const item in this.descriptor) {
            if (this.descriptor.hasOwnProperty(item)) {
                if (this.descriptor[item].label != "bypass") {
                    desc = Object.assign({ [this.descriptor[item].label]: { minValue: this.descriptor[item].min, maxValue: this.descriptor[item].max, defaultValue: this.descriptor[item].init } }, desc);
                }
            }
        }
        return desc;
    }

    /**
     * Control change
     *
     * @param channel - the MIDI channel (0..15, not used for now)
     * @param ctrl - the MIDI controller number (0..127)
     * @param value - the MIDI controller value (0..127)
     */
    ctrlChange(channel, ctrl, value) {
        if (this.fCtrlLabel[ctrl] !== []) {
            for (var i = 0; i < this.fCtrlLabel[ctrl].length; i++) {
                var path = this.fCtrlLabel[ctrl][i].path;
                this.setParamValue(path, StereoEnhancerNode.remap(value, 0, 127, this.fCtrlLabel[ctrl][i].min, this.fCtrlLabel[ctrl][i].max));
                if (this.output_handler) {
                    this.output_handler(path, this.getParamValue(path));
                }
            }
        }
    }

    /**
     * PitchWeel
     *
     * @param channel - the MIDI channel (0..15, not used for now)
     * @param value - the MIDI controller value (0..16383)
     */
    pitchWheel(channel, wheel) {
        for (var i = 0; i < this.fPitchwheelLabel.length; i++) {
            var pw = this.fPitchwheelLabel[i];
            this.setParamValue(pw.path, StereoEnhancerNode.remap(wheel, 0, 16383, pw.min, pw.max));
            if (this.output_handler) {
                this.output_handler(pw.path, this.getParamValue(pw.path));
            }
        }
    }

    /**
     * Generic MIDI message handler.
     */
    midiMessage(data) {
        var cmd = data[0] >> 4;
        var channel = data[0] & 0xf;
        var data1 = data[1];
        var data2 = data[2];

        if (channel === 9) {
            return;
        } else if (cmd === 11) {
            this.ctrlChange(channel, data1, data2);
        } else if (cmd === 14) {
            this.pitchWheel(channel, (data2 * 128.0 + data1));
        }
    }

    // For WAP
    onMidi(data) {
        midiMessage(data);
    }

    /**
     * @returns {Object} describes the path for each available param and its current value
     */
    async getState() {
        var params = new Object();
        for (let i = 0; i < this.getParams().length; i++) {
            Object.assign(params, { [this.getParams()[i]]: `${this.getParam(this.getParams()[i])}` });
        }
        return new Promise(resolve => { resolve(params) });
    }

    /**
     * Sets each params with the value indicated in the state object
     * @param {Object} state 
     */
    async setState(state) {
        return new Promise(resolve => {
            for (const param in state) {
                if (state.hasOwnProperty(param)) this.setParam(param, state[param]);
            }
            try {
                this.gui.setAttribute('state', JSON.stringify(state));
            } catch (error) {
                console.warn("Plugin without gui or GUI not defined", error);
            }
            resolve(state);
        })
    }

    /**
     * A different call closer to the preset management
     * @param {Object} patch to assign as a preset to the node
     */
    setPatch(patch) {
        this.setState(this.presets[patch])
    }

    static remap(v, mn0, mx0, mn1, mx1) {
        return (1.0 * (v - mn0) / (mx0 - mn0)) * (mx1 - mn1) + mn1;
    }

}

// Factory class
class StereoEnhancer {

    static fWorkletProcessors;

    /**
     * Factory constructor.
     *
     * @param context - the audio context
     * @param baseURL - the baseURL of the plugin folder
     */
    constructor(context, baseURL = "") {
        console.log("baseLatency " + context.baseLatency);
        console.log("outputLatency " + context.outputLatency);
        console.log("sampleRate " + context.sampleRate);

        this.context = context;
        this.baseURL = baseURL;
        this.pathTable = [];

        this.fWorkletProcessors = this.fWorkletProcessors || [];
    }

    heap2Str(buf) {
        let str = "";
        let i = 0;
        while (buf[i] !== 0) {
            str += String.fromCharCode(buf[i++]);
        }
        return str;
    }

    /**
     * Load additionnal resources to prepare the custom AudioWorkletNode. Returns a promise to be used with the created node.
     */
    async load() {
        try {
            const importObject = {
                env: {
                    memoryBase: 0,
                    tableBase: 0,
                    _abs: Math.abs,

                    // Float version
                    _acosf: Math.acos,
                    _asinf: Math.asin,
                    _atanf: Math.atan,
                    _atan2f: Math.atan2,
                    _ceilf: Math.ceil,
                    _cosf: Math.cos,
                    _expf: Math.exp,
                    _floorf: Math.floor,
                    _fmodf: (x, y) => x % y,
                    _logf: Math.log,
                    _log10f: Math.log10,
                    _max_f: Math.max,
                    _min_f: Math.min,
                    _remainderf: (x, y) => x - Math.round(x / y) * y,
                    _powf: Math.pow,
                    _roundf: Math.fround,
                    _sinf: Math.sin,
                    _sqrtf: Math.sqrt,
                    _tanf: Math.tan,
                    _acoshf: Math.acosh,
                    _asinhf: Math.asinh,
                    _atanhf: Math.atanh,
                    _coshf: Math.cosh,
                    _sinhf: Math.sinh,
                    _tanhf: Math.tanh,
                    _isnanf: Number.isNaN,
                    _isinff: function (x) { return !isFinite(x); },
                    _copysignf: function (x, y) { return Math.sign(x) === Math.sign(y) ? x : -x; },

                    // Double version
                    _acos: Math.acos,
                    _asin: Math.asin,
                    _atan: Math.atan,
                    _atan2: Math.atan2,
                    _ceil: Math.ceil,
                    _cos: Math.cos,
                    _exp: Math.exp,
                    _floor: Math.floor,
                    _fmod: (x, y) => x % y,
                    _log: Math.log,
                    _log10: Math.log10,
                    _max_: Math.max,
                    _min_: Math.min,
                    _remainder: (x, y) => x - Math.round(x / y) * y,
                    _pow: Math.pow,
                    _round: Math.fround,
                    _sin: Math.sin,
                    _sqrt: Math.sqrt,
                    _tan: Math.tan,
                    _acosh: Math.acosh,
                    _asinh: Math.asinh,
                    _atanh: Math.atanh,
                    _cosh: Math.cosh,
                    _sinh: Math.sinh,
                    _tanh: Math.tanh,
                    _isnan: Number.isNaN,
                    _isinf: function (x) { return !isFinite(x); },
                    _copysign: function (x, y) { return Math.sign(x) === Math.sign(y) ? x : -x; },

                    table: new WebAssembly.Table({ initial: 0, element: "anyfunc" })
                }
            };

            let real_url = (this.baseURL === "") ? "StereoEnhancer.wasm" : (this.baseURL + "/StereoEnhancer.wasm");
            const dspFile = await fetch(real_url);
            const dspBuffer = await dspFile.arrayBuffer();
            const dspModule = await WebAssembly.compile(dspBuffer);
            const dspInstance = await WebAssembly.instantiate(dspModule, importObject);

            let HEAPU8 = new Uint8Array(dspInstance.exports.memory.buffer);
            let json = this.heap2Str(HEAPU8);
            let json_object = JSON.parse(json);
            let options = { wasm_module: dspModule, json: json };

            if (this.fWorkletProcessors.indexOf(name) === -1) {
                try {
                    let re = /JSON_STR/g;
                    let StereoEnhancerProcessorString1 = StereoEnhancerProcessorString.replace(re, json);
                    let real_url = window.URL.createObjectURL(new Blob([StereoEnhancerProcessorString1], { type: 'text/javascript' }));
                    await this.context.audioWorklet.addModule(real_url);
                    // Keep the DSP name
                    console.log("Keep the DSP name");
                    this.fWorkletProcessors.push(name);
                } catch (e) {
                    console.error(e);
                    console.error("Faust " + this.name + " cannot be loaded or compiled");
                    return null;
                }
            }
            this.node = new StereoEnhancerNode(this.context, this.baseURL,
                {
                    numberOfInputs: (parseInt(json_object.inputs) > 0) ? 1 : 0,
                    numberOfOutputs: (parseInt(json_object.outputs) > 0) ? 1 : 0,
                    channelCount: Math.max(1, parseInt(json_object.inputs)),
                    outputChannelCount: [parseInt(json_object.outputs)],
                    channelCountMode: "explicit",
                    channelInterpretation: "speakers",
                    processorOptions: options
                });
            this.node.onprocessorerror = () => { console.log('An error from StereoEnhancer-processor was detected.'); }
            return (this.node);
        } catch (e) {
            console.error(e);
            console.error("Faust " + this.name + " cannot be loaded or compiled");
            return null;
        }
    }

    async loadGui() {
        return new Promise((resolve, reject) => {
            try {
                // DO THIS ONLY ONCE. If another instance has already been added, do not add the html file again
                let real_url = (this.baseURL === "") ? "main.html" : (this.baseURL + "/main.html");
                if (!this.linkExists(real_url)) {
                    // LINK DOES NOT EXIST, let's add it to the document
                    var link = document.createElement('link');
                    link.rel = 'import';
                    link.href = real_url;
                    document.head.appendChild(link);
                    link.onload = (e) => {
                        // the file has been loaded, instanciate GUI
                        // and get back the HTML elem
                        // HERE WE COULD REMOVE THE HARD CODED NAME
                        var element = createStereoEnhancerGUI(this.node);
                        resolve(element);
                    }
                } else {
                    // LINK EXIST, WE AT LEAST CREATED ONE INSTANCE PREVIOUSLY
                    // so we can create another instance
                    var element = createStereoEnhancerGUI(this.node);
                    resolve(element);
                }
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    };

    linkExists(url) {
        return document.querySelectorAll(`link[href="${url}"]`).length > 0;
    }
}

// Template string for AudioWorkletProcessor

let StereoEnhancerProcessorString = `

    'use strict';

    // Monophonic Faust DSP
    class StereoEnhancerProcessor extends AudioWorkletProcessor {
        
        // JSON parsing functions
        static parse_ui(ui, obj, callback)
        {
            for (var i = 0; i < ui.length; i++) {
                StereoEnhancerProcessor.parse_group(ui[i], obj, callback);
            }
        }
        
        static parse_group(group, obj, callback)
        {
            if (group.items) {
                StereoEnhancerProcessor.parse_items(group.items, obj, callback);
            }
        }
        
        static parse_items(items, obj, callback)
        {
            for (var i = 0; i < items.length; i++) {
                callback(items[i], obj, callback);
            }
        }
        
        static parse_item1(item, obj, callback)
        {
            if (item.type === "vgroup"
                || item.type === "hgroup"
                || item.type === "tgroup") {
                StereoEnhancerProcessor.parse_items(item.items, obj, callback);
            } else if (item.type === "hbargraph"
                       || item.type === "vbargraph") {
                // Nothing
            } else if (item.type === "vslider"
                       || item.type === "hslider"
                       || item.type === "button"
                       || item.type === "checkbox"
                       || item.type === "nentry") {
                obj.push({ name: item.address,
                         defaultValue: item.init,
                         minValue: item.min,
                         maxValue: item.max });
            }
        }
        
        static parse_item2(item, obj, callback)
        {
            if (item.type === "vgroup"
                || item.type === "hgroup"
                || item.type === "tgroup") {
                StereoEnhancerProcessor.parse_items(item.items, obj, callback);
            } else if (item.type === "hbargraph"
                       || item.type === "vbargraph") {
                // Keep bargraph adresses
                obj.outputs_items.push(item.address);
                obj.pathTable[item.address] = parseInt(item.index);
            } else if (item.type === "vslider"
                       || item.type === "hslider"
                       || item.type === "button"
                       || item.type === "checkbox"
                       || item.type === "nentry") {
                // Keep inputs adresses
                obj.inputs_items.push(item.address);
                obj.pathTable[item.address] = parseInt(item.index);
            }
        }
     
        static get parameterDescriptors() 
        {
            // Analyse JSON to generate AudioParam parameters
            var params = [];
            StereoEnhancerProcessor.parse_ui(JSON.parse(\`JSON_STR\`).ui, params, StereoEnhancerProcessor.parse_item1);
            return params;
        }
       
        constructor(options)
        {
            super(options);
            this.running = true;
            
            const importObject = {
                    env: {
                        memoryBase: 0,
                        tableBase: 0,

                        // Integer version
                        _abs: Math.abs,

                        // Float version
                        _acosf: Math.acos,
                        _asinf: Math.asin,
                        _atanf: Math.atan,
                        _atan2f: Math.atan2,
                        _ceilf: Math.ceil,
                        _cosf: Math.cos,
                        _expf: Math.exp,
                        _floorf: Math.floor,
                        _fmodf: function(x, y) { return x % y; },
                        _logf: Math.log,
                        _log10f: Math.log10,
                        _max_f: Math.max,
                        _min_f: Math.min,
                        _remainderf: function(x, y) { return x - Math.round(x/y) * y; },
                        _powf: Math.pow,
                        _roundf: Math.fround,
                        _sinf: Math.sin,
                        _sqrtf: Math.sqrt,
                        _tanf: Math.tan,
                        _acoshf: Math.acosh,
                        _asinhf: Math.asinh,
                        _atanhf: Math.atanh,
                        _coshf: Math.cosh,
                        _sinhf: Math.sinh,
                        _tanhf: Math.tanh,

                        // Double version
                        _acos: Math.acos,
                        _asin: Math.asin,
                        _atan: Math.atan,
                        _atan2: Math.atan2,
                        _ceil: Math.ceil,
                        _cos: Math.cos,
                        _exp: Math.exp,
                        _floor: Math.floor,
                        _fmod: function(x, y) { return x % y; },
                        _log: Math.log,
                        _log10: Math.log10,
                        _max_: Math.max,
                        _min_: Math.min,
                        _remainder:function(x, y) { return x - Math.round(x/y) * y; },
                        _pow: Math.pow,
                        _round: Math.fround,
                        _sin: Math.sin,
                        _sqrt: Math.sqrt,
                        _tan: Math.tan,
                        _acosh: Math.acosh,
                        _asinh: Math.asinh,
                        _atanh: Math.atanh,
                        _cosh: Math.cosh,
                        _sinh: Math.sinh,
                        _tanh: Math.tanh,

                        table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' })
                    }
            };
            
            this.StereoEnhancer_instance = new WebAssembly.Instance(options.processorOptions.wasm_module, importObject);
            this.json_object = JSON.parse(options.processorOptions.json);
         
            this.output_handler = function(path, value) { this.port.postMessage({ path: path, value: value }); };
            
            this.ins = null;
            this.outs = null;

            this.dspInChannnels = [];
            this.dspOutChannnels = [];

            this.numIn = parseInt(this.json_object.inputs);
            this.numOut = parseInt(this.json_object.outputs);

            // Memory allocator
            this.ptr_size = 4;
            this.sample_size = 4;
            this.integer_size = 4;
            
            this.factory = this.StereoEnhancer_instance.exports;
            this.HEAP = this.StereoEnhancer_instance.exports.memory.buffer;
            this.HEAP32 = new Int32Array(this.HEAP);
            this.HEAPF32 = new Float32Array(this.HEAP);

            // Warning: keeps a ref on HEAP in Chrome and prevent proper GC
            //console.log(this.HEAP);
            //console.log(this.HEAP32);
            //console.log(this.HEAPF32);

            // bargraph
            this.outputs_timer = 5;
            this.outputs_items = [];

            // input items
            this.inputs_items = [];
        
            // Start of HEAP index

            // DSP is placed first with index 0. Audio buffer start at the end of DSP.
            this.audio_heap_ptr = parseInt(this.json_object.size);

            // Setup pointers offset
            this.audio_heap_ptr_inputs = this.audio_heap_ptr;
            this.audio_heap_ptr_outputs = this.audio_heap_ptr_inputs + (this.numIn * this.ptr_size);

            // Setup buffer offset
            this.audio_heap_inputs = this.audio_heap_ptr_outputs + (this.numOut * this.ptr_size);
            this.audio_heap_outputs = this.audio_heap_inputs + (this.numIn * NUM_FRAMES * this.sample_size);
            
            // Start of DSP memory : DSP is placed first with index 0
            this.dsp = 0;

            this.pathTable = [];
         
            // Send output values to the AudioNode
            this.update_outputs = function ()
            {
                if (this.outputs_items.length > 0 && this.output_handler && this.outputs_timer-- === 0) {
                    this.outputs_timer = 5;
                    for (var i = 0; i < this.outputs_items.length; i++) {
                        this.output_handler(this.outputs_items[i], this.HEAPF32[this.pathTable[this.outputs_items[i]] >> 2]);
                    }
                }
            }
            
            this.initAux = function ()
            {
                var i;
                
                if (this.numIn > 0) {
                    this.ins = this.audio_heap_ptr_inputs;
                    for (i = 0; i < this.numIn; i++) {
                        this.HEAP32[(this.ins >> 2) + i] = this.audio_heap_inputs + ((NUM_FRAMES * this.sample_size) * i);
                    }
                    
                    // Prepare Ins buffer tables
                    var dspInChans = this.HEAP32.subarray(this.ins >> 2, (this.ins + this.numIn * this.ptr_size) >> 2);
                    for (i = 0; i < this.numIn; i++) {
                        this.dspInChannnels[i] = this.HEAPF32.subarray(dspInChans[i] >> 2, (dspInChans[i] + NUM_FRAMES * this.sample_size) >> 2);
                    }
                }
                
                if (this.numOut > 0) {
                    this.outs = this.audio_heap_ptr_outputs;
                    for (i = 0; i < this.numOut; i++) {
                        this.HEAP32[(this.outs >> 2) + i] = this.audio_heap_outputs + ((NUM_FRAMES * this.sample_size) * i);
                    }
                    
                    // Prepare Out buffer tables
                    var dspOutChans = this.HEAP32.subarray(this.outs >> 2, (this.outs + this.numOut * this.ptr_size) >> 2);
                    for (i = 0; i < this.numOut; i++) {
                        this.dspOutChannnels[i] = this.HEAPF32.subarray(dspOutChans[i] >> 2, (dspOutChans[i] + NUM_FRAMES * this.sample_size) >> 2);
                    }
                }
                
                // Parse UI
                StereoEnhancerProcessor.parse_ui(this.json_object.ui, this, StereoEnhancerProcessor.parse_item2);
                
                // Init DSP
                this.factory.init(this.dsp, sampleRate); // 'sampleRate' is defined in AudioWorkletGlobalScope  
            }

            this.setParamValue = function (path, val)
            {
                this.HEAPF32[this.pathTable[path] >> 2] = val;
            }

            this.getParamValue = function (path)
            {
                return this.HEAPF32[this.pathTable[path] >> 2];
            }

            // Init resulting DSP
            this.initAux();
        }
        
        process(inputs, outputs, parameters) 
        {
            var input = inputs[0];
            var output = outputs[0];
            
            // Check inputs
            if (this.numIn > 0 && (!input || !input[0] || input[0].length === 0)) {
                //console.log("Process input error");
                return true;
            }
            // Check outputs
            if (this.numOut > 0 && (!output || !output[0] || output[0].length === 0)) {
                //console.log("Process output error");
                return true;
            }
            
            // Copy inputs
            if (input !== undefined) {
                for (var chan = 0; chan < Math.min(this.numIn, input.length); ++chan) {
                    var dspInput = this.dspInChannnels[chan];
                    dspInput.set(input[chan]);
                }
            }
            
            /*
            TODO: sample accurate control change is not yet handled
            When no automation occurs, params[i][1] has a length of 1,
            otherwise params[i][1] has a length of NUM_FRAMES with possible control change each sample
            */
            
            // Update controls
            for (const path in parameters) {
                const paramArray = parameters[path];
                this.setParamValue(path, paramArray[0]);
            }
        
          	// Compute
            try {
                this.factory.compute(this.dsp, NUM_FRAMES, this.ins, this.outs);
            } catch(e) {
                console.log("ERROR in compute (" + e + ")");
            }
            
            // Update bargraph
            this.update_outputs();
            
            // Copy outputs
            if (output !== undefined) {
                for (var chan = 0; chan < Math.min(this.numOut, output.length); ++chan) {
                    var dspOutput = this.dspOutChannnels[chan];
                    output[chan].set(dspOutput);
                }
            }
            
            return this.running;
    	}
        
        handleMessage(event)
        {
            var msg = event.data;
            switch (msg.type) {
                case "destroy": this.running = false; break;
            }
        }
    }

    // Globals
    const NUM_FRAMES = 128;
    try {
        registerProcessor('StereoEnhancer', StereoEnhancerProcessor);
    } catch (error) {
        console.warn(error);
    }
`;

const dspName = "StereoEnhancer";

// WAP factory or npm package module
if (typeof module === "undefined") {
    window.StereoEnhancer = StereoEnhancer;
    window.FaustStereoEnhancer = StereoEnhancer;
    window[dspName] = StereoEnhancer;
} else {
    module.exports = { StereoEnhancer };
}

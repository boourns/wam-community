/* eslint-disable no-underscore-dangle */
// Double role for WebAudioModule :
// 1 - Factory for providing the DSP/WebAudio node and GUI
// 2 - This makes the instance of the current class an Observable
//     (state in WebAudioModule, initialized with the default values of
//      the params variable below...)

// IMPORT NECESSARY DSK FILES
import WebAudioModule from "../utils/sdk/src/WebAudioModule.js";
import ParamMgrFactory from "../utils/sdk-parammgr/src/ParamMgrFactory.js";

// DSP part
import GraphicEQNode from "./Node.js";
// GUI part
import { createElement } from "./Gui/index.js";

/**
 * @param {URL} relativeURL
 * @returns {string}
 */
const getBasetUrl = (relativeURL) => {
  const baseURL = relativeURL.href.substring(0, relativeURL.href.lastIndexOf("/"));
  return baseURL;
};

// Definition of a new plugin
// All plugins must inherit from WebAudioModule
export default class GraphicEQPlugin extends WebAudioModule {
  _baseURL = getBasetUrl(new URL("..", import.meta.url));

  _descriptorUrl = `${this._baseURL}/graphicEqualizer/descriptor.json`;

  async _loadDescriptor() {
    const url = this._descriptorUrl;
    if (!url) throw new TypeError("Descriptor not found");
    const response = await fetch(url);
    const descriptor = await response.json();
    Object.assign(this.descriptor, descriptor);
  }

  async initialize(state) {
    await this._loadDescriptor();
    return super.initialize(state);
  }

  // The plugin must redefine the async method createAudionode()
  // that returns an <Audionode>
  async createAudioNode(initialState) {
    // this node implements the DSP code. It is seen as a single WebAudio node
    // and shares the connect/disconnect methods, but it can be a graph
    // of nodes.
    const graphicEQNode = new GraphicEQNode(this.audioContext);
    graphicEQNode.createNodes();

    // No need to define exposed parameters
    // let's generate one param per filter property

    // if some of the exposed parameters correspond to native WebAudio nodes, we will be
    // able to benefit from the WebAudio API implementation of automation
    const internalParamsConfig = {
      enabled: {
        defaultValue: 1,
        minValue: 0,
        maxValue: 1,
        onChange: (value) => {
          graphicEQNode.status = !!value;
        },
      },
    };
    /**
     * @param {AudioParam} param
     */
    const getParamConfigFromAudioParam = (param) => {
      const { minValue, maxValue, value: defaultValue } = param;
      return { minValue, maxValue, defaultValue };
    };
    graphicEQNode.filters.forEach((filter, index) => {
      const { type, Q, detune, frequency, gain } = filter;
      internalParamsConfig[`${type}_${index}_Q`] = {
        ...getParamConfigFromAudioParam(Q),
        onChange: (value) => {
          Q.value = value;
        },
      };
      internalParamsConfig[`${type}_${index}_detune`] = {
        ...getParamConfigFromAudioParam(detune),
        onChange: (value) => {
          detune.value = value;
        },
      };
      internalParamsConfig[`${type}_${index}_frequency`] = {
        ...getParamConfigFromAudioParam(frequency),
        onChange: (value) => {
          frequency.value = value;
        },
      };
      internalParamsConfig[`${type}_${index}_gain`] = {
        ...getParamConfigFromAudioParam(gain),
        onChange: (value) => {
          gain.value = value;
        },
      };
    });

    // hmmm no mapping...
    // const paramsMapping = {};

    // Create a param manager instance (ParamMgr comes from the SDK)
    // with the param configs
    const optionsIn = { internalParamsConfig };
    const paramMgrNode = await ParamMgrFactory.create(this, optionsIn);
    // Link the param manager to the DSP code of the plugin.
    // Remember that the param manager will provide automation, etc.
    graphicEQNode.setup(paramMgrNode);

    // If there is  an initial state at construction for this plugin,
    if (initialState) graphicEQNode.setState(initialState);
    //----
    return graphicEQNode;
  }

  createGui() {
    return createElement(this);
  }
}

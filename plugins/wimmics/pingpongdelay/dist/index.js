function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

// src/WebAudioModule.js
var WebAudioModule = class {
  static get isWebAudioModuleConstructor() {
    return true;
  }

  static createInstance(groupId, audioContext, initialState) {
    return new this(groupId, audioContext).initialize(initialState);
  }

  constructor(groupId, audioContext) {
    this._groupId = groupId;
    this._audioContext = audioContext;
    this._initialized = false;
    this._audioNode = void 0;
    this._timestamp = performance.now();
    this._guiModuleUrl = void 0;
    this._descriptorUrl = "./descriptor.json";
    this._descriptor = {
      name: `WebAudioModule_${this.constructor.name}`,
      vendor: "WebAudioModuleVendor",
      description: "",
      version: "0.0.0",
      apiVersion: "2.0.0",
      thumbnail: "",
      keywords: [],
      isInstrument: false,
      website: "",
      hasAudioInput: true,
      hasAudioOutput: true,
      hasAutomationInput: true,
      hasAutomationOutput: true,
      hasMidiInput: true,
      hasMidiOutput: true,
      hasMpeInput: true,
      hasMpeOutput: true,
      hasOscInput: true,
      hasOscOutput: true,
      hasSysexInput: true,
      hasSysexOutput: true
    };
  }

  get isWebAudioModule() {
    return true;
  }

  get groupId() {
    return this._groupId;
  }

  get moduleId() {
    return this.vendor + this.name;
  }

  get instanceId() {
    return this.moduleId + this._timestamp;
  }

  get descriptor() {
    return this._descriptor;
  }

  get name() {
    return this.descriptor.name;
  }

  get vendor() {
    return this.descriptor.vendor;
  }

  get audioContext() {
    return this._audioContext;
  }

  get audioNode() {
    if (!this.initialized) console.warn("WAM should be initialized before getting the audioNode");
    return this._audioNode;
  }

  set audioNode(node) {
    this._audioNode = node;
  }

  get initialized() {
    return this._initialized;
  }

  set initialized(value) {
    this._initialized = value;
  }

  async createAudioNode(initialState) {
    throw new TypeError("createAudioNode() not provided");
  }

  async initialize(state) {
    if (!this._audioNode) this.audioNode = await this.createAudioNode();
    this.initialized = true;
    return this;
  }

  async _loadGui() {
    const url = this._guiModuleUrl;
    if (!url) throw new TypeError("Gui module not found");
    return import(
    /* webpackIgnore: true */
    url);
  }

  async _loadDescriptor() {
    const url = this._descriptorUrl;
    if (!url) throw new TypeError("Descriptor not found");
    const response = await fetch(url);
    const descriptor = await response.json();
    Object.assign(this._descriptor, descriptor);
    return this._descriptor;
  }

  async createGui() {
    if (!this.initialized) console.warn("Plugin should be initialized before getting the gui");
    if (!this._guiModuleUrl) return void 0;
    const {
      createElement
    } = await this._loadGui();
    return createElement(this);
  }

  destroyGui() {}

};
var WebAudioModule_default = WebAudioModule; // src/RingBuffer.js

var getRingBuffer = moduleId => {
  const audioWorkletGlobalScope = globalThis;

  class RingBuffer2 {
    static getStorageForCapacity(capacity, Type) {
      if (!Type.BYTES_PER_ELEMENT) {
        throw new Error("Pass in a ArrayBuffer subclass");
      }

      const bytes = 8 + (capacity + 1) * Type.BYTES_PER_ELEMENT;
      return new SharedArrayBuffer(bytes);
    }

    constructor(sab, Type) {
      if (!Type.BYTES_PER_ELEMENT) {
        throw new Error("Pass a concrete typed array class as second argument");
      }

      this._Type = Type;
      this._capacity = (sab.byteLength - 8) / Type.BYTES_PER_ELEMENT;
      this.buf = sab;
      this.write_ptr = new Uint32Array(this.buf, 0, 1);
      this.read_ptr = new Uint32Array(this.buf, 4, 1);
      this.storage = new Type(this.buf, 8, this._capacity);
    }

    get type() {
      return this._Type.name;
    }

    push(elements) {
      const rd = Atomics.load(this.read_ptr, 0);
      const wr = Atomics.load(this.write_ptr, 0);

      if ((wr + 1) % this._storageCapacity() === rd) {
        return 0;
      }

      const toWrite = Math.min(this._availableWrite(rd, wr), elements.length);
      const firstPart = Math.min(this._storageCapacity() - wr, toWrite);
      const secondPart = toWrite - firstPart;

      this._copy(elements, 0, this.storage, wr, firstPart);

      this._copy(elements, firstPart, this.storage, 0, secondPart);

      Atomics.store(this.write_ptr, 0, (wr + toWrite) % this._storageCapacity());
      return toWrite;
    }

    pop(elements) {
      const rd = Atomics.load(this.read_ptr, 0);
      const wr = Atomics.load(this.write_ptr, 0);

      if (wr === rd) {
        return 0;
      }

      const isArray = !Number.isInteger(elements);
      const toRead = Math.min(this._availableRead(rd, wr), isArray ? elements.length : elements);

      if (isArray) {
        const firstPart = Math.min(this._storageCapacity() - rd, toRead);
        const secondPart = toRead - firstPart;

        this._copy(this.storage, rd, elements, 0, firstPart);

        this._copy(this.storage, 0, elements, firstPart, secondPart);
      }

      Atomics.store(this.read_ptr, 0, (rd + toRead) % this._storageCapacity());
      return toRead;
    }

    get empty() {
      const rd = Atomics.load(this.read_ptr, 0);
      const wr = Atomics.load(this.write_ptr, 0);
      return wr === rd;
    }

    get full() {
      const rd = Atomics.load(this.read_ptr, 0);
      const wr = Atomics.load(this.write_ptr, 0);
      return (wr + 1) % this._capacity !== rd;
    }

    get capacity() {
      return this._capacity - 1;
    }

    get availableRead() {
      const rd = Atomics.load(this.read_ptr, 0);
      const wr = Atomics.load(this.write_ptr, 0);
      return this._availableRead(rd, wr);
    }

    get availableWrite() {
      const rd = Atomics.load(this.read_ptr, 0);
      const wr = Atomics.load(this.write_ptr, 0);
      return this._availableWrite(rd, wr);
    }

    _availableRead(rd, wr) {
      if (wr > rd) {
        return wr - rd;
      }

      return wr + this._storageCapacity() - rd;
    }

    _availableWrite(rd, wr) {
      let rv = rd - wr - 1;

      if (wr >= rd) {
        rv += this._storageCapacity();
      }

      return rv;
    }

    _storageCapacity() {
      return this._capacity;
    }

    _copy(input, offsetInput, output, offsetOutput, size) {
      for (let i = 0; i < size; i++) {
        output[offsetOutput + i] = input[offsetInput + i];
      }
    }

  }

  if (audioWorkletGlobalScope.AudioWorkletProcessor) {
    const ModuleScope = audioWorkletGlobalScope.webAudioModules.getModuleScope(moduleId);
    if (!ModuleScope.RingBuffer) ModuleScope.RingBuffer = RingBuffer2;
  }

  return RingBuffer2;
};

var RingBuffer_default = getRingBuffer; // src/WamArrayRingBuffer.js

var getWamEventRingBuffer = moduleId => {
  const audioWorkletGlobalScope = globalThis;

  class WamEventRingBuffer2 {
    static DefaultExtraBytesPerEvent = 64;
    static WamEventBaseBytes = 4 + 1 + 8;
    static WamAutomationEventBytes = WamEventRingBuffer2.WamEventBaseBytes + 2 + 8 + 1;
    static WamTransportEventBytes = WamEventRingBuffer2.WamEventBaseBytes + 4 + 8 + 8 + 1 + 1 + 1;
    static WamMidiEventBytes = WamEventRingBuffer2.WamEventBaseBytes + 1 + 1 + 1;
    static WamBinaryEventBytes = WamEventRingBuffer2.WamEventBaseBytes + 4;

    static getStorageForEventCapacity(RingBuffer2, eventCapacity, maxBytesPerEvent = void 0) {
      if (maxBytesPerEvent === void 0) maxBytesPerEvent = WamEventRingBuffer2.DefaultExtraBytesPerEvent;else maxBytesPerEvent = Math.max(maxBytesPerEvent, WamEventRingBuffer2.DefaultExtraBytesPerEvent);
      const capacity = (Math.max(WamEventRingBuffer2.WamAutomationEventBytes, WamEventRingBuffer2.WamTransportEventBytes, WamEventRingBuffer2.WamMidiEventBytes, WamEventRingBuffer2.WamBinaryEventBytes) + maxBytesPerEvent) * eventCapacity;
      return RingBuffer2.getStorageForCapacity(capacity, Uint8Array);
    }

    constructor(RingBuffer2, sab, parameterIds, maxBytesPerEvent = void 0) {
      this._eventSizeBytes = {};
      this._encodeEventType = {};
      this._decodeEventType = {};
      const wamEventTypes = ["wam-automation", "wam-transport", "wam-midi", "wam-sysex", "wam-mpe", "wam-osc", "wam-info"];
      wamEventTypes.forEach((type, encodedType) => {
        let byteSize = 0;

        switch (type) {
          case "wam-automation":
            byteSize = WamEventRingBuffer2.WamAutomationEventBytes;
            break;

          case "wam-transport":
            byteSize = WamEventRingBuffer2.WamTransportEventBytes;
            break;

          case "wam-mpe":
          case "wam-midi":
            byteSize = WamEventRingBuffer2.WamMidiEventBytes;
            break;

          case "wam-osc":
          case "wam-sysex":
          case "wam-info":
            byteSize = WamEventRingBuffer2.WamBinaryEventBytes;
            break;
        }

        this._eventSizeBytes[type] = byteSize;
        this._encodeEventType[type] = encodedType;
        this._decodeEventType[encodedType] = type;
      });
      this._parameterCode = 0;
      this._parameterCodes = {};
      this._encodeParameterId = {};
      this._decodeParameterId = {};
      this.setParameterIds(parameterIds);
      this._sab = sab;
      if (maxBytesPerEvent === void 0) maxBytesPerEvent = WamEventRingBuffer2.DefaultExtraBytesPerEvent;else maxBytesPerEvent = Math.max(maxBytesPerEvent, WamEventRingBuffer2.DefaultExtraBytesPerEvent);
      this._eventBytesAvailable = Math.max(WamEventRingBuffer2.WamAutomationEventBytes, WamEventRingBuffer2.WamTransportEventBytes, WamEventRingBuffer2.WamMidiEventBytes, WamEventRingBuffer2.WamBinaryEventBytes) + maxBytesPerEvent;
      this._eventBytes = new ArrayBuffer(this._eventBytesAvailable);
      this._eventBytesView = new DataView(this._eventBytes);
      this._rb = new RingBuffer2(this._sab, Uint8Array);
      this._eventSizeArray = new Uint8Array(this._eventBytes, 0, 4);
      this._eventSizeView = new DataView(this._eventBytes, 0, 4);
    }

    _writeHeader(byteSize, type, time) {
      let byteOffset = 0;

      this._eventBytesView.setUint32(byteOffset, byteSize);

      byteOffset += 4;

      this._eventBytesView.setUint8(byteOffset, this._encodeEventType[type]);

      byteOffset += 1;

      this._eventBytesView.setFloat64(byteOffset, Number.isFinite(time) ? time : -1);

      byteOffset += 8;
      return byteOffset;
    }

    _encode(event) {
      let byteOffset = 0;
      const {
        type,
        time
      } = event;

      switch (event.type) {
        case "wam-automation":
          {
            if (!(event.data.id in this._encodeParameterId)) break;
            const byteSize = this._eventSizeBytes[type];
            byteOffset = this._writeHeader(byteSize, type, time);
            const {
              data
            } = event;
            const encodedParameterId = this._encodeParameterId[data.id];
            const {
              value,
              normalized
            } = data;

            this._eventBytesView.setUint16(byteOffset, encodedParameterId);

            byteOffset += 2;

            this._eventBytesView.setFloat64(byteOffset, value);

            byteOffset += 8;

            this._eventBytesView.setUint8(byteOffset, normalized ? 1 : 0);

            byteOffset += 1;
          }
          break;

        case "wam-transport":
          {
            const byteSize = this._eventSizeBytes[type];
            byteOffset = this._writeHeader(byteSize, type, time);
            const {
              data
            } = event;
            const {
              currentBar,
              currentBarStarted,
              tempo,
              timeSigNumerator,
              timeSigDenominator,
              playing
            } = data;

            this._eventBytesView.setUint32(byteOffset, currentBar);

            byteOffset += 4;

            this._eventBytesView.setFloat64(byteOffset, currentBarStarted);

            byteOffset += 8;

            this._eventBytesView.setFloat64(byteOffset, tempo);

            byteOffset += 8;

            this._eventBytesView.setUint8(byteOffset, timeSigNumerator);

            byteOffset += 1;

            this._eventBytesView.setUint8(byteOffset, timeSigDenominator);

            byteOffset += 1;

            this._eventBytesView.setUint8(byteOffset, playing ? 1 : 0);

            byteOffset += 1;
          }
          break;

        case "wam-mpe":
        case "wam-midi":
          {
            const byteSize = this._eventSizeBytes[type];
            byteOffset = this._writeHeader(byteSize, type, time);
            const {
              data
            } = event;
            const {
              bytes
            } = data;
            let b = 0;

            while (b < 3) {
              this._eventBytesView.setUint8(byteOffset, bytes[b]);

              byteOffset += 1;
              b++;
            }
          }
          break;

        case "wam-osc":
        case "wam-sysex":
        case "wam-info":
          {
            let bytes = null;

            if (event.type === "wam-info") {
              const {
                data
              } = event;
              bytes = new TextEncoder().encode(data.instanceId);
            } else {
              const {
                data
              } = event;
              bytes = data.bytes;
            }

            const numBytes = bytes.length;
            const byteSize = this._eventSizeBytes[type];
            byteOffset = this._writeHeader(byteSize + numBytes, type, time);

            this._eventBytesView.setUint32(byteOffset, numBytes);

            byteOffset += 4;
            const bytesRequired = byteOffset + numBytes;
            if (bytesRequired > this._eventBytesAvailable) console.error(`Event requires ${bytesRequired} bytes but only ${this._eventBytesAvailable} have been allocated!`);
            const buffer = new Uint8Array(this._eventBytes, byteOffset, numBytes);
            buffer.set(bytes);
            byteOffset += numBytes;
          }
          break;
      }

      return new Uint8Array(this._eventBytes, 0, byteOffset);
    }

    _decode() {
      let byteOffset = 0;

      const type = this._decodeEventType[this._eventBytesView.getUint8(byteOffset)];

      byteOffset += 1;

      let time = this._eventBytesView.getFloat64(byteOffset);

      if (time === -1) time = void 0;
      byteOffset += 8;

      switch (type) {
        case "wam-automation":
          {
            const encodedParameterId = this._eventBytesView.getUint16(byteOffset);

            byteOffset += 2;

            const value = this._eventBytesView.getFloat64(byteOffset);

            byteOffset += 8;
            const normalized = !!this._eventBytesView.getUint8(byteOffset);
            byteOffset += 1;
            if (!(encodedParameterId in this._decodeParameterId)) break;
            const id = this._decodeParameterId[encodedParameterId];
            const event = {
              type,
              time,
              data: {
                id,
                value,
                normalized
              }
            };
            return event;
          }

        case "wam-transport":
          {
            const currentBar = this._eventBytesView.getUint32(byteOffset);

            byteOffset += 4;

            const currentBarStarted = this._eventBytesView.getFloat64(byteOffset);

            byteOffset += 8;

            const tempo = this._eventBytesView.getFloat64(byteOffset);

            byteOffset += 8;

            const timeSigNumerator = this._eventBytesView.getUint8(byteOffset);

            byteOffset += 1;

            const timeSigDenominator = this._eventBytesView.getUint8(byteOffset);

            byteOffset += 1;
            const playing = this._eventBytesView.getUint8(byteOffset) == 1;
            byteOffset += 1;
            const event = {
              type,
              time,
              data: {
                currentBar,
                currentBarStarted,
                tempo,
                timeSigNumerator,
                timeSigDenominator,
                playing
              }
            };
            return event;
          }

        case "wam-mpe":
        case "wam-midi":
          {
            const bytes = [0, 0, 0];
            let b = 0;

            while (b < 3) {
              bytes[b] = this._eventBytesView.getUint8(byteOffset);
              byteOffset += 1;
              b++;
            }

            const event = {
              type,
              time,
              data: {
                bytes
              }
            };
            return event;
          }

        case "wam-osc":
        case "wam-sysex":
        case "wam-info":
          {
            const numBytes = this._eventBytesView.getUint32(byteOffset);

            byteOffset += 4;
            const bytes = new Uint8Array(numBytes);
            bytes.set(new Uint8Array(this._eventBytes, byteOffset, numBytes));
            byteOffset += numBytes;

            if (type === "wam-info") {
              const instanceId = new TextDecoder().decode(bytes);
              const data = {
                instanceId
              };
              return {
                type,
                time,
                data
              };
            } else {
              const data = {
                bytes
              };
              return {
                type,
                time,
                data
              };
            }
          }
      }

      return false;
    }

    write(...events) {
      const numEvents = events.length;
      let bytesAvailable = this._rb.availableWrite;
      let numSkipped = 0;
      let i = 0;

      while (i < numEvents) {
        const event = events[i];

        const bytes = this._encode(event);

        const eventSizeBytes = bytes.byteLength;
        let bytesWritten = 0;

        if (bytesAvailable >= eventSizeBytes) {
          if (eventSizeBytes === 0) numSkipped++;else bytesWritten = this._rb.push(bytes);
        } else break;

        bytesAvailable -= bytesWritten;
        i++;
      }

      return i - numSkipped;
    }

    read() {
      if (this._rb.empty) return [];
      const events = [];
      let bytesAvailable = this._rb.availableRead;
      let bytesRead = 0;

      while (bytesAvailable > 0) {
        bytesRead = this._rb.pop(this._eventSizeArray);
        bytesAvailable -= bytesRead;

        const eventSizeBytes = this._eventSizeView.getUint32(0);

        const eventBytes = new Uint8Array(this._eventBytes, 0, eventSizeBytes - 4);
        bytesRead = this._rb.pop(eventBytes);
        bytesAvailable -= bytesRead;

        const decodedEvent = this._decode();

        if (decodedEvent) events.push(decodedEvent);
      }

      return events;
    }

    setParameterIds(parameterIds) {
      this._encodeParameterId = {};
      this._decodeParameterId = {};
      parameterIds.forEach(parameterId => {
        let parameterCode = -1;
        if (parameterId in this._parameterCodes) parameterCode = this._parameterCodes[parameterId];else {
          parameterCode = this._generateParameterCode();
          this._parameterCodes[parameterId] = parameterCode;
        }
        this._encodeParameterId[parameterId] = parameterCode;
        this._decodeParameterId[parameterCode] = parameterId;
      });
    }

    _generateParameterCode() {
      if (this._parameterCode > 65535) throw Error("Too many parameters have been registered!");
      return this._parameterCode++;
    }

  }

  if (audioWorkletGlobalScope.AudioWorkletProcessor) {
    const ModuleScope = audioWorkletGlobalScope.webAudioModules.getModuleScope(moduleId);
    if (!ModuleScope.WamEventRingBuffer) ModuleScope.WamEventRingBuffer = WamEventRingBuffer2;
  }

  return WamEventRingBuffer2;
};

var WamEventRingBuffer_default = getWamEventRingBuffer; // src/addFunctionModule.js

RingBuffer_default();
WamEventRingBuffer_default();

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;

var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
  enumerable: true,
  configurable: true,
  writable: true,
  value
}) : obj[key] = value;

var __spreadValues = (a, b) => {
  for (var prop in b || (b = {})) if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop]);

  if (__getOwnPropSymbols) for (var prop of __getOwnPropSymbols(b)) {
    if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
  }
  return a;
};

var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  return value;
}; // src/CompositeAudioNode.js


var CompositeAudioNode = class extends GainNode {
  constructor() {
    super(...arguments);

    __publicField(this, "_output");

    __publicField(this, "_wamNode");
  }

  get groupId() {
    return this._wamNode.groupId;
  }

  get moduleId() {
    return this._wamNode.moduleId;
  }

  get instanceId() {
    return this._wamNode.instanceId;
  }

  get module() {
    return this._wamNode.module;
  }

  addEventListener(...args) {
    return this._wamNode.addEventListener(...args);
  }

  removeEventListener(...args) {
    return this._wamNode.removeEventListener(...args);
  }

  dispatchEvent(...args) {
    return this._wamNode.dispatchEvent(...args);
  }

  getParameterInfo(...args) {
    return this._wamNode.getParameterInfo(...args);
  }

  getParameterValues(...args) {
    return this._wamNode.getParameterValues(...args);
  }

  setParameterValues(...args) {
    return this._wamNode.setParameterValues(...args);
  }

  getState() {
    return this._wamNode.getState();
  }

  setState(...args) {
    return this._wamNode.setState(...args);
  }

  getCompensationDelay() {
    return this._wamNode.getCompensationDelay();
  }

  scheduleEvents(...args) {
    return this._wamNode.scheduleEvents(...args);
  }

  clearEvents() {
    return this._wamNode.clearEvents();
  }

  connectEvents(...args) {
    return this._wamNode.connectEvents(...args);
  }

  disconnectEvents(...args) {
    return this._wamNode.disconnectEvents(...args);
  }

  destroy() {
    return this._wamNode.destroy();
  }

  set channelCount(count) {
    if (this._output) this._output.channelCount = count;else super.channelCount = count;
  }

  get channelCount() {
    if (this._output) return this._output.channelCount;
    return super.channelCount;
  }

  set channelCountMode(mode) {
    if (this._output) this._output.channelCountMode = mode;else super.channelCountMode = mode;
  }

  get channelCountMode() {
    if (this._output) return this._output.channelCountMode;
    return super.channelCountMode;
  }

  set channelInterpretation(interpretation) {
    if (this._output) this._output.channelInterpretation = interpretation;else super.channelInterpretation = interpretation;
  }

  get channelInterpretation() {
    if (this._output) return this._output.channelInterpretation;
    return super.channelInterpretation;
  }

  get numberOfInputs() {
    return super.numberOfInputs;
  }

  get numberOfOutputs() {
    if (this._output) return this._output.numberOfOutputs;
    return super.numberOfOutputs;
  }

  get gain() {
    return void 0;
  }

  connect(...args) {
    if (this._output && this._output !== this) return this._output.connect(...args);
    return super.connect(...args);
  }

  disconnect(...args) {
    if (this._output && this._output !== this) return this._output.disconnect(...args);
    return super.disconnect(...args);
  }

}; // src/sdk/src/addFunctionModule.js

var addFunctionModule = (audioWorklet, processorFunction, ...injection) => {
  const text = `(${processorFunction.toString()})(${injection.map(s => JSON.stringify(s)).join(", ")});`;
  const url = URL.createObjectURL(new Blob([text], {
    type: "text/javascript"
  }));
  return audioWorklet.addModule(url);
};

var addFunctionModule_default = addFunctionModule; // src/ParamMgrProcessor.js

var processor = (moduleId, paramsConfig) => {
  const audioWorkletGlobalScope = globalThis;
  const {
    AudioWorkletProcessor,
    registerProcessor,
    webAudioModules
  } = audioWorkletGlobalScope;
  const supportSharedArrayBuffer = !!globalThis.SharedArrayBuffer;
  const SharedArrayBuffer = globalThis.SharedArrayBuffer || globalThis.ArrayBuffer;

  const normExp = (x, e) => e === 0 ? x : x ** 1.5 ** -e;

  const normalizeE = (x, min, max, e = 0) => min === 0 && max === 1 ? normExp(x, e) : normExp((x - min) / (max - min) || 0, e);

  const normalize = (x, min, max) => min === 0 && max === 1 ? x : (x - min) / (max - min) || 0;

  const denormalize = (x, min, max) => min === 0 && max === 1 ? x : x * (max - min) + min;

  const mapValue = (x, eMin, eMax, sMin, sMax, tMin, tMax) => denormalize(normalize(normalize(Math.min(sMax, Math.max(sMin, x)), eMin, eMax), normalize(sMin, eMin, eMax), normalize(sMax, eMin, eMax)), tMin, tMax);

  class ParamMgrProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
      return Object.entries(paramsConfig).map(([name, {
        defaultValue,
        minValue,
        maxValue
      }]) => ({
        name,
        defaultValue,
        minValue,
        maxValue
      }));
    }

    constructor(options) {
      super();
      this.destroyed = false;
      this.supportSharedArrayBuffer = supportSharedArrayBuffer;
      const {
        paramsMapping,
        internalParamsMinValues,
        internalParams,
        groupId,
        instanceId
      } = options.processorOptions;
      this.groupId = groupId;
      this.moduleId = moduleId;
      this.instanceId = instanceId;
      this.internalParamsMinValues = internalParamsMinValues;
      this.paramsConfig = paramsConfig;
      this.paramsMapping = paramsMapping;
      this.paramsValues = {};
      Object.entries(paramsConfig).forEach(([name, {
        defaultValue
      }]) => {
        this.paramsValues[name] = defaultValue;
      });
      this.internalParams = internalParams;
      this.internalParamsCount = this.internalParams.length;
      this.buffer = new SharedArrayBuffer((this.internalParamsCount + 1) * Float32Array.BYTES_PER_ELEMENT);
      this.$lock = new Int32Array(this.buffer, 0, 1);
      this.$internalParamsBuffer = new Float32Array(this.buffer, 4, this.internalParamsCount);
      this.eventQueue = [];
      this.handleEvent = null;
      audioWorkletGlobalScope.webAudioModules.addWam(this);
      this.messagePortRequestId = -1;
      const resolves = {};
      const rejects = {};

      this.call = (call, ...args) => new Promise((resolve, reject) => {
        const id = this.messagePortRequestId--;
        resolves[id] = resolve;
        rejects[id] = reject;
        this.port.postMessage({
          id,
          call,
          args
        });
      });

      this.handleMessage = ({
        data
      }) => {
        var _a, _b;

        const {
          id,
          call,
          args,
          value,
          error
        } = data;

        if (call) {
          const r = {
            id
          };

          try {
            r.value = this[call](...args);
          } catch (e) {
            r.error = e;
          }

          this.port.postMessage(r);
        } else {
          if (error) (_a = rejects[id]) == null ? void 0 : _a.call(rejects, error);else if (resolves[id]) (_b = resolves[id]) == null ? void 0 : _b.call(resolves, value);
          delete resolves[id];
          delete rejects[id];
        }
      };

      this.port.start();
      this.port.addEventListener("message", this.handleMessage);
    }

    setParamsMapping(mapping) {
      this.paramsMapping = mapping;
    }

    getBuffer() {
      return {
        lock: this.$lock,
        paramsBuffer: this.$internalParamsBuffer
      };
    }

    getCompensationDelay() {
      return 128;
    }

    getParameterInfo(...parameterIdQuery) {
      if (parameterIdQuery.length === 0) parameterIdQuery = Object.keys(this.paramsConfig);
      const parameterInfo = {};
      parameterIdQuery.forEach(parameterId => {
        parameterInfo[parameterId] = this.paramsConfig[parameterId];
      });
      return parameterInfo;
    }

    getParameterValues(normalized, ...parameterIdQuery) {
      if (parameterIdQuery.length === 0) parameterIdQuery = Object.keys(this.paramsConfig);
      const parameterValues = {};
      parameterIdQuery.forEach(parameterId => {
        if (!(parameterId in this.paramsValues)) return;
        const {
          minValue,
          maxValue,
          exponent
        } = this.paramsConfig[parameterId];
        const value = this.paramsValues[parameterId];
        parameterValues[parameterId] = {
          id: parameterId,
          value: normalized ? normalizeE(value, minValue, maxValue, exponent) : value,
          normalized
        };
      });
      return parameterValues;
    }

    scheduleEvents(...events) {
      this.eventQueue.push(...events);
      const {
        currentTime
      } = audioWorkletGlobalScope;
      this.eventQueue.sort((a, b) => (a.time || currentTime) - (b.time || currentTime));
    }

    emitEvents(...events) {
      webAudioModules.emitEvents(this, ...events);
    }

    clearEvents() {
      this.eventQueue = [];
    }

    lock() {
      if (globalThis.Atomics) Atomics.store(this.$lock, 0, 1);
    }

    unlock() {
      if (globalThis.Atomics) Atomics.store(this.$lock, 0, 0);
    }

    process(inputs, outputs, parameters) {
      if (this.destroyed) return false;
      const outputOffset = 1;
      this.lock();
      Object.entries(this.paramsConfig).forEach(([name, {
        minValue,
        maxValue
      }]) => {
        const raw = parameters[name];
        if (name in this.paramsValues) this.paramsValues[name] = raw[raw.length - 1];
        if (!this.paramsMapping[name]) return;
        Object.entries(this.paramsMapping[name]).forEach(([targetName, targetMapping]) => {
          const j = this.internalParams.indexOf(targetName);
          if (j === -1) return;
          const intrinsicValue = this.internalParamsMinValues[j];
          const {
            sourceRange,
            targetRange
          } = targetMapping;
          const [sMin, sMax] = sourceRange;
          const [tMin, tMax] = targetRange;
          let out;

          if (minValue !== tMin || maxValue !== tMax || minValue !== sMin || maxValue !== sMax) {
            out = raw.map(v => {
              const mappedValue = mapValue(v, minValue, maxValue, sMin, sMax, tMin, tMax);
              return mappedValue - intrinsicValue;
            });
          } else if (intrinsicValue) {
            out = raw.map(v => v - intrinsicValue);
          } else {
            out = raw;
          }

          if (out.length === 1) outputs[j + outputOffset][0].fill(out[0]);else outputs[j + outputOffset][0].set(out);
          this.$internalParamsBuffer[j] = out[0];
        });
      });
      this.unlock();

      if (!this.supportSharedArrayBuffer) {
        this.call("setBuffer", {
          lock: this.$lock,
          paramsBuffer: this.$internalParamsBuffer
        });
      }

      const {
        currentTime
      } = audioWorkletGlobalScope;
      let $event;

      for ($event = 0; $event < this.eventQueue.length; $event++) {
        const event = this.eventQueue[$event];
        if (event.time && event.time > currentTime) break;
        if (typeof this.handleEvent === "function") this.handleEvent(event);
        this.call("dispatchWamEvent", event);
      }

      if ($event) this.eventQueue.splice(0, $event);
      return true;
    }

    connectEvents(wamInstanceId, output) {
      webAudioModules.connectEvents(this.groupId, this.instanceId, wamInstanceId, output);
    }

    disconnectEvents(wamInstanceId, output) {
      if (typeof wamInstanceId === "undefined") {
        webAudioModules.disconnectEvents(this.groupId, this.instanceId);
        return;
      }

      webAudioModules.disconnectEvents(this.groupId, this.instanceId, wamInstanceId, output);
    }

    destroy() {
      audioWorkletGlobalScope.webAudioModules.removeWam(this);
      this.destroyed = true;
      this.port.close();
    }

  }

  try {
    registerProcessor(moduleId, ParamMgrProcessor);
  } catch (error) {
    console.warn(error);
  }
};

var ParamMgrProcessor_default = processor; // src/sdk/src/WamParameterInfo.js

var getWamParameterInfo = moduleId => {
  const audioWorkletGlobalScope = globalThis;

  const normExp = (x, e) => e === 0 ? x : x ** 1.5 ** -e;

  const denormExp = (x, e) => e === 0 ? x : x ** 1.5 ** e;

  const normalize = (x, min, max, e = 0) => min === 0 && max === 1 ? normExp(x, e) : normExp((x - min) / (max - min) || 0, e);

  const denormalize = (x, min, max, e = 0) => min === 0 && max === 1 ? denormExp(x, e) : denormExp(x, e) * (max - min) + min;

  const inRange = (x, min, max) => x >= min && x <= max;

  class WamParameterInfo2 {
    constructor(id, config = {}) {
      let {
        type,
        label,
        defaultValue,
        minValue,
        maxValue,
        discreteStep,
        exponent,
        choices,
        units
      } = config;
      if (type === void 0) type = "float";
      if (label === void 0) label = "";
      if (defaultValue === void 0) defaultValue = 0;
      if (choices === void 0) choices = [];

      if (type === "boolean" || type === "choice") {
        discreteStep = 1;
        minValue = 0;
        if (choices.length) maxValue = choices.length - 1;else maxValue = 1;
      } else {
        if (minValue === void 0) minValue = 0;
        if (maxValue === void 0) maxValue = 1;
        if (discreteStep === void 0) discreteStep = 0;
        if (exponent === void 0) exponent = 0;
        if (units === void 0) units = "";
      }

      const errBase = `Param config error | ${id}: `;
      if (minValue >= maxValue) throw Error(errBase.concat("minValue must be less than maxValue"));
      if (!inRange(defaultValue, minValue, maxValue)) throw Error(errBase.concat("defaultValue out of range"));

      if (discreteStep % 1 || discreteStep < 0) {
        throw Error(errBase.concat("discreteStep must be a non-negative integer"));
      } else if (discreteStep > 0 && (minValue % 1 || maxValue % 1 || defaultValue % 1)) {
        throw Error(errBase.concat("non-zero discreteStep requires integer minValue, maxValue, and defaultValue"));
      }

      if (type === "choice" && !choices.length) {
        throw Error(errBase.concat("choice type parameter requires list of strings in choices"));
      }

      this.id = id;
      this.label = label;
      this.type = type;
      this.defaultValue = defaultValue;
      this.minValue = minValue;
      this.maxValue = maxValue;
      this.discreteStep = discreteStep;
      this.exponent = exponent;
      this.choices = choices;
      this.units = units;
    }

    normalize(value) {
      return normalize(value, this.minValue, this.maxValue, this.exponent);
    }

    denormalize(valueNorm) {
      return denormalize(valueNorm, this.minValue, this.maxValue, this.exponent);
    }

    valueString(value) {
      if (this.choices) return this.choices[value];
      if (this.units !== "") return `${value} ${this.units}`;
      return `${value}`;
    }

  }

  if (audioWorkletGlobalScope.AudioWorkletProcessor) {
    const ModuleScope = audioWorkletGlobalScope.webAudioModules.getModuleScope(moduleId);
    if (!ModuleScope.WamParameterInfo) ModuleScope.WamParameterInfo = WamParameterInfo2;
  }

  return WamParameterInfo2;
};

var WamParameterInfo_default = getWamParameterInfo; // src/ParamConfigurator.js

var WamParameterInfo = WamParameterInfo_default();
var ParamMappingConfigurator = class {
  constructor(options = {}) {
    __publicField(this, "_paramsConfig");

    __publicField(this, "_internalParamsConfig");

    __publicField(this, "_paramsMapping", {});

    const {
      paramsConfig,
      paramsMapping,
      internalParamsConfig
    } = options;
    this._paramsConfig = paramsConfig;
    this._paramsMapping = paramsMapping;
    this._internalParamsConfig = internalParamsConfig;
  }

  get paramsConfig() {
    const {
      internalParamsConfig
    } = this;
    return Object.entries(this._paramsConfig || internalParamsConfig).reduce((configs, [id, config]) => {
      var _a, _b, _c, _d;

      const internalParam = internalParamsConfig[id];
      configs[id] = new WamParameterInfo(id, __spreadProps(__spreadValues({}, config), {
        label: (_a = config.label) != null ? _a : id,
        defaultValue: (_b = config.defaultValue) != null ? _b : internalParam == null ? void 0 : internalParam.defaultValue,
        minValue: (_c = config.minValue) != null ? _c : internalParam == null ? void 0 : internalParam.minValue,
        maxValue: (_d = config.maxValue) != null ? _d : internalParam == null ? void 0 : internalParam.maxValue
      }));
      return configs;
    }, {});
  }

  get internalParamsConfig() {
    return Object.entries(this._internalParamsConfig || {}).reduce((configs, [name, config]) => {
      if (config instanceof AudioParam) configs[name] = config;else {
        const defaultConfig = {
          minValue: 0,
          maxValue: 1,
          defaultValue: 0,
          automationRate: 30
        };
        configs[name] = __spreadValues(__spreadValues({}, defaultConfig), config);
      }
      return configs;
    }, {});
  }

  get paramsMapping() {
    const declared = this._paramsMapping || {};
    const externalParams = this.paramsConfig;
    const internalParams = this.internalParamsConfig;
    return Object.entries(externalParams).reduce((mapping, [name, {
      minValue,
      maxValue
    }]) => {
      const sourceRange = [minValue, maxValue];
      const defaultMapping = {
        sourceRange,
        targetRange: [...sourceRange]
      };

      if (declared[name]) {
        const declaredTargets = Object.entries(declared[name]).reduce((targets, [targetName, targetMapping]) => {
          if (internalParams[targetName]) {
            targets[targetName] = __spreadValues(__spreadValues({}, defaultMapping), targetMapping);
          }

          return targets;
        }, {});
        mapping[name] = declaredTargets;
      } else if (internalParams[name]) {
        mapping[name] = {
          [name]: __spreadValues({}, defaultMapping)
        };
      }

      return mapping;
    }, {});
  }

}; // src/MgrAudioParam.js

var MgrAudioParam = class extends AudioParam {
  constructor() {
    super(...arguments);

    __publicField(this, "_info");
  }

  get exponent() {
    return this.info.exponent;
  }

  get info() {
    return this._info;
  }

  set info(info) {
    this._info = info;
  }

  set normalizedValue(valueIn) {
    this.value = this.info.denormalize(valueIn);
  }

  get normalizedValue() {
    return this.info.normalize(this.value);
  }

  setValueAtTime(value, startTime) {
    return super.setValueAtTime(value, startTime);
  }

  setNormalizedValueAtTime(valueIn, startTime) {
    const value = this.info.denormalize(valueIn);
    return this.setValueAtTime(value, startTime);
  }

  linearRampToValueAtTime(value, endTime) {
    return super.linearRampToValueAtTime(value, endTime);
  }

  linearRampToNormalizedValueAtTime(valueIn, endTime) {
    const value = this.info.denormalize(valueIn);
    return this.linearRampToValueAtTime(value, endTime);
  }

  exponentialRampToValueAtTime(value, endTime) {
    return super.exponentialRampToValueAtTime(value, endTime);
  }

  exponentialRampToNormalizedValueAtTime(valueIn, endTime) {
    const value = this.info.denormalize(valueIn);
    return this.exponentialRampToValueAtTime(value, endTime);
  }

  setTargetAtTime(target, startTime, timeConstant) {
    return super.setTargetAtTime(target, startTime, timeConstant);
  }

  setNormalizedTargetAtTime(targetIn, startTime, timeConstant) {
    const target = this.info.denormalize(targetIn);
    return this.setTargetAtTime(target, startTime, timeConstant);
  }

  setValueCurveAtTime(values, startTime, duration) {
    return super.setValueCurveAtTime(values, startTime, duration);
  }

  setNormalizedValueCurveAtTime(valuesIn, startTime, duration) {
    const values = Array.from(valuesIn).map(v => this.info.denormalize(v));
    return this.setValueCurveAtTime(values, startTime, duration);
  }

  cancelScheduledParamValues(cancelTime) {
    return super.cancelScheduledValues(cancelTime);
  }

  cancelAndHoldParamAtTime(cancelTime) {
    return super.cancelAndHoldAtTime(cancelTime);
  }

}; // src/ParamMgrNode.js

var AudioWorkletNode = globalThis.AudioWorkletNode;
var ParamMgrNode = class extends AudioWorkletNode {
  constructor(module, options) {
    super(module.audioContext, module.moduleId, {
      numberOfInputs: 0,
      numberOfOutputs: 1 + options.processorOptions.internalParams.length,
      parameterData: options.parameterData,
      processorOptions: options.processorOptions
    });

    __publicField(this, "requestDispatchIParamChange", name => {
      const config = this.internalParamsConfig[name];
      if (!("onChange" in config)) return;
      const {
        automationRate,
        onChange
      } = config;
      if (typeof automationRate !== "number" || !automationRate) return;
      const interval = 1e3 / automationRate;
      const i = this.internalParams.indexOf(name);
      if (i === -1) return;
      if (i >= this.internalParams.length) return;

      if (typeof this.paramsUpdateCheckFnRef[i] === "number") {
        window.clearTimeout(this.paramsUpdateCheckFnRef[i]);
      }

      this.paramsUpdateCheckFn[i] = () => {
        const prev = this.$prevParamsBuffer[i];
        const cur = this.$paramsBuffer[i];

        if (cur !== prev) {
          onChange(cur, prev);
          this.$prevParamsBuffer[i] = cur;
        }

        this.paramsUpdateCheckFnRef[i] = window.setTimeout(this.paramsUpdateCheckFn[i], interval);
      };

      this.paramsUpdateCheckFn[i]();
    });

    const {
      processorOptions,
      internalParamsConfig
    } = options;
    this.initialized = false;
    this.module = module;
    this.paramsConfig = processorOptions.paramsConfig;
    this.internalParams = processorOptions.internalParams;
    this.internalParamsConfig = internalParamsConfig;
    this.$prevParamsBuffer = new Float32Array(this.internalParams.length);
    this.paramsUpdateCheckFn = [];
    this.paramsUpdateCheckFnRef = [];
    this.messageRequestId = 0;
    Object.entries(this.getParams()).forEach(([name, param]) => {
      Object.setPrototypeOf(param, MgrAudioParam.prototype);
      param._info = this.paramsConfig[name];
    });
    const resolves = {};
    const rejects = {};

    this.call = (call, ...args) => {
      const id = this.messageRequestId;
      this.messageRequestId += 1;
      return new Promise((resolve, reject) => {
        resolves[id] = resolve;
        rejects[id] = reject;
        this.port.postMessage({
          id,
          call,
          args
        });
      });
    };

    this.handleMessage = ({
      data
    }) => {
      var _a, _b;

      const {
        id,
        call,
        args,
        value,
        error
      } = data;

      if (call) {
        const r = {
          id
        };

        try {
          r.value = this[call](...args);
        } catch (e) {
          r.error = e;
        }

        this.port.postMessage(r);
      } else {
        if (error) (_a = rejects[id]) == null ? void 0 : _a.call(rejects, error);else if (resolves[id]) (_b = resolves[id]) == null ? void 0 : _b.call(resolves, value);
        delete resolves[id];
        delete rejects[id];
      }
    };

    this.port.start();
    this.port.addEventListener("message", this.handleMessage);
  }

  get parameters() {
    return super.parameters;
  }

  get groupId() {
    return this.module.groupId;
  }

  get moduleId() {
    return this.module.moduleId;
  }

  get instanceId() {
    return this.module.instanceId;
  }

  async initialize() {
    const response = await this.call("getBuffer");
    const {
      lock,
      paramsBuffer
    } = response;
    this.$lock = lock;
    this.$paramsBuffer = paramsBuffer;
    const offset = 1;
    Object.entries(this.internalParamsConfig).forEach(([name, config], i) => {
      if (this.context.state === "suspended") this.$paramsBuffer[i] = config.defaultValue;

      if (config instanceof AudioParam) {
        try {
          config.automationRate = "a-rate";
        } catch (e) {} finally {
          config.value = Math.max(0, config.minValue);
          this.connect(config, offset + i);
        }
      } else if (config instanceof AudioNode) {
        this.connect(config, offset + i);
      } else {
        this.requestDispatchIParamChange(name);
      }
    });
    this.connect(this.module.audioContext.destination, 0, 0);
    this.initialized = true;
    return this;
  }

  setBuffer({
    lock,
    paramsBuffer
  }) {
    this.$lock = lock;
    this.$paramsBuffer = paramsBuffer;
  }

  setParamsMapping(paramsMapping) {
    return this.call("setParamsMapping", paramsMapping);
  }

  getCompensationDelay() {
    return this.call("getCompensationDelay");
  }

  getParameterInfo(...parameterIdQuery) {
    return this.call("getParameterInfo", ...parameterIdQuery);
  }

  getParameterValues(normalized, ...parameterIdQuery) {
    return this.call("getParameterValues", normalized, ...parameterIdQuery);
  }

  scheduleAutomation(event) {
    const time = event.time || this.context.currentTime;
    const {
      id,
      normalized,
      value
    } = event.data;
    const audioParam = this.getParam(id);
    if (!audioParam) return;

    if (audioParam.info.type === "float") {
      if (normalized) audioParam.linearRampToNormalizedValueAtTime(value, time);else audioParam.linearRampToValueAtTime(value, time);
    } else {
      if (normalized) audioParam.setNormalizedValueAtTime(value, time);else audioParam.setValueAtTime(value, time);
    }
  }

  scheduleEvents(...events) {
    events.forEach(event => {
      if (event.type === "wam-automation") {
        this.scheduleAutomation(event);
      }
    });
    this.call("scheduleEvents", ...events);
  }

  emitEvents(...events) {
    this.call("emitEvents", ...events);
  }

  clearEvents() {
    this.call("clearEvents");
  }

  dispatchWamEvent(event) {
    if (event.type === "wam-automation") {
      this.scheduleAutomation(event);
    } else {
      this.dispatchEvent(new CustomEvent(event.type, {
        detail: event
      }));
    }
  }

  async setParameterValues(parameterValues) {
    Object.keys(parameterValues).forEach(parameterId => {
      const parameterUpdate = parameterValues[parameterId];
      const parameter = this.parameters.get(parameterId);
      if (!parameter) return;
      if (!parameterUpdate.normalized) parameter.value = parameterUpdate.value;else parameter.normalizedValue = parameterUpdate.value;
    });
  }

  async getState() {
    return this.getParamsValues();
  }

  async setState(state) {
    this.setParamsValues(state);
  }

  convertTimeToFrame(time) {
    return Math.round(time * this.context.sampleRate);
  }

  convertFrameToTime(frame) {
    return frame / this.context.sampleRate;
  }

  getIParamIndex(name) {
    const i = this.internalParams.indexOf(name);
    return i === -1 ? null : i;
  }

  connectIParam(name, dest, index) {
    const offset = 1;
    const i = this.getIParamIndex(name);

    if (i !== null) {
      if (dest instanceof AudioNode) {
        if (typeof index === "number") this.connect(dest, offset + i, index);else this.connect(dest, offset + i);
      } else {
        this.connect(dest, offset + i);
      }
    }
  }

  disconnectIParam(name, dest, index) {
    const offset = 1;
    const i = this.getIParamIndex(name);

    if (i !== null) {
      if (dest instanceof AudioNode) {
        if (typeof index === "number") this.disconnect(dest, offset + i, index);else this.disconnect(dest, offset + i);
      } else {
        this.disconnect(dest, offset + i);
      }
    }
  }

  getIParamValue(name) {
    const i = this.getIParamIndex(name);
    return i !== null ? this.$paramsBuffer[i] : null;
  }

  getIParamsValues() {
    const values = {};
    this.internalParams.forEach((name, i) => {
      values[name] = this.$paramsBuffer[i];
    });
    return values;
  }

  getParam(name) {
    return this.parameters.get(name) || null;
  }

  getParams() {
    return Object.fromEntries(this.parameters);
  }

  getParamValue(name) {
    const param = this.parameters.get(name);
    if (!param) return null;
    return param.value;
  }

  setParamValue(name, value) {
    const param = this.parameters.get(name);
    if (!param) return;
    param.value = value;
  }

  getParamsValues() {
    const values = {};
    this.parameters.forEach((v, k) => {
      values[k] = v.value;
    });
    return values;
  }

  setParamsValues(values) {
    if (!values) return;
    Object.entries(values).forEach(([k, v]) => {
      this.setParamValue(k, v);
    });
  }

  getNormalizedParamValue(name) {
    const param = this.parameters.get(name);
    if (!param) return null;
    return param.normalizedValue;
  }

  setNormalizedParamValue(name, value) {
    const param = this.parameters.get(name);
    if (!param) return;
    param.normalizedValue = value;
  }

  getNormalizedParamsValues() {
    const values = {};
    this.parameters.forEach((v, k) => {
      values[k] = this.getNormalizedParamValue(k);
    });
    return values;
  }

  setNormalizedParamsValues(values) {
    if (!values) return;
    Object.entries(values).forEach(([k, v]) => {
      this.setNormalizedParamValue(k, v);
    });
  }

  setParamValueAtTime(name, value, startTime) {
    const param = this.parameters.get(name);
    if (!param) return null;
    return param.setValueAtTime(value, startTime);
  }

  setNormalizedParamValueAtTime(name, value, startTime) {
    const param = this.parameters.get(name);
    if (!param) return null;
    return param.setNormalizedValueAtTime(value, startTime);
  }

  linearRampToParamValueAtTime(name, value, endTime) {
    const param = this.parameters.get(name);
    if (!param) return null;
    return param.linearRampToValueAtTime(value, endTime);
  }

  linearRampToNormalizedParamValueAtTime(name, value, endTime) {
    const param = this.parameters.get(name);
    if (!param) return null;
    return param.linearRampToNormalizedValueAtTime(value, endTime);
  }

  exponentialRampToParamValueAtTime(name, value, endTime) {
    const param = this.parameters.get(name);
    if (!param) return null;
    return param.exponentialRampToValueAtTime(value, endTime);
  }

  exponentialRampToNormalizedParamValueAtTime(name, value, endTime) {
    const param = this.parameters.get(name);
    if (!param) return null;
    return param.exponentialRampToNormalizedValueAtTime(value, endTime);
  }

  setParamTargetAtTime(name, target, startTime, timeConstant) {
    const param = this.parameters.get(name);
    if (!param) return null;
    return param.setTargetAtTime(target, startTime, timeConstant);
  }

  setNormalizedParamTargetAtTime(name, target, startTime, timeConstant) {
    const param = this.parameters.get(name);
    if (!param) return null;
    return param.setNormalizedTargetAtTime(target, startTime, timeConstant);
  }

  setParamValueCurveAtTime(name, values, startTime, duration) {
    const param = this.parameters.get(name);
    if (!param) return null;
    return param.setValueCurveAtTime(values, startTime, duration);
  }

  setNormalizedParamValueCurveAtTime(name, values, startTime, duration) {
    const param = this.parameters.get(name);
    if (!param) return null;
    return param.setNormalizedValueCurveAtTime(values, startTime, duration);
  }

  cancelScheduledParamValues(name, cancelTime) {
    const param = this.parameters.get(name);
    if (!param) return null;
    return param.cancelScheduledValues(cancelTime);
  }

  cancelAndHoldParamAtTime(name, cancelTime) {
    const param = this.parameters.get(name);
    if (!param) return null;
    return param.cancelAndHoldAtTime(cancelTime);
  }

  connectEvents(toId, output) {
    this.call("connectEvents", toId, output);
  }

  disconnectEvents(toId, output) {
    this.call("disconnectEvents", toId, output);
  }

  async destroy() {
    this.disconnect();
    this.paramsUpdateCheckFnRef.forEach(ref => {
      if (typeof ref === "number") window.clearTimeout(ref);
    });
    await this.call("destroy");
    this.port.close();
  }

}; // src/ParamMgrFactory.js

var ParamMgrFactory = class {
  static async create(module, optionsIn = {}) {
    const {
      audioContext,
      groupId,
      moduleId,
      instanceId
    } = module;
    const {
      paramsConfig,
      paramsMapping,
      internalParamsConfig
    } = new ParamMappingConfigurator(optionsIn);
    const initialParamsValue = Object.entries(paramsConfig).reduce((currentParams, [name, {
      defaultValue
    }]) => {
      currentParams[name] = defaultValue;
      return currentParams;
    }, {});
    const serializableParamsConfig = Object.entries(paramsConfig).reduce((currentParams, [name, {
      id,
      label,
      type,
      defaultValue,
      minValue,
      maxValue,
      discreteStep,
      exponent,
      choices,
      units
    }]) => {
      currentParams[name] = {
        id,
        label,
        type,
        defaultValue,
        minValue,
        maxValue,
        discreteStep,
        exponent,
        choices,
        units
      };
      return currentParams;
    }, {});
    await addFunctionModule_default(audioContext.audioWorklet, ParamMgrProcessor_default, moduleId, serializableParamsConfig);
    const options = {
      internalParamsConfig,
      parameterData: initialParamsValue,
      processorOptions: {
        paramsConfig,
        paramsMapping,
        internalParamsMinValues: Object.values(internalParamsConfig).map(config => Math.max(0, (config == null ? void 0 : config.minValue) || 0)),
        internalParams: Object.keys(internalParamsConfig),
        groupId,
        instanceId,
        moduleId
      }
    };
    const node = new ParamMgrNode(module, options);
    await node.initialize();
    return node;
  }

};

/**
 * @typedef {"feedback" | "time" | "mix" | "enabled"} Params
 * @typedef {"feedback" | "delayLeftTime" | "delayRightTime"
 * | "dryGain" | "wetGain" | "enabled"} InternalParams
 */
// name is not so important here, the file Node.js is imported
// Normally the class does no need to be exported as
// an async mehod createNode is expored at the end of this
// file.

class PingPongDelayNode extends CompositeAudioNode {
  /**
   * @type {ParamMgrNode<Params, InternalParams>}
   */
  get paramMgr() {
    return this._wamNode;
  } // plugin is an instance of he class that exends WebAudioModule
  // this instance is he plugin as an Observable
  // options is an extra container that could be ussed to indicate
  // the number of inputs and outputs...


  constructor(audioContext, options) {
    super(audioContext, options);

    _defineProperty(this, "_wamNode", undefined);

    _defineProperty(this, "isEnabled", true);

    console.log('CONSTRUCTOR CompositeAudioNode');
    this.createNodes();
  }
  /*  #########  Personnal code for the web audio graph  #########   */


  createNodes() {
    this._input = this.context.createGain();
    super.connect(this._input);
    this._output = this.context.createGain();
    this.delayNodeLeft = this.context.createDelay();
    this.delayNodeRight = this.context.createDelay();
    this.dryGainNode = this.context.createGain();
    this.wetGainNode = this.context.createGain();
    this.feedbackGainNode = this.context.createGain();
    this.channelMerger = this.context.createChannelMerger(2);
  }

  connectNodes() {
    // dry mix
    this._input.connect(this.dryGainNode); // dry mix out


    this.dryGainNode.connect(this._output); // the feedback loop

    this.delayNodeLeft.connect(this.channelMerger, 0, 0);
    this.delayNodeRight.connect(this.channelMerger, 0, 1);
    this.feedbackGainNode.connect(this.delayNodeLeft);
    this.delayNodeRight.connect(this.feedbackGainNode);
    this.delayNodeLeft.connect(this.delayNodeRight); // wet mix

    this._input.connect(this.feedbackGainNode); // wet out


    this.channelMerger.connect(this.wetGainNode);
    this.wetGainNode.connect(this._output);
  }
  /**
   * @param {ParamMgrNode<Params, InternalParams>} wamNode
   */


  setup(wamNode) {
    this._wamNode = wamNode;
    this.connectNodes();
  }

  set status(_sig) {
    if (this.isEnabled === _sig) return;
    this.isEnabled = _sig;

    if (_sig) {
      this._input.disconnect(this._output);

      this._input.connect(this.feedbackGainNode);

      this._input.connect(this.dryGainNode);
    } else {
      this._input.disconnect(this.feedbackGainNode);

      this._input.disconnect(this.dryGainNode);

      this._input.connect(this._output);
    }
  }

}

var style = ".wrapper {\n\tbackground: linear-gradient(rgb(77, 74, 78), rgb(194, 68, 36));\n\tbox-shadow: 4px 5px 6px rgba(0, 0, 0, 0.7),\n\t\tinset -2px -2px 5px 0px rgba(0, 0, 0, 0.2),\n\t\tinset 3px 1px 1px 4px rgba(255, 255, 255, 0.2),\n\t\t1px 0px 1px 0px rgba(0, 0, 0, 0.9), 0 2px 1px 0 rgba(0, 0, 0, 0.9),\n\t\t1px 1px 1px 0px rgba(0, 0, 0, 0.9);\n\n\tdisplay: block;\n\tuser-select: none;\n\tcursor: move;\n\tz-index: 9;\n\n\twidth: 200px;\n\theight: 300px;\n\n\tborder-bottom-left-radius: 8px;\n\tborder-bottom-right-radius: 8px;\n}\n\n.pedalLabel,\n.div_buttons {\n\tborder-radius: 8px;\n}\n\n.div_menuPanel {\n\t/* border-top-left-radius: 8px;\n\t\t  border-top-right-radius: 8px; */\n}\n\nwebaudio-switch {\n\tleft: -6px;\n}\n\n.pedalLabel {\n\t/* background: rgba(0, 0, 0, 0.4); */\n\tbox-shadow: inset 0px 1px 5px #111;\n\tborder: 1px solid #ccc;\n\tcolor: #ccc;\n\tpadding: 4px 10px;\n\n\tfont-size: 10px;\n\ttext-align: center;\n\tuser-select: none;\n\tfont-family: helvetica;\n\ttext-transform: uppercase;\n}\n\n.knob-label {\n\tcolor: #ddd;\n\ttext-shadow: 0px 1px 1px #000;\n\n\tfont-size: 6px;\n\tmargin-top: -2px;\n\n\ttext-align: center;\n\ttext-transform: uppercase;\n\toverflow: hidden;\n\tuser-select: none;\n\tfont-family: helvetica;\n}\n\n.elements {\n\tdisplay: flex;\n\tflex-direction: column;\n\tjustify-content: flex-start;\n\talign-items: center;\n\n\tpadding: 10px;\n}\n\n.column {\n\tdisplay: flex;\n\tflex-direction: column;\n\tjustify-content: flex-start;\n\talign-items: center;\n\n\tflex: 1;\n\tmargin: 3px;\n}\n\n.row {\n\tdisplay: flex;\n\tflex-direction: row;\n\tjustify-content: flex-start;\n\talign-items: stretch;\n}\n";

var template = "<div id=\"wc-pingpongdelay\" class=\"wrapper\">\n\t<div class=\"row\">\n\t\t<div class=\"column\">\n\t\t\t<webaudio-knob id=\"knob1\" class=\"knob\" sprites=\"99\" value=\"50\" step=\"1\" midilearn=\"true\" width=\"40\" height=\"40\" data-role=\"feedback\" diameter=\"24\"></webaudio-knob>\n\t\t\t<span class=\"knob-label\" id=\"knob1-label\">FEEDBACK</span>\n\t\t</div>\n\t\t<div class=\"column\">\n\t\t\t<webaudio-knob id=\"knob2\" class=\"knob\" sprites=\"99\" value=\"50\" step=\"1\" midilearn=\"true\" width=\"40\" height=\"40\" data-role=\"time\" diameter=\"24\"></webaudio-knob>\n\t\t\t<span class=\"knob-label\" id=\"knob2-label\">TIME</span>\n\t\t</div>\n\t</div>\n\t<div class=\"row\">\n\t\t<div class=\"column\">\n\t\t\t<webaudio-knob id=\"knob3\" class=\"knob\" sprites=\"99\" value=\"50\" step=\"1\" midilearn=\"true\" width=\"40\" height=\"40\" data-role=\"mix\" diameter=\"24\"></webaudio-knob>\n\t\t\t<span class=\"knob-label\" id=\"knob3-label\">MIX</span>\n\t\t</div>\n\t</div>\n\n\t<div class=\"row\">\n\t\t<div class=\"column\">\n\t\t\t<webaudio-switch id=\"switch1\" class=\"switch\" midilearn=\"true\" width=\"32\" height=\"20\"></webaudio-switch>\n\t\t</div>\n\t</div>\n\n\t<div class=\"row\">\n\t\t<div class=\"column\">\n\t\t\t<span class=\"pedalLabel\">Ping Pong Delay</span>\n\t\t</div>\n\t</div>\n</div>\n";

/* *
 *
 *  WebAudio-Controls is based on
 *    webaudio-knob by Eiji Kitamura http://google.com/+agektmr
 *    webaudio-slider by RYoya Kawai https://plus.google.com/108242669191458983485/posts
 *    webaudio-switch by Keisuke Ai http://d.hatena.ne.jp/aike/
 *  Integrated and enhanced by g200kg http://www.g200kg.com/
 *
 *	Copyright 2013 Eiji Kitamura / Ryoya KAWAI / Keisuke Ai / g200kg(Tatsuya Shinyagaito)
 *
 *	 Licensed under the Apache License, Version 2.0 (the "License");
 *	 you may not use this file except in compliance with the License.
 *	 You may obtain a copy of the License at
 *
 *	 http://www.apache.org/licenses/LICENSE-2.0
 *
 *	 Unless required by applicable law or agreed to in writing, software
 *	 distributed under the License is distributed on an "AS IS" BASIS,
 *	 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *	 See the License for the specific language governing permissions and
 *	 limitations under the License.
 *
 * */
if (window.customElements) {
  var styles = document.createElement("style");
  styles.innerHTML = "#webaudioctrl-context-menu {\n  display: none;\n  position: absolute;\n  z-index: 10;\n  padding: 0;\n  width: 100px;\n  color:#eee;\n  background-color: #268;\n  border: solid 1px #888;\n  box-shadow: 1px 1px 2px #888;\n  font-family: sans-serif;\n  font-size: 11px;\n  line-height:1.7em;\n  text-align:center;\n  cursor:pointer;\n  color:#fff;\n  list-style: none;\n}\n#webaudioctrl-context-menu.active {\n  display: block;\n}\n.webaudioctrl-context-menu__item {\n  display: block;\n  margin: 0;\n  padding: 0;\n  color: #000;\n  background-color:#eee;\n  text-decoration: none;\n}\n.webaudioctrl-context-menu__title{\n  font-weight:bold;\n}\n.webaudioctrl-context-menu__item:last-child {\n  margin-bottom: 0;\n}\n.webaudioctrl-context-menu__item:hover {\n  background-color: #b8b8b8;\n}\n";
  document.head.appendChild(styles);
  var midimenu = document.createElement("ul");
  midimenu.id = "webaudioctrl-context-menu";
  midimenu.innerHTML = "<li class=\"webaudioctrl-context-menu__title\">MIDI Learn</li>\n<li class=\"webaudioctrl-context-menu__item\" id=\"webaudioctrl-context-menu-learn\" onclick=\"webAudioControlsMidiManager.contextMenuLearn()\">Learn</li>\n<li class=\"webaudioctrl-context-menu__item\" onclick=\"webAudioControlsMidiManager.contextMenuClear()\">Clear</li>\n<li class=\"webaudioctrl-context-menu__item\" onclick=\"webAudioControlsMidiManager.contextMenuClose()\">Close</li>\n";
  var opt = {
    useMidi: 0,
    midilearn: 0,
    mididump: 0,
    outline: 0,
    knobSrc: null,
    knobSprites: 0,
    knobWidth: 0,
    knobHeight: 0,
    knobDiameter: 64,
    knobColors: "#fff;#000;#000",
    sliderSrc: null,
    sliderKnobsrc: null,
    sliderWidth: 0,
    sliderHeight: 0,
    sliderKnobwidth: 0,
    sliderKnobheight: 0,
    sliderDitchlength: 0,
    sliderColors: "#bbb;#444;#fff",
    switchWidth: 0,
    switchHeight: 0,
    switchDiameter: 24,
    switchColors: "#e00;#000;#fcc",
    paramWidth: 32,
    paramHeight: 16,
    paramColors: "#fff;#000"
  };
  if (window.WebAudioControlsOptions) Object.assign(opt, window.WebAudioControlsOptions);

  class WebAudioControlsWidget extends HTMLElement {
    constructor() {
      super();
      this.addEventListener("keydown", this.keydown);
      this.addEventListener("mousedown", this.pointerdown, {
        passive: false
      });
      this.addEventListener("touchstart", this.pointerdown, {
        passive: false
      });
      this.addEventListener("wheel", this.wheel, {
        passive: true
      });
      this.addEventListener("mouseover", this.pointerover);
      this.addEventListener("mouseout", this.pointerout);
      this.addEventListener("contextmenu", this.contextMenu);
      this.hover = this.drag = 0;
      document.body.appendChild(midimenu);
      this.basestyle = "\n.webaudioctrl-tooltip{\n  display:inline-block;\n  position:absolute;\n  margin:0 -1000px;\n  z-index: 999;\n  background:#eee;\n  color:#000;\n  border:1px solid #666;\n  border-radius:4px;\n  padding:5px 10px;\n  text-align:center;\n  left:0; top:0;\n  font-size:11px;\n  opacity:0;\n  visibility:hidden;\n}\n.webaudioctrl-tooltip:before{\n  content: \"\";\n\tposition: absolute;\n\ttop: 100%;\n\tleft: 50%;\n \tmargin-left: -8px;\n\tborder: 8px solid transparent;\n\tborder-top: 8px solid #666;\n}\n.webaudioctrl-tooltip:after{\n  content: \"\";\n\tposition: absolute;\n\ttop: 100%;\n\tleft: 50%;\n \tmargin-left: -6px;\n\tborder: 6px solid transparent;\n\tborder-top: 6px solid #eee;\n}\n";
    }

    sendEvent(ev) {
      var event;
      event = document.createEvent("HTMLEvents");
      event.initEvent(ev, false, true);
      this.dispatchEvent(event);
    }

    getAttr(n, def) {
      var v = this.getAttribute(n);
      if (v == "" || v == null) return def;

      switch (typeof def) {
        case "number":
          if (v == "true") return 1;
          v = +v;
          if (isNaN(v)) return 0;
          return v;
      }

      return v;
    }

    showtip(d) {
      function numformat(s, x) {
        var i = s.indexOf("%");
        var c = [0, 0],
            type = 0,
            m = 0,
            r = "",
            j = i + 1;

        for (; j < s.length; ++j) {
          if ("dfxXs".indexOf(s[j]) >= 0) {
            type = s[j];
            break;
          }

          if (s[j] == ".") m = 1;else c[m] = c[m] * 10 + parseInt(s[j]);
        }

        switch (type) {
          case "x":
            r = (x | 0).toString(16);
            break;

          case "X":
            r = (x | 0).toString(16).toUpperCase();
            break;

          case "d":
            r = (x | 0).toString();
            break;

          case "f":
            r = x.toFixed(c[1]);
            break;

          case "s":
            r = x.toString();
            break;
        }

        if (c[0] > 0) r = ("               " + r).slice(-c[0]);
        r = s.replace(/%.*[xXdfs]/, r);
        return r;
      }

      var s = this.tooltip;

      if (this.drag || this.hover) {
        if (this.valuetip) {
          if (s == null) s = "%.".concat(this.digits, "f");else if (s.indexOf("%") < 0) s += " : %.".concat(this.digits, "f");
        }

        if (s) {
          this.ttframe.innerHTML = numformat(s, this.convValue);
          this.ttframe.style.display = "inline-block";
          this.ttframe.style.width = "auto";
          this.ttframe.style.height = "auto";
          this.ttframe.style.transition = "opacity 0.5s " + d + "s,visibility 0.5s " + d + "s";
          this.ttframe.style.opacity = 0.9;
          this.ttframe.style.visibility = "visible";
          var rc = this.getBoundingClientRect(),
              rc2 = this.ttframe.getBoundingClientRect();
              document.documentElement.getBoundingClientRect();
          this.ttframe.style.left = (rc.width - rc2.width) * 0.5 + 1000 + "px";
          this.ttframe.style.top = -rc2.height - 8 + "px";
          return;
        }
      }

      this.ttframe.style.transition = "opacity 0.1s " + d + "s,visibility 0.1s " + d + "s";
      this.ttframe.style.opacity = 0;
      this.ttframe.style.visibility = "hidden";
    }

    pointerover(e) {
      this.hover = 1;
      this.showtip(0.6);
    }

    pointerout(e) {
      this.hover = 0;
      this.showtip(0);
    }

    contextMenu(e) {
      if (window.webAudioControlsMidiManager && this.midilearn) {
        webAudioControlsMidiManager.contextMenuOpen(e, this);
      }

      e.preventDefault();
      e.stopPropagation();
    }

    setMidiController(channel, cc) {
      if (this.listeningToThisMidiController(channel, cc)) return;
      this.midiController = {
        'channel': channel,
        'cc': cc
      };
      console.log("Added mapping for channel=" + channel + " cc=" + cc + " tooltip=" + this.tooltip);
    }

    listeningToThisMidiController(channel, cc) {
      var c = this.midiController;
      if ((c.channel === channel || c.channel < 0) && c.cc === cc) return true;
      return false;
    }

    processMidiEvent(event) {
      var channel = event.data[0] & 0xf;
      var controlNumber = event.data[1];

      if (this.midiMode == 'learn') {
        this.setMidiController(channel, controlNumber);
        webAudioControlsMidiManager.contextMenuClose();
        this.midiMode = 'normal';
      }

      if (this.listeningToThisMidiController(channel, controlNumber)) {
        if (this.tagName == "WEBAUDIO-SWITCH") {
          switch (this.type) {
            case "toggle":
              if (event.data[2] >= 64) this.setValue(1 - this.value, true);
              break;

            case "kick":
              this.setValue(event.data[2] >= 64 ? 1 : 0);
              break;

            case "radio":
              var els = document.querySelectorAll("webaudio-switch[type='radio'][group='" + this.group + "']");

              for (var i = 0; i < els.length; ++i) {
                if (els[i] == this) els[i].setValue(1);else els[i].setValue(0);
              }

              break;
          }
        } else {
          var val = this.min + (this.max - this.min) * event.data[2] / 127;
          this.setValue(val, true);
        }
      }
    }

  }

  try {
    customElements.define("webaudio-knob", class WebAudioKnob extends WebAudioControlsWidget {
      constructor() {
        super();
      }

      get src() {
        return this._src;
      }

      set src(v) {
        this._src = v;
        this.setupImage();
      }

      get value() {
        return this._value;
      }

      set value(v) {
        this._value = +v;
        this.redraw();
      }

      get min() {
        return this._min;
      }

      set min(v) {
        this._min = +v;
        this.redraw();
      }

      get max() {
        return this._max;
      }

      set max(v) {
        this._max = +v;
        this.redraw();
      }

      get step() {
        return this._step;
      }

      set step(v) {
        this._step = +v;
        this.redraw();
      }

      get sprites() {
        return this._sprites;
      }

      set sprites(v) {
        this._sprites = +v;
        this.setupImage();
      }

      get width() {
        return this._width;
      }

      set width(v) {
        this._width = +v;
        this.setupImage();
      }

      get height() {
        return this._height;
      }

      set height(v) {
        this._height = +v;
        this.setupImage();
      }

      get diameter() {
        return this._diameter;
      }

      set diameter(v) {
        this._diameter = +v;
        this.setupImage();
      }

      get colors() {
        return this._colors;
      }

      set colors(v) {
        this._colors = v;
        this.setupImage();
      }

      connectedCallback() {
        var root; //      if(this.attachShadow)
        //        root=this.attachShadow({mode: 'open'});
        //      else

        root = this;
        root.innerHTML = "<style>\n".concat(this.basestyle, "\nwebaudio-knob{\n  display:inline-block;\n  position:relative;\n  margin:0;\n  padding:0;\n  cursor:pointer;\n  font-family: sans-serif;\n  font-size: 11px;\n}\n.webaudio-knob-body{\n  display:inline-block;\n  position:relative;\n  z-index:1;\n  margin:0;\n  padding:0;\n}\n</style>\n<div class='webaudio-knob-body' tabindex='1' touch-action='none'></div><div class='webaudioctrl-tooltip'></div>\n");
        this.elem = root.childNodes[2];
        this.ttframe = root.childNodes[3];
        this.enable = this.getAttr("enable", 1);
        this._src = this.getAttr("src", opt.knobSrc);
        this._value = this.getAttr("value", 0);
        this.defvalue = this.getAttr("defvalue", 0);
        this._min = this.getAttr("min", 0);
        this._max = this.getAttr("max", 100);
        this._step = this.getAttr("step", 1);
        this._sprites = this.getAttr("sprites", opt.knobSprites);
        this._width = this.getAttr("width", opt.knobWidth);
        this._height = this.getAttr("height", opt.knobHeight);
        this._diameter = this.getAttr("diameter", opt.knobDiameter);
        this._colors = this.getAttr("colors", opt.knobColors);
        this.outline = this.getAttr("outline", opt.outline);
        this.sensitivity = this.getAttr("sensitivity", 1);
        this.valuetip = this.getAttr("valuetip", 1);
        this.tooltip = this.getAttr("tooltip", null);
        this.conv = this.getAttr("conv", null);
        if (this.conv) this.convValue = eval(this.conv)(this._value);else this.convValue = this._value;
        this.midilearn = this.getAttr("midilearn", opt.midilearn);
        this.midicc = this.getAttr("midicc", null);
        this.midiController = {};
        this.midiMode = "normal";

        if (this.midicc) {
          var ch = parseInt(this.midicc.substring(0, this.midicc.lastIndexOf("."))) - 1;
          var cc = parseInt(this.midicc.substring(this.midicc.lastIndexOf(".") + 1));
          this.setMidiController(ch, cc);
        }

        this.setupImage();
        this.digits = 0;
        this.coltab = ["#e00", "#000", "#000"];
        if (window.webAudioControlsMidiManager) //        window.webAudioControlsMidiManager.updateWidgets();
          window.webAudioControlsMidiManager.addWidget(this);
      }

      disconnectedCallback() {}

      setupImage() {
        this.kw = this.width || this.diameter;
        this.kh = this.height || this.diameter;

        if (!this.src) {
          if (this.colors) this.coltab = this.colors.split(";");
          if (!this.coltab) this.coltab = ["#e00", "#000", "#000"];
          var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"64\" height=\"6464\" preserveAspectRatio=\"none\">\n<radialGradient id=\"gr\" cx=\"30%\" cy=\"30%\"><stop offset=\"0%\" stop-color=\"".concat(this.coltab[2], "\"/><stop offset=\"100%\" stop-color=\"").concat(this.coltab[1], "\"/></radialGradient>\n<defs><circle id=\"B\" cx=\"32\" cy=\"32\" r=\"30\" fill=\"url(#gr)\"/></defs>\n<defs><line id=\"K\" x1=\"32\" y1=\"28\" x2=\"32\" y2=\"7\" stroke-linecap=\"round\" stroke-width=\"6\" stroke=\"").concat(this.coltab[0], "\"/></defs>");

          for (var i = 0; i < 101; ++i) {
            svg += "<use xlink:href=\"#B\" y=\"".concat(64 * i, "\"/>");
            svg += "<use xlink:href=\"#K\" y=\"".concat(64 * i, "\" transform=\"rotate(").concat((-135 + 270 * i / 101).toFixed(2), ",32,").concat(64 * i + 32, ")\"/>");
          }

          svg += "</svg>";
          this.elem.style.backgroundImage = "url(data:image/svg+xml;base64," + btoa(svg) + ")"; //        this.elem.style.backgroundSize = "100% 10100%";

          this.elem.style.backgroundSize = "".concat(this.kw, "px ").concat(this.kh * 101, "px");
        } else {
          this.elem.style.backgroundImage = "url(" + this.src + ")";
          if (!this.sprites) this.elem.style.backgroundSize = "100% 100%";else {
            //          this.elem.style.backgroundSize = `100% ${(this.sprites+1)*100}%`;
            this.elem.style.backgroundSize = "".concat(this.kw, "px ").concat(this.kh * (this.sprites + 1), "px");
          }
        }

        this.elem.style.outline = this.outline ? "" : "none";
        this.elem.style.width = this.kw + "px";
        this.elem.style.height = this.kh + "px";
        this.redraw();
      }

      redraw() {
        if (!this.isConnected) return;
        this.digits = 0;

        if (this.step && this.step < 1) {
          for (var n = this.step; n < 1; n *= 10) {
            ++this.digits;
          }
        }

        if (this.value < this.min) {
          this.value = this.min;
          return;
        }

        if (this.value > this.max) {
          this.value = this.max;
          return;
        }

        var range = this.max - this.min;
        var style = this.elem.style;
        var sp = this.src ? this.sprites : 100;

        if (sp >= 1) {
          var offset = sp * (this.value - this.min) / range | 0;
          style.backgroundPosition = "0px " + -offset * this.kh + "px";
          style.transform = 'rotate(0deg)';
        } else {
          var deg = 270 * ((this.value - this.min) / range - 0.5);
          style.backgroundPosition = "0px 0px";
          style.transform = 'rotate(' + deg + 'deg)';
        }
      }

      _setValue(v) {
        if (this.step) v = Math.round((v - this.min) / this.step) * this.step + this.min;
        this._value = Math.min(this.max, Math.max(this.min, v));

        if (this._value != this.oldvalue) {
          this.oldvalue = this._value;
          if (this.conv) this.convValue = eval(this.conv)(this._value);else this.convValue = this._value;
          this.redraw();
          this.showtip(0);
          return 1;
        }

        return 0;
      }

      setValue(v, f) {
        if (this._setValue(v) && f) this.sendEvent("input"), this.sendEvent("change");
      }

      wheel(e) {
        var delta = (this.max - this.min) * 0.01;
        delta = e.deltaY > 0 ? -delta : delta;
        if (!e.shiftKey) delta *= 5;
        if (Math.abs(delta) < this.step) delta = delta > 0 ? +this.step : -this.step;
        this.setValue(+this.value + delta, true);
        e.preventDefault();
        e.stopPropagation();
      }

      pointerdown(ev) {
        if (!this.enable) return;
        var e = ev;

        if (ev.touches) {
          e = ev.changedTouches[0];
          this.identifier = e.identifier;
        } else {
          if (e.buttons != 1 && e.button != 0) return;
        }

        this.elem.focus();
        this.drag = 1;
        this.showtip(0);

        var pointermove = ev => {
          var e = ev;

          if (ev.touches) {
            for (var i = 0; i < ev.touches.length; ++i) {
              if (ev.touches[i].identifier == this.identifier) {
                e = ev.touches[i];
                break;
              }
            }
          }

          if (this.lastShift !== e.shiftKey) {
            this.lastShift = e.shiftKey;
            this.startPosX = e.pageX;
            this.startPosY = e.pageY;
            this.startVal = this.value;
          }

          var offset = (this.startPosY - e.pageY - this.startPosX + e.pageX) * this.sensitivity;

          this._setValue(this.min + ((this.startVal + (this.max - this.min) * offset / ((e.shiftKey ? 4 : 1) * 128) - this.min) / this.step | 0) * this.step);

          this.sendEvent("input");
          if (e.preventDefault) e.preventDefault();
          if (e.stopPropagation) e.stopPropagation();
          return false;
        };

        var pointerup = ev => {
          var e = ev;

          if (ev.touches) {
            for (var i = 0;;) {
              if (ev.changedTouches[i].identifier == this.identifier) {
                break;
              }

              if (++i >= ev.changedTouches.length) return;
            }
          }

          this.drag = 0;
          this.showtip(0);
          this.startPosX = this.startPosY = null;
          window.removeEventListener('mousemove', pointermove);
          window.removeEventListener('touchmove', pointermove, {
            passive: false
          });
          window.removeEventListener('mouseup', pointerup);
          window.removeEventListener('touchend', pointerup);
          window.removeEventListener('touchcancel', pointerup);
          document.body.removeEventListener('touchstart', preventScroll, {
            passive: false
          });
          this.sendEvent("change");
        };

        var preventScroll = e => {
          e.preventDefault();
        };

        if (e.ctrlKey || e.metaKey) this.setValue(this.defvalue, true);else {
          this.startPosX = e.pageX;
          this.startPosY = e.pageY;
          this.startVal = this.value;
          window.addEventListener('mousemove', pointermove);
          window.addEventListener('touchmove', pointermove, {
            passive: false
          });
        }
        window.addEventListener('mouseup', pointerup);
        window.addEventListener('touchend', pointerup);
        window.addEventListener('touchcancel', pointerup);
        document.body.addEventListener('touchstart', preventScroll, {
          passive: false
        });
        ev.preventDefault();
        ev.stopPropagation();
        return false;
      }

    });
  } catch (error) {//console.log("webaudio-knob already defined");
  }

  try {
    customElements.define("webaudio-slider", class WebAudioSlider extends WebAudioControlsWidget {
      constructor() {
        super();
      }

      get src() {
        return this._src;
      }

      set src(v) {
        this._src = v;
        this.setupImage();
      }

      get knobsrc() {
        return this._knobsrc;
      }

      set knobsrc(v) {
        this._knobsrc = v;
        this.setupImage();
      }

      get value() {
        return this._value;
      }

      set value(v) {
        this._value = +v;
        this.redraw();
      }

      get min() {
        return this._min;
      }

      set min(v) {
        this._min = +v;
        this.redraw();
      }

      get max() {
        return this._max;
      }

      set max(v) {
        this._max = +v;
        this.redraw();
      }

      get step() {
        return this._step;
      }

      set step(v) {
        this._step = +v;
        this.redraw();
      }

      get sprites() {
        return this._sprites;
      }

      set sprites(v) {
        this._sprites = +v;
        this.setupImage();
      }

      get direction() {
        return this._direction;
      }

      set direction(v) {
        this._direction = +v;
        this.setupImage();
      }

      get width() {
        return this._width;
      }

      set width(v) {
        this._width = +v;
        this.setupImage();
      }

      get height() {
        return this._height;
      }

      set height(v) {
        this._height = +v;
        this.setupImage();
      }

      get knobwidth() {
        return this._knobwidth;
      }

      set knobwidth(v) {
        this._knobwidth = +v;
        this.setupImage();
      }

      get knobheight() {
        return this._knobheight;
      }

      set knobheight(v) {
        this._knobheight = +v;
        this.setupImage();
      }

      get ditchlength() {
        return this._ditchlength;
      }

      set ditchlength(v) {
        this._ditchlength = +v;
        this.setupImage();
      }

      get colors() {
        return this._colors;
      }

      set colors(v) {
        this._colors = v;
        this.setupImage();
      }

      connectedCallback() {
        var root; //      if(this.attachShadow)
        //        root=this.attachShadow({mode: 'open'});
        //      else

        root = this;
        root.innerHTML = "<style>\n".concat(this.basestyle, "\nwebaudio-slider{\n  display:inline-block;\n  position:relative;\n  margin:0;\n  padding:0;\n  font-family: sans-serif;\n  font-size: 11px;\n  cursor:pointer;\n}\n.webaudio-slider-body{\n  display:inline-block;\n  position:relative;\n  margin:0;\n  padding:0;\n}\n.webaudio-slider-knob{\n  display:inline-block;\n  position:absolute;\n  margin:0;\n  padding:0;\n}\n</style>\n<div class='webaudio-slider-body' tabindex='1' touch-action='none'><div class='webaudio-slider-knob' touch-action='none'></div></div><div class='webaudioctrl-tooltip'></div>\n");
        this.elem = root.childNodes[2];
        this.knob = this.elem.childNodes[0];
        this.ttframe = root.childNodes[3];
        this.enable = this.getAttr("enable", 1);
        this._src = this.getAttr("src", opt.sliderSrc);
        this._knobsrc = this.getAttr("knobsrc", opt.sliderKnobsrc);
        this._value = this.getAttr("value", 0);
        this.defvalue = this.getAttr("defvalue", 0);
        this._min = this.getAttr("min", 0);
        this._max = this.getAttr("max", 100);
        this._step = this.getAttr("step", 1);
        this._sprites = this.getAttr("sprites", 0);
        this._direction = this.getAttr("direction", null);
        this._width = this.getAttr("width", opt.sliderWidth);
        this._height = this.getAttr("height", opt.sliderHeight);

        if (this._direction == "horz") {
          if (this._width == 0) this._width = 128;
          if (this._height == 0) this._height = 24;
        } else {
          if (this._width == 0) this._width = 24;
          if (this._height == 0) this._height = 128;
        }

        this._knobwidth = this.getAttr("knobwidth", opt.sliderKnobwidth);
        this._knobheight = this.getAttr("knbheight", opt.sliderKnobheight);
        this._ditchlength = this.getAttr("ditchlength", opt.sliderDitchlength);
        this._colors = this.getAttr("colors", opt.sliderColors);
        this.outline = this.getAttr("outline", opt.outline);
        this.sensitivity = this.getAttr("sensitivity", 1);
        this.valuetip = this.getAttr("valuetip", 1);
        this.tooltip = this.getAttr("tooltip", null);
        this.conv = this.getAttr("conv", null);
        if (this.conv) this.convValue = eval(this.conv)(this._value);else this.convValue = this._value;
        this.midilearn = this.getAttr("midilearn", opt.midilearn);
        this.midicc = this.getAttr("midicc", null);
        this.midiController = {};
        this.midiMode = "normal";

        if (this.midicc) {
          var ch = parseInt(this.midicc.substring(0, this.midicc.lastIndexOf("."))) - 1;
          var cc = parseInt(this.midicc.substring(this.midicc.lastIndexOf(".") + 1));
          this.setMidiController(ch, cc);
        }

        this.setupImage();
        this.digits = 0;
        if (window.webAudioControlsMidiManager) //        window.webAudioControlsMidiManager.updateWidgets();
          window.webAudioControlsMidiManager.addWidget(this);

        this.elem.onclick = e => {
          e.stopPropagation();
        };
      }

      disconnectedCallback() {}

      setupImage() {
        this.coltab = this.colors.split(";");
        this.dr = this.direction;
        this.dlen = this.ditchlength;

        if (!this.width) {
          if (this.dr == "horz") this.width = 128;else this.width = 24;
        }

        if (!this.height) {
          if (this.dr == "horz") this.height = 24;else this.height = 128;
        }

        if (!this.dr) this.dr = this.width <= this.height ? "vert" : "horz";

        if (this.dr == "vert") {
          if (!this.dlen) this.dlen = this.height - this.width;
        } else {
          if (!this.dlen) this.dlen = this.width - this.height;
        }

        this.knob.style.backgroundSize = "100% 100%";
        this.elem.style.backgroundSize = "100% 100%";
        this.elem.style.width = this.width + "px";
        this.elem.style.height = this.height + "px";
        this.kwidth = this.knobwidth || (this.dr == "horz" ? this.height : this.width);
        this.kheight = this.knobheight || (this.dr == "horz" ? this.height : this.width);
        this.knob.style.width = this.kwidth + "px";
        this.knob.style.height = this.kheight + "px";

        if (!this.src) {
          var r = Math.min(this.width, this.height) * 0.5;
          var svgbody = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"".concat(this.width, "\" height=\"").concat(this.height, "\" preserveAspectRatio=\"none\">\n<rect x=\"1\" y=\"1\" rx=\"").concat(r, "\" ry=\"").concat(r, "\" width=\"").concat(this.width - 2, "\" height=\"").concat(this.height - 2, "\" fill=\"").concat(this.coltab[1], "\"/></svg>");
          this.elem.style.backgroundImage = "url(data:image/svg+xml;base64," + btoa(svgbody) + ")";
        } else {
          this.elem.style.backgroundImage = "url(" + this.src + ")";
        }

        if (!this.knobsrc) {
          var svgthumb = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"".concat(this.kwidth, "\" height=\"").concat(this.kheight, "\" preserveAspectRatio=\"none\">\n<radialGradient id=\"gr\" cx=\"30%\" cy=\"30%\"><stop offset=\"0%\" stop-color=\"").concat(this.coltab[2], "\"/><stop offset=\"100%\" stop-color=\"").concat(this.coltab[0], "\"/></radialGradient>\n<rect x=\"2\" y=\"2\" width=\"").concat(this.kwidth - 4, "\" height=\"").concat(this.kheight - 4, "\" rx=\"").concat(this.kwidth * 0.5, "\" ry=\"").concat(this.kheight * 0.5, "\" fill=\"url(#gr)\"/></svg>");
          this.knob.style.backgroundImage = "url(data:image/svg+xml;base64," + btoa(svgthumb) + ")";
        } else {
          this.knob.style.backgroundImage = "url(" + this.knobsrc + ")";
        }

        this.elem.style.outline = this.outline ? "" : "none";
        this.redraw();
      }

      redraw() {
        if (!this.isConnected) return;
        this.digits = 0;

        if (this.step && this.step < 1) {
          for (var n = this.step; n < 1; n *= 10) {
            ++this.digits;
          }
        }

        if (this.value < this.min) {
          this.value = this.min;
          return;
        }

        if (this.value > this.max) {
          this.value = this.max;
          return;
        }

        var range = this.max - this.min;
        var style = this.knob.style;

        if (this.dr == "vert") {
          style.left = (this.width - this.kwidth) * 0.5 + "px";
          style.top = (1 - (this.value - this.min) / range) * this.dlen + "px";
          this.sensex = 0;
          this.sensey = 1;
        } else {
          style.top = (this.height - this.kheight) * 0.5 + "px";
          style.left = (this.value - this.min) / range * this.dlen + "px";
          this.sensex = 1;
          this.sensey = 0;
        }
      }

      _setValue(v) {
        v = Math.round((v - this.min) / this.step) * this.step + this.min;
        this._value = Math.min(this.max, Math.max(this.min, v));

        if (this._value != this.oldvalue) {
          this.oldvalue = this._value;
          if (this.conv) this.convValue = eval(this.conv)(this._value);else this.convValue = this._value;
          this.redraw();
          this.showtip(0);
          return 1;
        }

        return 0;
      }

      setValue(v, f) {
        if (this._setValue(v) && f) this.sendEvent("input"), this.sendEvent("change");
      }

      wheel(e) {
        var delta = (this.max - this.min) * 0.01;
        delta = e.deltaY > 0 ? -delta : delta;
        if (!e.shiftKey) delta *= 5;
        if (Math.abs(delta) < this.step) delta = delta > 0 ? +this.step : -this.step;
        this.setValue(+this.value + delta, true);
        e.preventDefault();
        e.stopPropagation();
        this.redraw();
      }

      pointerdown(ev) {
        if (!this.enable) return;
        var e = ev;

        if (ev.touches) {
          e = ev.changedTouches[0];
          this.identifier = e.identifier;
        } else {
          if (e.buttons != 1 && e.button != 0) return;
        }

        this.elem.focus();
        this.drag = 1;
        this.showtip(0);

        var pointermove = ev => {
          var e = ev;

          if (ev.touches) {
            for (var i = 0; i < ev.touches.length; ++i) {
              if (ev.touches[i].identifier == this.identifier) {
                e = ev.touches[i];
                break;
              }
            }
          }

          if (this.lastShift !== e.shiftKey) {
            this.lastShift = e.shiftKey;
            this.startPosX = e.pageX;
            this.startPosY = e.pageY;
            this.startVal = this.value;
          }

          var offset = ((this.startPosY - e.pageY) * this.sensey - (this.startPosX - e.pageX) * this.sensex) * this.sensitivity;

          this._setValue(this.min + ((this.startVal + (this.max - this.min) * offset / ((e.shiftKey ? 4 : 1) * this.dlen) - this.min) / this.step | 0) * this.step);

          this.sendEvent("input");
          if (e.preventDefault) e.preventDefault();
          if (e.stopPropagation) e.stopPropagation();
          return false;
        };

        var pointerup = ev => {
          var e = ev;

          if (ev.touches) {
            for (var i = 0;;) {
              if (ev.changedTouches[i].identifier == this.identifier) {
                break;
              }

              if (++i >= ev.changedTouches.length) return;
            }
          }

          this.drag = 0;
          this.showtip(0);
          this.startPosX = this.startPosY = null;
          window.removeEventListener('mousemove', pointermove);
          window.removeEventListener('touchmove', pointermove, {
            passive: false
          });
          window.removeEventListener('mouseup', pointerup);
          window.removeEventListener('touchend', pointerup);
          window.removeEventListener('touchcancel', pointerup);
          document.body.removeEventListener('touchstart', preventScroll, {
            passive: false
          });
          this.sendEvent("change");
        };

        var preventScroll = e => {
          e.preventDefault();
        };

        if (e.touches) e = e.touches[0];
        if (e.ctrlKey || e.metaKey) this.setValue(this.defvalue, true);else {
          this.startPosX = e.pageX;
          this.startPosY = e.pageY;
          this.startVal = this.value;
          window.addEventListener('mousemove', pointermove);
          window.addEventListener('touchmove', pointermove, {
            passive: false
          });
        }
        window.addEventListener('mouseup', pointerup);
        window.addEventListener('touchend', pointerup);
        window.addEventListener('touchcancel', pointerup);
        document.body.addEventListener('touchstart', preventScroll, {
          passive: false
        });
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

    });
  } catch (error) {//console.log("webaudio-slider already defined");
  }

  try {
    customElements.define("webaudio-switch", class WebAudioSwitch extends WebAudioControlsWidget {
      constructor() {
        super();
      }

      get src() {
        return this._src;
      }

      set src(v) {
        this._src = v;
        this.setupImage();
      }

      get value() {
        return this._value;
      }

      set value(v) {
        this._value = +v;
        this.redraw();
      }

      get width() {
        return this._width;
      }

      set width(v) {
        this._width = +v;
        this.setupImage();
      }

      get height() {
        return this._height;
      }

      set height(v) {
        this._height = +v;
        this.setupImage();
      }

      get diameter() {
        return this._diameter;
      }

      set diameter(v) {
        this._diameter = +v;
        this.setupImage();
      }

      get colors() {
        return this._colors;
      }

      set colors(v) {
        this._colors = v;
        this.setupImage();
      }

      connectedCallback() {
        var root; //      if(this.attachShadow)
        //        root=this.attachShadow({mode: 'open'});
        //      else

        root = this;
        root.innerHTML = "<style>\n".concat(this.basestyle, "\nwebaudio-switch{\n  display:inline-block;\n  margin:0;\n  padding:0;\n  font-family: sans-serif;\n  font-size: 11px;\n  cursor:pointer;\n}\n.webaudio-switch-body{\n  display:inline-block;\n  margin:0;\n  padding:0;\n}\n</style>\n<div class='webaudio-switch-body' tabindex='1' touch-action='none'><div class='webaudioctrl-tooltip'></div></div>\n");
        this.elem = root.childNodes[2];
        this.ttframe = this.elem.childNodes[0];
        this.enable = this.getAttr("enable", 1);
        this._src = this.getAttr("src", null);
        this._value = this.getAttr("value", 0);
        this.defvalue = this.getAttr("defvalue", 0);
        this.type = this.getAttr("type", "toggle");
        this.group = this.getAttr("group", "");
        this._width = this.getAttr("width", 0);
        this._height = this.getAttr("height", 0);
        this._diameter = this.getAttr("diameter", 0);
        this.invert = this.getAttr("invert", 0);
        this._colors = this.getAttr("colors", opt.switchColors);
        this.outline = this.getAttr("outline", opt.outline);
        this.valuetip = 0;
        this.tooltip = this.getAttr("tooltip", null);
        this.midilearn = this.getAttr("midilearn", opt.midilearn);
        this.midicc = this.getAttr("midicc", null);
        this.midiController = {};
        this.midiMode = "normal";

        if (this.midicc) {
          var ch = parseInt(this.midicc.substring(0, this.midicc.lastIndexOf("."))) - 1;
          var cc = parseInt(this.midicc.substring(this.midicc.lastIndexOf(".") + 1));
          this.setMidiController(ch, cc);
        }

        this.setupImage();
        this.digits = 0;
        if (window.webAudioControlsMidiManager) //        window.webAudioControlsMidiManager.updateWidgets();
          window.webAudioControlsMidiManager.addWidget(this);

        this.elem.onclick = e => {
          e.stopPropagation();
        };
      }

      disconnectedCallback() {}

      setupImage() {
        var w = this.width || this.diameter || opt.switchWidth || opt.switchDiameter;
        var h = this.height || this.diameter || opt.switchHeight || opt.switchDiameter;

        if (!this.src) {
          this.coltab = this.colors.split(";");
          var mm = Math.min(w, h);
          var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"".concat(w, "\" height=\"").concat(h * 2, "\" preserveAspectRatio=\"none\">\n<radialGradient id=\"gr\" cx=\"30%\" cy=\"30%\"><stop offset=\"0%\" stop-color=\"").concat(this.coltab[2], "\"/><stop offset=\"100%\" stop-color=\"").concat(this.coltab[0], "\"/></radialGradient>\n<rect x=\"").concat(w * 0.05, "\" y=\"").concat(h * 0.05, "\" width=\"").concat(w * 0.9, "\" height=\"").concat(h * 0.9, "\" rx=\"").concat(mm * 0.1, "\" ry=\"").concat(mm * 0.1, "\" fill=\"").concat(this.coltab[1], "\"/>\n<rect x=\"").concat(w * 0.05, "\" y=\"").concat(h * 1.05, "\" width=\"").concat(w * 0.9, "\" height=\"").concat(h * 0.9, "\" rx=\"").concat(mm * 0.1, "\" ry=\"").concat(mm * 0.1, "\" fill=\"").concat(this.coltab[1], "\"/>\n<circle cx=\"").concat(w * 0.5, "\" cy=\"").concat(h * 0.5, "\" r=\"").concat(mm * 0.3, "\" stroke=\"").concat(this.coltab[0], "\" stroke-width=\"2\"/>\n<circle cx=\"").concat(w * 0.5, "\" cy=\"").concat(h * 1.5, "\" r=\"").concat(mm * 0.3, "\" stroke=\"").concat(this.coltab[0], "\" stroke-width=\"2\" fill=\"url(#gr)\"/></svg>");
          this.elem.style.backgroundImage = "url(data:image/svg+xml;base64," + btoa(svg) + ")";
          this.elem.style.backgroundSize = "100% 200%";
        } else {
          this.elem.style.backgroundImage = "url(" + this.src + ")";
          if (!this.sprites) this.elem.style.backgroundSize = "100% 200%";else this.elem.style.backgroundSize = "100% ".concat((this.sprites + 1) * 100, "%");
        }

        this.elem.style.width = w + "px";
        this.elem.style.height = h + "px";
        this.elem.style.outline = this.outline ? "" : "none";
        this.redraw();
      }

      redraw() {
        if (!this.isConnected) return;
        var style = this.elem.style;
        if (this.value ^ this.invert) style.backgroundPosition = "0px -100%";else style.backgroundPosition = "0px 0px";
      }

      setValue(v, f) {
        console.log(v, f);
        this.value = v;
        this.checked = !!v;

        if (this.value != this.oldvalue) {
          this.redraw();
          this.showtip(0);

          if (f) {
            this.sendEvent("input");
            this.sendEvent("change");
          }

          this.oldvalue = this.value;
        }
      }

      pointerdown(ev) {
        if (!this.enable) return;
        var e = ev;

        if (ev.touches) {
          e = ev.changedTouches[0];
          this.identifier = e.identifier;
        } else {
          if (e.buttons != 1 && e.button != 0) return;
        }

        this.elem.focus();
        this.drag = 1;
        this.showtip(0);

        var pointermove = e => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        };

        var pointerup = e => {
          this.drag = 0;
          this.showtip(0);
          window.removeEventListener('mousemove', pointermove);
          window.removeEventListener('touchmove', pointermove, {
            passive: false
          });
          window.removeEventListener('mouseup', pointerup);
          window.removeEventListener('touchend', pointerup);
          window.removeEventListener('touchcancel', pointerup);
          document.body.removeEventListener('touchstart', preventScroll, {
            passive: false
          });

          if (this.type == "kick") {
            this.value = 0;
            this.checked = false;
            this.redraw();
            this.sendEvent("change");
          }

          this.sendEvent("click");
          e.preventDefault();
          e.stopPropagation();
        };

        var preventScroll = e => {
          e.preventDefault();
        };

        switch (this.type) {
          case "kick":
            this.setValue(1);
            this.sendEvent("change");
            break;

          case "toggle":
            if (e.ctrlKey || e.metaKey) this.value = defvalue;else this.value = 1 - this.value;
            this.checked = !!this.value;
            this.sendEvent("change");
            break;

          case "radio":
            var els = document.querySelectorAll("webaudio-switch[type='radio'][group='" + this.group + "']");

            for (var i = 0; i < els.length; ++i) {
              if (els[i] == this) els[i].setValue(1);else els[i].setValue(0);
            }

            this.sendEvent("change");
            break;
        }

        window.addEventListener('mouseup', pointerup);
        window.addEventListener('touchend', pointerup);
        window.addEventListener('touchcancel', pointerup);
        document.body.addEventListener('touchstart', preventScroll, {
          passive: false
        });
        this.redraw();
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

    });
  } catch (error) {//console.log("webaudio-switch already defined");
  }

  try {
    customElements.define("webaudio-param", class WebAudioParam extends WebAudioControlsWidget {
      constructor() {
        super();
        this.addEventListener("keydown", this.keydown);
        this.addEventListener("mousedown", this.pointerdown, {
          passive: false
        });
        this.addEventListener("touchstart", this.pointerdown, {
          passive: false
        });
        this.addEventListener("wheel", this.wheel);
        this.addEventListener("mouseover", this.pointerover);
        this.addEventListener("mouseout", this.pointerout);
        this.addEventListener("contextmenu", this.contextMenu);
      }

      get src() {
        return this._src;
      }

      set src(v) {
        this._src = v;
        this.setupImage();
      }

      get value() {
        return this._value;
      }

      set value(v) {
        this._value = +v;
        this.redraw();
      }

      get fontsize() {
        return this._fontsize;
      }

      set fontsize(v) {
        this._fontsize = +v;
        this.setupImage();
      }

      get width() {
        return this._width;
      }

      set width(v) {
        this._width = +v;
        this.setupImage();
      }

      get height() {
        return this._height;
      }

      set height(v) {
        this._height = +v;
        this.setupImage();
      }

      get colors() {
        return this._colors;
      }

      set colors(v) {
        this._colors = v;
        this.setupImage();
      }

      connectedCallback() {
        var root; //      if(this.attachShadow)
        //        root=this.attachShadow({mode: 'open'});
        //      else

        root = this;
        root.innerHTML = "<style>\n".concat(this.basestyle, "\nwebaudio-param{\n  display:inline-block;\n  user-select:none;\n  margin:0;\n  padding:0;\n  font-family: sans-serif;\n  font-size: 8px;\n  cursor:pointer;\n}\n.webaudio-param-body{\n  display:inline-block;\n  text-align:center;\n  vertical-align:middle;\n  position:relative;\n  border:1px solid #888;\n  background:none;\n  border-radius:4px;\n  margin:0;\n  padding:0;\n  font-family:sans-serif;\n  font-size:11px;\n}\n</style>\n<input class='webaudio-param-body' value='0' tabindex='1' touch-action='none'/><div class='webaudioctrl-tooltip'></div>\n");
        this.elem = root.childNodes[2];
        this.ttframe = root.childNodes[3];
        this.enable = this.getAttr("enable", 1);
        this._value = this.getAttr("value", 0);
        this.defvalue = this.getAttr("defvalue", 0);
        this._fontsize = this.getAttr("fontsize", 9);
        this._src = this.getAttr("src", null);
        this.link = this.getAttr("link", "");
        this._width = this.getAttr("width", 32);
        this._height = this.getAttr("height", 16);
        this._colors = this.getAttr("colors", "#fff;#000");
        this.outline = this.getAttr("outline", opt.outline);
        this.midiController = {};
        this.midiMode = "normal";

        if (this.midicc) {
          var ch = parseInt(this.midicc.substring(0, this.midicc.lastIndexOf("."))) - 1;
          var cc = parseInt(this.midicc.substring(this.midicc.lastIndexOf(".") + 1));
          this.setMidiController(ch, cc);
        }

        this.setupImage();
        if (window.webAudioControlsMidiManager) //        window.webAudioControlsMidiManager.updateWidgets();
          window.webAudioControlsMidiManager.addWidget(this);

        this.fromLink = (e => {
          this.setValue(e.target.convValue.toFixed(e.target.digits));
        }).bind(this);

        this.elem.onchange = () => {
          var le = document.getElementById(this.link);
          if (le) le.setValue(+this.elem.value);
        };
      }

      disconnectedCallback() {}

      setupImage() {
        this.coltab = this.colors.split(";");
        this.elem.style.color = this.coltab[0];

        if (!this.src) {
          this.elem.style.backgroundColor = this.coltab[1];
        } else {
          this.elem.style.backgroundImage = "url(" + this.src + ")";
          this.elem.style.backgroundSize = "100% 100%";
        }

        this.elem.style.width = this.width + "px";
        this.elem.style.height = this.height + "px";
        this.elem.style.fontSize = this.fontsize + "px";
        this.elem.style.outline = this.outline ? "" : "none";
        var l = document.getElementById(this.link);

        if (l) {
          this.setValue(l.value.toFixed(l.digits));
          l.addEventListener("input", e => {
            this.setValue(l.value.toFixed(l.digits));
          });
        }

        this.redraw();
      }

      redraw() {
        if (!this.isConnected) return;
        this.elem.value = this.value;
      }

      setValue(v, f) {
        this.value = v;

        if (this.value != this.oldvalue) {
          this.redraw();
          this.showtip(0);

          if (f) {
            var event = document.createEvent("HTMLEvents");
            event.initEvent("change", false, true);
            this.dispatchEvent(event);
          }

          this.oldvalue = this.value;
        }
      }

      pointerdown(ev) {
        if (!this.enable) return;
        var e = ev;
        if (ev.touches) e = ev.touches[0];else {
          if (e.buttons != 1 && e.button != 0) return;
        }
        this.elem.focus();
        this.drag = 1;
        this.showtip(0);

        var pointermove = e => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        };

        var pointerup = e => {
          this.drag = 0;
          this.showtip(0);
          window.removeEventListener('mouseup', pointerup);
          window.removeEventListener('touchend', pointerup);
          window.removeEventListener('touchcancel', pointerup);
          document.body.removeEventListener('touchstart', preventScroll, {
            passive: false
          });
        };

        var preventScroll = e => {
          e.preventDefault();
        };

        window.addEventListener('mouseup', pointerup);
        window.addEventListener('touchend', pointerup);
        window.addEventListener('touchcancel', pointerup);
        document.body.addEventListener('touchstart', preventScroll, {
          passive: false
        });
        this.redraw();
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
        return false;
      }

    });
  } catch (error) {//console.log("webaudio-param already defined");
  }

  try {
    customElements.define("webaudio-keyboard", class WebAudioKeyboard extends WebAudioControlsWidget {
      constructor() {
        super();
      }

      get width() {
        return this._width;
      }

      set width(v) {
        this._width = v;
        this.setupImage();
      }

      get height() {
        return this._height;
      }

      set height(v) {
        this._height = v;
        this.setupImage();
      }

      get min() {
        return this._min;
      }

      set min(v) {
        this._min = +v;
        this.redraw();
      }

      get step() {
        return this._step;
      }

      set step(v) {
        this._step = +v;
        this.redraw();
      }

      get keys() {
        return this._keys;
      }

      set keys(v) {
        this._keys = +v;
        this.setupImage();
      }

      get colors() {
        return this._colors;
      }

      set colors(v) {
        this._colors = v;
        this.setupImage();
      }

      connectedCallback() {
        var root; //      if(this.attachShadow)
        //        root=this.attachShadow({mode: 'open'});
        //      else

        root = this;
        root.innerHTML = "<style>\n".concat(this.basestyle, "\nwebaudio-keyboard{\n  display:inline-block;\n  position:relative;\n  margin:0;\n  padding:0;\n  font-family: sans-serif;\n  font-size: 11px;\n}\n.webaudio-keyboard-body{\n  display:inline-block;\n  margin:0;\n  padding:0;\n}\n</style>\n<canvas class='webaudio-keyboard-body' tabindex='1' touch-action='none'></canvas><div class='webauioctrl-tooltip'></div>\n");
        this.cv = root.childNodes[2];
        this.ttframe = root.childNodes[3];
        this.ctx = this.cv.getContext("2d");
        this._values = [];
        this.enable = this.getAttr("enable", 1);
        this._width = this.getAttr("width", 480);
        this._height = this.getAttr("height", 128);
        this._min = this.getAttr("min", 0);
        this._keys = this.getAttr("keys", 25);
        this._colors = this.getAttr("colors", "#222;#eee;#ccc;#333;#000;#e88;#c44;#c33;#800");
        this.outline = this.getAttr("outline", opt.outline);
        this.midilearn = this.getAttr("midilearn", 0);
        this.midicc = this.getAttr("midicc", null);
        this.press = 0;
        this.keycodes1 = [90, 83, 88, 68, 67, 86, 71, 66, 72, 78, 74, 77, 188, 76, 190, 187, 191, 226];
        this.keycodes2 = [81, 50, 87, 51, 69, 82, 53, 84, 54, 89, 55, 85, 73, 57, 79, 48, 80, 192, 222, 219];
        this.addEventListener("keyup", this.keyup);
        this.midiController = {};
        this.midiMode = "normal";

        if (this.midicc) {
          var ch = parseInt(this.midicc.substring(0, this.midicc.lastIndexOf("."))) - 1;
          var cc = parseInt(this.midicc.substring(this.midicc.lastIndexOf(".") + 1));
          this.setMidiController(ch, cc);
        }

        this.setupImage();
        this.digits = 0;
        this.addEventListener("mousemove", this.pointermove);
        this.addEventListener("touchmove", this.pointermove, {
          passive: false
        });
        this.addEventListener("mouseup", this.pointerup);
        this.addEventListener("touchend", this.pointerup);
        this.addEventListener("touchcancel", this.pointerup);
        if (window.webAudioControlsMidiManager) //        window.webAudioControlsMidiManager.updateWidgets();
          window.webAudioControlsMidiManager.addWidget(this);
      }

      disconnectedCallback() {}

      setupImage() {
        this.cv.style.width = this.width + "px";
        this.cv.style.height = this.height + "px";
        this.bheight = this.height * 0.55;
        this.kp = [0, 7 / 12, 1, 3 * 7 / 12, 2, 3, 6 * 7 / 12, 4, 8 * 7 / 12, 5, 10 * 7 / 12, 6];
        this.kf = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
        this.ko = [0, 0, 7 * 2 / 12 - 1, 0, 7 * 4 / 12 - 2, 7 * 5 / 12 - 3, 0, 7 * 7 / 12 - 4, 0, 7 * 9 / 12 - 5, 0, 7 * 11 / 12 - 6];
        this.kn = [0, 2, 4, 5, 7, 9, 11];
        this.coltab = this.colors.split(";");
        this.cv.width = this.width;
        this.cv.height = this.height;
        this.cv.style.width = this.width + 'px';
        this.cv.style.height = this.height + 'px';
        this.cv.style.outline = this.outline ? "" : "none";
        this.bheight = this.height * 0.55;
        this.max = this.min + this.keys - 1;
        this.dispvalues = [];
        this.valuesold = [];
        if (this.kf[this.min % 12]) --this.min;
        if (this.kf[this.max % 12]) ++this.max;
        this.redraw();
      }

      redraw() {
        if (!this.isConnected) return;

        function rrect(ctx, x, y, w, h, r, c1, c2) {
          if (c2) {
            var g = ctx.createLinearGradient(x, y, x + w, y);
            g.addColorStop(0, c1);
            g.addColorStop(1, c2);
            ctx.fillStyle = g;
          } else ctx.fillStyle = c1;

          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + w, y);
          ctx.lineTo(x + w, y + h - r);
          ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          ctx.lineTo(x + r, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - r);
          ctx.lineTo(x, y);
          ctx.fill();
        }

        this.ctx.fillStyle = this.coltab[0];
        this.ctx.fillRect(0, 0, this.width, this.height);
        var x0 = 7 * (this.min / 12 | 0) + this.kp[this.min % 12];
        var x1 = 7 * (this.max / 12 | 0) + this.kp[this.max % 12];
        var n = x1 - x0;
        this.wwidth = (this.width - 1) / (n + 1);
        this.bwidth = this.wwidth * 7 / 12;
        var h2 = this.bheight;
        var r = Math.min(8, this.wwidth * 0.2);

        for (var i = this.min, j = 0; i <= this.max; ++i) {
          if (this.kf[i % 12] == 0) {
            var x = this.wwidth * j++ + 1;
            if (this.dispvalues.indexOf(i) >= 0) rrect(this.ctx, x, 1, this.wwidth - 1, this.height - 2, r, this.coltab[5], this.coltab[6]);else rrect(this.ctx, x, 1, this.wwidth - 1, this.height - 2, r, this.coltab[1], this.coltab[2]);
          }
        }

        r = Math.min(8, this.bwidth * 0.3);

        for (var _i = this.min; _i < this.max; ++_i) {
          if (this.kf[_i % 12]) {
            var _x = this.wwidth * this.ko[this.min % 12] + this.bwidth * (_i - this.min) + 1;

            if (this.dispvalues.indexOf(_i) >= 0) rrect(this.ctx, _x, 1, this.bwidth, h2, r, this.coltab[7], this.coltab[8]);else rrect(this.ctx, _x, 1, this.bwidth, h2, r, this.coltab[3], this.coltab[4]);
            this.ctx.strokeStyle = this.coltab[0];
            this.ctx.stroke();
          }
        }
      }

      _setValue(v) {
        if (this.step) v = Math.round((v - this.min) / this.step) * this.step + this.min;
        this._value = Math.min(this.max, Math.max(this.min, v));

        if (this._value != this.oldvalue) {
          this.oldvalue = this._value;
          this.redraw();
          this.showtip(0);
          return 1;
        }

        return 0;
      }

      setValue(v, f) {
        if (this._setValue(v) && f) this.sendEvent("input"), this.sendEvent("change");
      }

      wheel(e) {}

      keydown(e) {
        var m = Math.floor((this.min + 11) / 12) * 12;
        var k = this.keycodes1.indexOf(e.keyCode);

        if (k < 0) {
          k = this.keycodes2.indexOf(e.keyCode);
          if (k >= 0) k += 12;
        }

        if (k >= 0) {
          k += m;

          if (this.currentKey != k) {
            this.currentKey = k;
            this.sendEventFromKey(1, k);
            this.setNote(1, k);
          }
        }
      }

      keyup(e) {
        var m = Math.floor((this.min + 11) / 12) * 12;
        var k = this.keycodes1.indexOf(e.keyCode);

        if (k < 0) {
          k = this.keycodes2.indexOf(e.keyCode);
          if (k >= 0) k += 12;
        }

        if (k >= 0) {
          k += m;
          this.currentKey = -1;
          this.sendEventFromKey(0, k);
          this.setNote(0, k);
        }
      }

      pointerdown(e) {
        this.cv.focus(); //      document.body.addEventListener('touchstart',this.preventScroll,{passive:false});

        if (this.enable) {
          ++this.press;
          this.pointermove(e);
        }

        e.preventDefault();
      }

      pointermove(e) {
        if (!this.enable) return;
        var r = this.getBoundingClientRect();
        var v = [],
            p;
        if (e.touches) p = e.targetTouches;else if (this.press) p = [e];else p = [];
        if (p.length > 0) this.drag = 1;

        for (var i = 0; i < p.length; ++i) {
          var px = p[i].clientX - r.left;
          var py = p[i].clientY - r.top;
          var x = void 0,
              k = void 0,
              ko = void 0;

          if (py < this.bheight) {
            x = px - this.wwidth * this.ko[this.min % 12];
            k = this.min + (x / this.bwidth | 0);
          } else {
            k = px / this.wwidth | 0;
            ko = this.kp[this.min % 12];
            k += ko;
            k = this.min + (k / 7 | 0) * 12 + this.kn[k % 7] - this.kn[ko % 7];
          }

          if (k >= this.min && k <= this.max) v.push(k);
        }

        v.sort();
        this.values = v;
        this.sendevent();
        this.redraw();
      }

      pointerup(e) {
        if (this.enable) {
          --this.press;
          this.pointermove(e);
          this.sendevent();
          this.redraw();
        }

        this.drag = 0;
        e.preventDefault();
      }

      sendEventFromKey(s, k) {
        var ev = document.createEvent('HTMLEvents');
        ev.initEvent('change', true, true);
        ev.note = [s, k];
        this.dispatchEvent(ev);
      }

      sendevent() {
        var notes = [];

        for (var i = 0, j = this.valuesold.length; i < j; ++i) {
          if (this.values.indexOf(this.valuesold[i]) < 0) notes.push([0, this.valuesold[i]]);
        }

        for (var _i2 = 0, _j = this.values.length; _i2 < _j; ++_i2) {
          if (this.valuesold.indexOf(this.values[_i2]) < 0) notes.push([1, this.values[_i2]]);
        }

        if (notes.length) {
          this.valuesold = this.values;

          for (var _i3 = 0; _i3 < notes.length; ++_i3) {
            this.setdispvalues(notes[_i3][0], notes[_i3][1]);
            var ev = document.createEvent('HTMLEvents');
            ev.initEvent('change', true, true);
            ev.note = notes[_i3];
            this.dispatchEvent(ev);
          }
        }
      }

      setdispvalues(state, note) {
        var n = this.dispvalues.indexOf(note);

        if (state) {
          if (n < 0) this.dispvalues.push(note);
        } else {
          if (n >= 0) this.dispvalues.splice(n, 1);
        }
      }

      setNote(state, note) {
        this.setdispvalues(state, note);
        this.redraw();
      }

    });
  } catch (error) {//console.log("webaudio-keyboard already defined");
  } // FOR MIDI LEARN


  class WebAudioControlsMidiManager {
    constructor() {
      this.midiAccess = null;
      this.listOfWidgets = [];
      this.listOfExternalMidiListeners = [];
      this.updateWidgets();
      this.initWebAudioControls();
    }

    addWidget(w) {
      this.listOfWidgets.push(w);
    }

    updateWidgets() {//      this.listOfWidgets = document.querySelectorAll("webaudio-knob,webaudio-slider,webaudio-switch");
    }

    initWebAudioControls() {
      if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess().then(ma => {
          this.midiAccess = ma, this.enableInputs();
        }, err => {
          console.log("MIDI not initialized - error encountered:" + err.code);
        });
      }
    }

    enableInputs() {
      var inputs = this.midiAccess.inputs.values(); //console.log("Found " + this.midiAccess.inputs.size + " MIDI input(s)");

      for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        //console.log("Connected input: " + input.value.name);
        input.value.onmidimessage = this.handleMIDIMessage.bind(this);
      }
    }

    midiConnectionStateChange(e) {
      // console.log("connection: " + e.port.name + " " + e.port.connection + " " + e.port.state);
      enableInputs();
    }

    onMIDIStarted(midi) {
      this.midiAccess = midi;
      midi.onstatechange = this.midiConnectionStateChange;
      enableInputs(midi);
    } // Add hooks for external midi listeners support


    addMidiListener(callback) {
      this.listOfExternalMidiListeners.push(callback);
    }

    getCurrentConfigAsJSON() {
      return currentConfig.stringify();
    }

    handleMIDIMessage(event) {
      this.listOfExternalMidiListeners.forEach(function (externalListener) {
        externalListener(event);
      });
      if ((event.data[0] & 0xf0) == 0xf0 || (event.data[0] & 0xf0) == 0xb0 && event.data[1] >= 120) return;

      for (var w of this.listOfWidgets) {
        if (w.processMidiEvent) w.processMidiEvent(event);
      }

      if (opt.mididump) console.log(event.data);
    }

    contextMenuOpen(e, knob) {
      if (!this.midiAccess) return;
      var menu = document.getElementById("webaudioctrl-context-menu");
      menu.style.left = e.pageX + "px";
      menu.style.top = e.pageY + "px";
      menu.knob = knob;
      menu.classList.add("active");
      menu.knob.focus(); //      document.activeElement.onblur=this.contextMenuClose;

      menu.knob.addEventListener("keydown", this.contextMenuCloseByKey.bind(this));
    }

    contextMenuCloseByKey(e) {
      if (e.keyCode == 27) this.contextMenuClose();
    }

    contextMenuClose() {
      var menu = document.getElementById("webaudioctrl-context-menu");
      menu.knob.removeEventListener("keydown", this.contextMenuCloseByKey);
      menu.classList.remove("active");
      var menuItemLearn = document.getElementById("webaudioctrl-context-menu-learn");
      menuItemLearn.innerHTML = 'Learn';
      menu.knob.midiMode = 'normal';
    }

    contextMenuLearn() {
      var menu = document.getElementById("webaudioctrl-context-menu");
      var menuItemLearn = document.getElementById("webaudioctrl-context-menu-learn");
      menuItemLearn.innerHTML = 'Listening...';
      menu.knob.midiMode = 'learn';
    }

    contextMenuClear(e) {
      var menu = document.getElementById("webaudioctrl-context-menu");
      menu.knob.midiController = {};
      this.contextMenuClose();
    }

  }

  if (window.UseWebAudioControlsMidi || opt.useMidi) window.webAudioControlsMidiManager = new WebAudioControlsMidiManager();
}

var knobImg = "assets/nux_black_white_stripe.png";

var switchImg = "assets/switch_1.png";

var getAssetUrl = asset => {
  var base = new URL('.', import.meta.url);
  return "".concat(base).concat(asset);
}; // The GUI is a WebComponent. Not mandatory but useful.
// MANDORY : the GUI should be a DOM node. WebComponents are
// practical as they encapsulate everyhing in a shadow dom


class PingPongDelayHTMLElement extends HTMLElement {
  /**
   * plugin = the same that is passed in the DSP part. It's the instance
   * of the class that extends WebAudioModule. It's an Observable plugin
   * @param {import('@webaudiomodules/sdk').WebAudioModule<import('../Node').default>} plugin
   * @memberof PingPongDelayHTMLElement
   */
  constructor(plugin) {
    super();

    _defineProperty(this, "handleAnimationFrame", () => {
      var {
        feedback,
        mix,
        time,
        enabled
      } = this.plugin.audioNode.paramMgr.getParamsValues();
      this.shadowRoot.querySelector('#knob1').value = feedback * 100;
      this.shadowRoot.querySelector('#knob2').value = time * 100;
      this.shadowRoot.querySelector('#knob3').value = mix * 100;
      this.shadowRoot.querySelector('#switch1').value = enabled;
      window.requestAnimationFrame(this.handleAnimationFrame);
    });

    this.root = this.attachShadow({
      mode: 'open'
    });
    this.root.innerHTML = "<style>".concat(style, "</style>").concat(template); // MANDATORY for the GUI to observe the plugin state

    this.plugin = plugin;
    this.setResources();
    this.setKnobs();
    this.setSwitchListener();
  }

  // Provided by the WebComponent API, called when the plugin is
  // connected to the DOM
  connectedCallback() {
    window.requestAnimationFrame(this.handleAnimationFrame);
  }
  /**
   * Change relative URLS to absolute URLs for CSS assets, webaudio controls spritesheets etc.
   */


  setResources() {
    // Set up the background img & style
    // Setting up the knobs imgs, those are loaded from the assets
    this.root.querySelectorAll('.knob').forEach(knob => {
      knob.setAttribute('src', getAssetUrl(knobImg));
    });
    this.root.querySelectorAll('.switch').forEach(sw => {
      sw.setAttribute('src', getAssetUrl(switchImg));
    });
  }

  setKnobs() {
    this.shadowRoot.querySelector('#knob1').addEventListener('input', e => {
      if (this.plugin.audioContext.state === 'suspended') this.plugin.audioNode.paramMgr.setParamValue('feedback', e.target.value / 100);else this.plugin.audioNode.paramMgr.setParamTargetAtTime('feedback', e.target.value / 100, this.plugin.audioContext.currentTime, 0.01);
    });
    this.shadowRoot.querySelector('#knob2').addEventListener('input', e => {
      if (this.plugin.audioContext.state === 'suspended') this.plugin.audioNode.paramMgr.setParamValue('time', e.target.value / 100);else this.plugin.audioNode.paramMgr.setParamTargetAtTime('time', e.target.value / 100, this.plugin.audioContext.currentTime, 0.01);
    });
    this.shadowRoot.querySelector('#knob3').addEventListener('input', e => {
      if (this.plugin.audioContext.state === 'suspended') this.plugin.audioNode.paramMgr.setParamValue('mix', e.target.value / 100);else this.plugin.audioNode.paramMgr.setParamTargetAtTime('mix', e.target.value / 100, this.plugin.audioContext.currentTime, 0.01);
    });
  }

  setSwitchListener() {
    var {
      plugin
    } = this;
    this.shadowRoot.querySelector('#switch1').addEventListener('change', function onChange() {
      plugin.audioNode.paramMgr.setParamValue('enabled', +!!this.checked);
    });
  } // name of the custom HTML element associated
  // with the plugin. Will appear in the DOM if
  // the plugin is visible


  static is() {
    return 'wasabi-pingpongdelay';
  }

}

if (!customElements.get(PingPongDelayHTMLElement.is())) {
  customElements.define(PingPongDelayHTMLElement.is(), PingPongDelayHTMLElement);
}

/**
 * A mandatory method if you want a gui for your plugin
 * @param {import('@webaudiomodules/api').WebAudioModule} plugin - the plugin instance
 * @returns {Node} - the plugin root node that is inserted in the DOM of the host
 */

function createElement(_x) {
  return _createElement.apply(this, arguments);
}

function _createElement() {
  _createElement = _asyncToGenerator(function* (plugin) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    // here we return the WebComponent GUI but it could be
    // any DOM node
    return new PingPongDelayHTMLElement(plugin, ...args);
  });
  return _createElement.apply(this, arguments);
}

/**
 * @param {URL} relativeURL
 * @returns {string}
 */

var getBasetUrl = relativeURL => {
  var baseURL = relativeURL.href.substring(0, relativeURL.href.lastIndexOf('/'));
  return baseURL;
};
/**
 * Definition of a new plugin
 *
 * @class PingPongDelayPlugin
 * @extends {WebAudioModule<PingPongDelayNode>}
 */


class PingPongDelayPlugin extends WebAudioModule_default {
  constructor() {
    super(...arguments);

    _defineProperty(this, "_baseURL", getBasetUrl(new URL('.', import.meta.url)));

    _defineProperty(this, "_descriptorUrl", "".concat(this._baseURL, "/descriptor.json"));
  }

  _loadDescriptor() {
    var _this = this;

    return _asyncToGenerator(function* () {
      var url = _this._descriptorUrl;
      if (!url) throw new TypeError('Descriptor not found');
      var response = yield fetch(url);
      var descriptor = yield response.json();
      Object.assign(_this.descriptor, descriptor);
    })();
  }

  initialize(state) {
    var _superprop_getInitialize = () => super.initialize,
        _this2 = this;

    return _asyncToGenerator(function* () {
      yield _this2._loadDescriptor();
      return _superprop_getInitialize().call(_this2, state);
    })();
  }

  createAudioNode(initialState) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      var pingPongDelayNode = new PingPongDelayNode(_this3.audioContext);
      var paramsConfig = {
        feedback: {
          minValue: 0,
          maxValue: 1,
          defaultValue: 0.5
        },
        time: {
          defaultValue: 0.5
        },
        mix: {
          defaultValue: 0.5
        },
        enabled: {
          defaultValue: 1
        }
      };
      var internalParamsConfig = {
        delayLeftTime: pingPongDelayNode.delayNodeLeft.delayTime,
        delayRightTime: pingPongDelayNode.delayNodeRight.delayTime,
        dryGain: pingPongDelayNode.dryGainNode.gain,
        wetGain: pingPongDelayNode.wetGainNode.gain,
        feedback: pingPongDelayNode.feedbackGainNode.gain,
        enabled: {
          onChange: value => {
            pingPongDelayNode.status = !!value;
          }
        }
      };
      var paramsMapping = {
        time: {
          delayLeftTime: {},
          delayRightTime: {}
        },
        mix: {
          dryGain: {
            sourceRange: [0.5, 1],
            targetRange: [1, 0]
          },
          wetGain: {
            sourceRange: [0, 0.5],
            targetRange: [0, 1]
          }
        }
      };
      var optionsIn = {
        internalParamsConfig,
        paramsConfig,
        paramsMapping
      };
      var paramMgrNode = yield ParamMgrFactory.create(_this3, optionsIn);
      pingPongDelayNode.setup(paramMgrNode);
      if (initialState) pingPongDelayNode.setState(initialState);
      return pingPongDelayNode;
    })();
  }

  createGui() {
    return createElement(this);
  }

}

export { PingPongDelayPlugin as default };
//# sourceMappingURL=index.js.map

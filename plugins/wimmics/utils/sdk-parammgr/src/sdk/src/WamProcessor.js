/** @typedef {import('@webaudiomodules/api').WamProcessor} IWamProcessor */
/** @typedef {typeof import('@webaudiomodules/api').WamProcessor} WamProcessorConstructor */
/** @typedef {import('@webaudiomodules/api').WamParameter} WamParameter */
/** @typedef {import('@webaudiomodules/api').WamParameterInfoMap} WamParameterInfoMap */
/** @typedef {import('@webaudiomodules/api').WamParameterDataMap} WamParameterDataMap */
/** @typedef {import('@webaudiomodules/api').WamParameterData} WamParameterData */
/** @typedef {import('@webaudiomodules/api').WamParameterMap} WamParameterMap */
/** @typedef {import('@webaudiomodules/api').WamEvent} WamEvent */
/** @typedef {import('@webaudiomodules/api').WamTransportData} WamTransportData */
/** @typedef {import('@webaudiomodules/api').WamMidiData} WamMidiData */
/** @typedef {import('@webaudiomodules/api').WamBinaryData} WamBinaryData */
/** @typedef {import('@webaudiomodules/api').AudioWorkletGlobalScope} AudioWorkletGlobalScope */
/** @typedef {import('./types').PendingWamEvent} PendingWamEvent */
/** @typedef {import('./types').ProcessingSlice} ProcessingSlice */
/** @typedef {import('./types').WamParameterInterpolatorMap} WamParameterInterpolatorMap */
/** @typedef {import('./types').WamEventRingBuffer} WamEventRingBuffer */
/** @typedef {import('./types').WamSDKBaseModuleScope} WamSDKBaseModuleScope */

/**
 * @param {string} moduleId
 * @returns {WamProcessorConstructor}
 */
const getWamProcessor = (moduleId) => {
	/** @type {AudioWorkletGlobalScope} */
	// @ts-ignore
	const audioWorkletGlobalScope = globalThis;
	const {
		AudioWorkletProcessor,
		webAudioModules,
	} = audioWorkletGlobalScope;

	/** @type {WamSDKBaseModuleScope} */
	const ModuleScope = audioWorkletGlobalScope.webAudioModules.getModuleScope(moduleId);
	const {
		RingBuffer,
		WamEventRingBuffer,
		WamParameter,
		WamParameterInterpolator
	} = ModuleScope;

	/**
	 * @implements {IWamProcessor}
	 */
	class WamProcessor extends AudioWorkletProcessor {
		/**
		 * @param {AudioWorkletNodeOptions} options
		 */
		constructor(options) {
			super();
			const {
				groupId,
				moduleId,
				instanceId,
				useSab,
			} = options.processorOptions;

			if (!moduleId) throw Error('must provide moduleId argument in processorOptions!');
			if (!instanceId) throw Error('must provide instanceId argument in processorOptions!');

			/** @type {string} */
			this.groupId = groupId;
			/** @type {string} */
			this.moduleId = moduleId;
			/** @type {string} */
			this.instanceId = instanceId;
			/** @type {number} */
			this._samplesPerQuantum = 128;
			/** @type {number} */
			this._compensationDelay = 0;
			/** @type {WamParameterInfoMap} */
			this._parameterInfo = {};
			/** @type {WamParameterMap} */
			this._parameterState = {};
			/** @type {WamParameterInterpolatorMap} */
			this._parameterInterpolators = {};
			/** @type {PendingWamEvent[]} */
			this._eventQueue = [];
			/** @type {Record<number, (...args: any[]) => any>} */
			this._pendingResponses = {};
			/** @type {boolean} */
			this._useSab = !!useSab && !!globalThis.SharedArrayBuffer;
			/** @type {boolean} */
			this._eventSabReady = false;
			/** @type {SharedArrayBuffer} */
			this._audioToMainEventSab = null;
			/** @type {SharedArrayBuffer} */
			this._mainToAudioEventSab = null;
			/** @type {WamEventRingBuffer} */
			this._eventWriter = null;
			/** @type {WamEventRingBuffer} */
			this._eventReader = null;
			/** @type {boolean} */
			this._initialized = false;
			/** @type {boolean} */
			this._destroyed = false;

			webAudioModules.addWam(this);

			this.port.onmessage = this._onMessage.bind(this);

			if (this._useSab) this._configureSab();
		}

		/**
		 * Compensation delay hint in seconds.
		 * @returns {number}
		 */
		getCompensationDelay() { return this._compensationDelay; }

		/**
		 * Schedule a WamEvent.
		 * Listeners will be triggered when the event is processed.
		 * @param {WamEvent[]} events
		 */
		scheduleEvents(...events) {
			let i = 0;
			while (i < events.length) {
				// no need for ids if scheduled from audio thread
				this._eventQueue.push({ id: 0, event: events[i] });
				i++;
			}
		}

		/**
		 * Schedule events for all the downstream WAMs
		 * @param {WamEvent[]} events
		 */
		emitEvents(...events) {
			webAudioModules.emitEvents(this, ...events);
		}

		/**
		 * Clear all pending WamEvents.
		 */
		clearEvents() {
			this._eventQueue = [];
		}

		/**
		 * Process a block of samples. Note that `parameters` argument is ignored.
		 * @param {Float32Array[][]} inputs
		 * @param {Float32Array[][]} outputs
		 * @param {{[x: string]: Float32Array}} parameters
		 */
		process(inputs, outputs, parameters) {
			if (!this._initialized) return true;
			if (this._destroyed) return false;
			if (this._eventSabReady) this.scheduleEvents(...this._eventReader.read());

			const processingSlices = this._getProcessingSlices();
			let i = 0;
			while (i < processingSlices.length) {
				const { range, events } = processingSlices[i];
				const [startSample, endSample] = range;
				// pause to process events at proper sample
				let j = 0;
				while (j < events.length) {
					this._processEvent(events[j]);
					j++;
				}
				// perform parameter interpolation
				this._interpolateParameterValues(startSample, endSample);
				// continue processing
				this._process(startSample, endSample, inputs, outputs, parameters);
				i++;
			}
			return true;
		}

		/**
		 * Stop processing and remove the node from the WAM event graph.
		 */
		destroy() {
			this._destroyed = true;
			this.port.close();
			webAudioModules.removeWam(this);
		}

		/**
		 * Override to generate map of WamParameterInfo objects.
		 * @returns {WamParameterInfoMap}
		 */
		_generateWamParameterInfo() { return {}; }

		/**
		 * Post-constructor initialization method.
		 */
		_initialize() {
			this._parameterState = {};
			this._parameterInterpolators = {};
			this._parameterInfo = this._generateWamParameterInfo();
			Object.keys(this._parameterInfo).forEach((parameterId) => {
				const info = this._parameterInfo[parameterId];
				this._parameterState[parameterId] = new WamParameter(this._parameterInfo[parameterId]);
				this._parameterInterpolators[parameterId] = new WamParameterInterpolator(info, 256);
			});
		}

		/**
		 * Communicate with WamNode to configure SharedArrayBuffers.
		 */
		_configureSab() {
			const eventCapacity = 2 ** 10;
			const parameterIds = Object.keys(this._parameterInfo);
			if (this._eventSabReady) {
				// if parameter set changes after initialization
				this._eventWriter.setParameterIds(parameterIds);
				this._eventReader.setParameterIds(parameterIds);
			}
			this.port.postMessage({ eventSab: { eventCapacity, parameterIds } });
		}

		/**
		 * Messages from main thread appear here.
		 * @param {MessageEvent} message
		 */
		async _onMessage(message) {
			if (message.data.request) {
				const {
					id, request, content,
				} = message.data;
				const response = { id, response: request };
				const requestComponents = request.split('/');
				const verb = requestComponents[0];
				const noun = requestComponents[1];
				response.content = 'error';
				if (verb === 'get') {
					if (noun === 'parameterInfo') {
						let { parameterIds } = content;
						if (!parameterIds.length) parameterIds = Object.keys(this._parameterInfo);
						const parameterInfo = {};
						let i = 0;
						while (i < parameterIds.length) {
							const parameterId = parameterIds[i];
							parameterInfo[parameterId] = this._parameterInfo[parameterId];
							i++;
						}
						response.content = parameterInfo;
					} else if (noun === 'parameterValues') {
						/*eslint-disable-next-line prefer-const */
						let { normalized, parameterIds } = content;
						response.content = this._getParameterValues(normalized, parameterIds);
					} else if (noun === 'state') {
						response.content = this._getState();
						// ...additional state?
					} else if (noun === 'compensationDelay') {
						response.content = this.getCompensationDelay();
					}
				} else if (verb === 'set') {
					if (noun === 'parameterValues') {
						const { parameterValues } = content;
						this._setParameterValues(parameterValues, true);
						delete response.content;
					} else if (noun === 'state') {
						const { state } = content;
						this._setState(state);
						// ...additional state?
						delete response.content;
					}
				} else if (verb === 'add') {
					if (noun === 'event') {
						const { event } = content;
						this._eventQueue.push({ id, event });
						return; // defer postMessage until event is processed
					}
				} else if (verb === 'remove') {
					if (noun === 'events') {
						const ids = this._eventQueue.map((queued) => queued.id);
						this.clearEvents();
						response.content = ids;
					}
				} else if (verb === 'connect') {
					if (noun === 'events') {
						const { wamInstanceId, output } = content;
						this._connectEvents(wamInstanceId, output);
						delete response.content;
					}
				} else if (verb === 'disconnect') {
					if (noun === 'events') {
						const { wamInstanceId, output } = content;
						this._disconnectEvents(wamInstanceId, output);
						delete response.content;
					}
				} else if (verb === 'initialize') {
					if (noun === 'processor') {
						this._initialize();
						this._initialized = true;
						delete response.content;
					}
					else if (noun === 'eventSab') {
						const { mainToAudioEventSab, audioToMainEventSab } = content;

						/** @private @type {SharedArrayBuffer} */
						this._audioToMainEventSab = audioToMainEventSab;

						/** @private @type {SharedArrayBuffer} */
						this._mainToAudioEventSab = mainToAudioEventSab;

						const parameterIds = Object.keys(this._parameterInfo);
						/** @private @type {WamEventRingBuffer} */
						this._eventWriter = new WamEventRingBuffer(RingBuffer, this._audioToMainEventSab,
							parameterIds);
						/** @private @type {WamEventRingBuffer} */
						this._eventReader = new WamEventRingBuffer(RingBuffer, this._mainToAudioEventSab,
							parameterIds);

						this._eventSabReady = true;
						delete response.content;
					}
				}
				this.port.postMessage(response);
			} else if (message.data.destroy) {
				this.destroy();
			}
		}

		/**
		 * @param {WamTransportData} transportData
		 */
		_onTransport(transportData) {
			// Override for custom transport handling
			// eslint-disable-next-line no-console
			console.error('_onTransport not implemented!');
		}

		/**
		 * @param {WamMidiData} midiData
		 */
		_onMidi(midiData) {
			// Override for custom midi handling
			// eslint-disable-next-line no-console
			console.error('_onMidi not implemented!');
		}

		/**
		 * @param {WamBinaryData} sysexData
		 */
		_onSysex(sysexData) {
			// Override for custom sysex handling
			// eslint-disable-next-line no-console
			console.error('_onMidi not implemented!');
		}

		/**
		 * @param {WamMidiData} mpeData
		 */
		_onMpe(mpeData) {
			// Override for custom mpe handling
			// eslint-disable-next-line no-console
			console.error('_onMpe not implemented!');
		}

		/**
		 * @param {WamBinaryData} oscData
		 */
		_onOsc(oscData) {
			// Override for custom osc handling
			// eslint-disable-next-line no-console
			console.error('_onOsc not implemented!');
		}

		/**
		 * @param {any} state
		 */
		_setState(state) {
			if (state.parameterValues) this._setParameterValues(state.parameterValues, false);
		}

		/**
		 * @returns {any}
		 */
		_getState() {
			return { parameterValues: this._getParameterValues(false) };
		}

		/**
		 * @param {boolean} normalized
		 * @param {string[]=} parameterIds
		 * @returns {WamParameterDataMap}
		 */
		_getParameterValues(normalized, parameterIds) {
			/** @type {WamParameterDataMap} */
			const parameterValues = {};
			if (!parameterIds || !parameterIds.length) parameterIds = Object.keys(this._parameterState);
			let i = 0;
			while (i < parameterIds.length) {
				const id = parameterIds[i];
				/** @type {WamParameter} */
				const parameter = this._parameterState[id];
				parameterValues[id] = {
					id,
					value: normalized ? parameter.normalizedValue : parameter.value,
					normalized,
				};
				i++;
			}
			return parameterValues;
		}

		/**
		 * @param {WamParameterDataMap} parameterUpdates
		 * @param {boolean} interpolate
		 */
		_setParameterValues(parameterUpdates, interpolate) {
			const parameterIds = Object.keys(parameterUpdates);
			let i = 0;
			while (i < parameterIds.length) {
				this._setParameterValue(parameterUpdates[parameterIds[i]], interpolate);
				i++;
			}
		}

		/**
		 * @param {WamParameterData} parameterUpdate
		 * @param {boolean} interpolate
		 */
		_setParameterValue(parameterUpdate, interpolate) {
			const { id, value, normalized } = parameterUpdate;
			/** @type {WamParameter} */
			const parameter = this._parameterState[id];
			if (!parameter) return;
			if (!normalized) parameter.value = value;
			else parameter.normalizedValue = value;
			const interpolator = this._parameterInterpolators[id];
			if (interpolate) interpolator.setEndValue(parameter.value);
			else interpolator.setStartValue(parameter.value);
		}

		/**
		 * @param {number} startIndex
		 * @param {number} endIndex
		 */
		_interpolateParameterValues(startIndex, endIndex) {
			const parameterIds = Object.keys(this._parameterInterpolators);
			let i = 0;
			while (i < parameterIds.length) {
				this._parameterInterpolators[parameterIds[i]].process(startIndex, endIndex);
				i++;
			}
		}

		/**
		 * @param {string} wamInstanceId
		 * @param {number} [output]
		 */
		_connectEvents(wamInstanceId, output) {
			webAudioModules.connectEvents(this.groupId, this.instanceId, wamInstanceId, output);
		}

		/**
		 * @param {string} [wamInstanceId]
		 * @param {number} [output]
		 */
		_disconnectEvents(wamInstanceId, output) {
			if (typeof wamInstanceId === 'undefined') {
				webAudioModules.disconnectEvents(this.groupId, this.instanceId);
				return;
			}
			webAudioModules.disconnectEvents(this.groupId, this.instanceId, wamInstanceId, output);
		}

		/**
		 * Example implementation of custom sample accurate event scheduling.
		 * @returns {ProcessingSlice[]}
		 * */
		_getProcessingSlices() {
			const response = 'add/event';
			/** @ts-ignore */
			const { currentTime, sampleRate } = audioWorkletGlobalScope;
			/** @type {{[sampleIndex: number]: WamEvent[]}} */
			const eventsBySampleIndex = {};
			// assumes events arrive sorted by time
			let i = 0;
			while (i < this._eventQueue.length) {
				const { id, event } = this._eventQueue[i];
				const offsetSec = event.time - currentTime;
				const sampleIndex = offsetSec > 0 ? Math.round(offsetSec * sampleRate) : 0;
				if (sampleIndex < this._samplesPerQuantum) {
					if (eventsBySampleIndex[sampleIndex]) eventsBySampleIndex[sampleIndex].push(event);
					else eventsBySampleIndex[sampleIndex] = [event];
					// notify main thread
					if (id) this.port.postMessage({ id, response });
					else if (this._eventSabReady) this._eventWriter.write(event);
					else this.port.postMessage({ event });
					this._eventQueue.shift();
					i = -1;
				} else break;
				i++;
			}

			/** @type {ProcessingSlice[]} */
			const processingSlices = [];
			const keys = Object.keys(eventsBySampleIndex);
			if (keys[0] !== '0') {
				keys.unshift('0');
				eventsBySampleIndex['0'] = [];
			}
			const lastIndex = keys.length - 1;
			i = 0;
			while (i < keys.length) {
				const key = keys[i];
				const startSample = parseInt(key);
				const endSample = (i < lastIndex) ? parseInt(keys[i + 1]) : this._samplesPerQuantum;
				processingSlices.push({ range: [startSample, endSample], events: eventsBySampleIndex[key] });
				i++;
			}
			return processingSlices;
		}

		/** @param {WamEvent} event */
		_processEvent(event) {
			switch (event.type) {
			case 'wam-automation': this._setParameterValue(event.data, true); break;
			case 'wam-transport': this._onTransport(event.data); break;
			case 'wam-midi': this._onMidi(event.data); break;
			case 'wam-sysex': this._onSysex(event.data); break;
			case 'wam-mpe': this._onMpe(event.data); break;
			case 'wam-osc': this._onOsc(event.data); break;
			default: break;
			}
		}

		/**
		 * Override this to implement custom DSP.
		 * @param {number} startSample beginning of processing slice
		 * @param {number} endSample end of processing slice
		 * @param {Float32Array[][]} inputs
		 * @param {Float32Array[][]} outputs
		 * @param {{[x: string]: Float32Array}} parameters
		 */
		_process(startSample, endSample, inputs, outputs, parameters) {
			// Override for custom processing
			// eslint-disable-next-line no-console
			console.error('_process not implemented!');
		}
	}

	if (audioWorkletGlobalScope.AudioWorkletProcessor) {
		if (!ModuleScope.WamProcessor) ModuleScope.WamProcessor = WamProcessor;
	}

	return WamProcessor;
};

export default getWamProcessor;

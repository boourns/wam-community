import MgrAudioParam from './MgrAudioParam.js';

/** @typedef {import('@webaudiomodules/api').WebAudioModule} WebAudioModule */
/** @typedef {import('@webaudiomodules/api').WamNode} WamNode */
/** @typedef {import('@webaudiomodules/api').WamParameterDataMap} WamParameterValueMap */
/** @typedef {import('@webaudiomodules/api').WamEvent} WamEvent */
/** @typedef {import('@webaudiomodules/api').WamAutomationEvent} WamAutomationEvent */
/** @typedef {import('./types').ParamMgrOptions} ParamMgrOptions */
/** @typedef {import('./types').ParamMgrCallFromProcessor} ParamMgrCallFromProcessor */
/** @typedef {import('./types').ParamMgrCallToProcessor} ParamMgrCallToProcessor */
/** @typedef {import('./types').ParamMgrNodeMsgIn} ParamMgrNodeMsgIn */
/** @typedef {import('./types').ParamMgrNodeMsgOut} ParamMgrNodeMsgOut */
/** @typedef {import('./types').ParamMgrNode} IParamMgrNode */

/** @type {typeof import('./TypedAudioWorklet').TypedAudioWorkletNode} */
// @ts-ignore
const AudioWorkletNode = globalThis.AudioWorkletNode;

/**
 * @extends {AudioWorkletNode<ParamMgrNodeMsgIn, ParamMgrNodeMsgOut>}
 * @implements {IParamMgrNode}
 */
export default class ParamMgrNode extends AudioWorkletNode {
	/**
     * @param {WebAudioModule} module
     * @param {ParamMgrOptions} options
     */
	constructor(module, options) {
		super(module.audioContext, module.moduleId, {
			numberOfInputs: 0,
			numberOfOutputs: 1 + options.processorOptions.internalParams.length,
			parameterData: options.parameterData,
			processorOptions: options.processorOptions,
		});
		const { processorOptions, internalParamsConfig } = options;
		this.initialized = false;
		this.module = module;
		this.instanceId = options.processorOptions.instanceId;
		this.groupId = options.processorOptions.groupId;
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

		/** @type {Record<number, ((...args: any[]) => any)>} */
		const resolves = {};
		/** @type {Record<number, ((...args: any[]) => any)>} */
		const rejects = {};
		/**
		 * @param {keyof ParamMgrCallToProcessor} call
		 * @param {any} args
		 */
		this.call = (call, ...args) => {
			const id = this.messageRequestId;
			this.messageRequestId += 1;
			return new Promise((resolve, reject) => {
				resolves[id] = resolve;
				rejects[id] = reject;
				this.port.postMessage({ id, call, args });
			});
		};
		this.handleMessage = ({ data }) => {
			const { id, call, args, value, error } = data;
			if (call) {
				/** @type {any} */
				const r = { id };
				try {
					r.value = this[call](...args);
				} catch (e) {
					r.error = e;
				}
				this.port.postMessage(r);
			} else {
                if (error) rejects[id]?.(error);
                else resolves[id]?.(value);
                delete resolves[id];
                delete rejects[id];
			}
		};
		this.port.start();
		this.port.addEventListener('message', this.handleMessage);
	}

	/**
	 * @returns {ReadonlyMap<string, MgrAudioParam>}
	 */
	get parameters() {
		// @ts-ignore
		return super.parameters;
	}

	get moduleId() {
		return this.module.moduleId;
	}

	async initialize() {
		/** @type {ReturnType<ParamMgrCallToProcessor['getBuffer']>} */
		const response = await this.call('getBuffer');
		const { lock, paramsBuffer } = response;
		this.$lock = lock;
		this.$paramsBuffer = paramsBuffer;
		const offset = 1;
		Object.entries(this.internalParamsConfig).forEach(([name, config], i) => {
			if (this.context.state === 'suspended') this.$paramsBuffer[i] = config.defaultValue;
			if (config instanceof AudioParam) {
				try {
					config.automationRate = 'a-rate';
				// eslint-disable-next-line no-empty
				} catch {
				} finally {
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

	/**
	 * @param {ReturnType<ParamMgrCallToProcessor['getBuffer']>} buffer
	 */
	setBuffer({ lock, paramsBuffer }) {
		this.$lock = lock;
		this.$paramsBuffer = paramsBuffer;
	}

	setParamsMapping(paramsMapping) {
		return this.call('setParamsMapping', paramsMapping);
	}

	getCompensationDelay() {
		return this.call('getCompensationDelay');
	}

	getParameterInfo(...parameterIdQuery) {
		return this.call('getParameterInfo', ...parameterIdQuery);
	}

	getParameterValues(normalized, ...parameterIdQuery) {
		return this.call('getParameterValues', normalized, ...parameterIdQuery);
	}

	/**
	 * @param {WamAutomationEvent} event
	 */
	scheduleAutomation(event) {
		const time = event.time || this.context.currentTime;
		const { id, normalized, value } = event.data;
		const audioParam = this.getParam(id);
		if (!audioParam) return;
		if (audioParam.info.type === 'float') {
			if (normalized) audioParam.linearRampToNormalizedValueAtTime(value, time);
			else audioParam.linearRampToValueAtTime(value, time);
		} else {
			// eslint-disable-next-line no-lonely-if
			if (normalized) audioParam.setNormalizedValueAtTime(value, time);
			else audioParam.setValueAtTime(value, time);
		}
	}

	/**
	 * @param {WamEvent[]} events
	 */
	scheduleEvents(...events) {
		events.forEach((event) => {
			if (event.type === 'wam-automation') {
				this.scheduleAutomation(event);
			}
		});
		this.call('scheduleEvents', ...events);
	}

	/**
	 * @param {WamEvent[]} events
	 */
	emitEvents(...events) {
		this.call('emitEvents', ...events);
	}

	clearEvents() {
		this.call('clearEvents');
	}

	/**
	 * @param {WamEvent} event
	 */
	dispatchWamEvent(event) {
		if (event.type === 'wam-automation') {
			this.scheduleAutomation(event);
		} else {
			this.dispatchEvent(new CustomEvent(event.type, { detail: event }));
		}
	}

	/**
	 * @param {WamParameterValueMap} parameterValues
	 */
	async setParameterValues(parameterValues) {
		Object.keys(parameterValues).forEach((parameterId) => {
			const parameterUpdate = parameterValues[parameterId];
			const parameter = this.parameters.get(parameterId);
			if (!parameter) return;
			if (!parameterUpdate.normalized) parameter.value = parameterUpdate.value;
			else parameter.normalizedValue = parameterUpdate.value;
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

	/**
	 * @param {string} name
	 */
	requestDispatchIParamChange = (name) => {
		const config = this.internalParamsConfig[name];
		if (!('onChange' in config)) return;
		const { automationRate, onChange } = config;
		if (typeof automationRate !== 'number' || !automationRate) return;
		const interval = 1000 / automationRate;
		const i = this.internalParams.indexOf(name);
		if (i === -1) return;
		if (i >= this.internalParams.length) return;
		if (typeof this.paramsUpdateCheckFnRef[i] === 'number') {
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
	}

	/**
	 * @param {string} name
	 */
	getIParamIndex(name) {
		const i = this.internalParams.indexOf(name);
		return i === -1 ? null : i;
	}

	/**
	 * @param {string} name
	 * @param {AudioParam | AudioNode} dest
	 * @param {number} index
	 */
	connectIParam(name, dest, index) {
		const offset = 1;
		const i = this.getIParamIndex(name);
		if (i !== null) {
			if (dest instanceof AudioNode) {
				if (typeof index === 'number') this.connect(dest, offset + i, index);
				else this.connect(dest, offset + i);
			} else {
				this.connect(dest, offset + i);
			}
		}
	}

	/**
	 * @param {string} name
	 * @param {AudioParam | AudioNode} dest
	 * @param {number} index
	 */
	disconnectIParam(name, dest, index) {
		const offset = 1;
		const i = this.getIParamIndex(name);
		if (i !== null) {
			if (dest instanceof AudioNode) {
				if (typeof index === 'number') this.disconnect(dest, offset + i, index);
				else this.disconnect(dest, offset + i);
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
		/** @type {Record<string, number>} */
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
		// @ts-ignore
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
		/** @type {Record<string, number>} */
		const values = {};
		this.parameters.forEach((v, k) => {
			values[k] = v.value;
		});
		return values;
	}

	/**
	 * @param {Record<string, number>} values
	 */
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

	/**
	 * @param {string} toId
	 * @param {number} [output]
	 */
	connectEvents(toId, output) {
		this.call('connectEvents', toId, output);
	}

	/**
	 * @param {string} [toId]
	 * @param {number} [output]
	 */
	disconnectEvents(toId, output) {
		this.call('disconnectEvents', toId, output);
	}

	async destroy() {
		this.disconnect();
		this.paramsUpdateCheckFnRef.forEach((ref) => {
			if (typeof ref === 'number') window.clearTimeout(ref);
		});
		await this.call('destroy');
		this.port.close();
	}
}

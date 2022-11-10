/** @typedef {import('@webaudiomodules/api').WamNode} WamNode */
/** @typedef {import('@webaudiomodules/api').WebAudioModule} WebAudioModule */

/**
 * @implements {WamNode}
 */
export default class CompositeAudioNode extends GainNode {
	get groupId() {
		return this.module.groupId;
	}

	get moduleId() {
		return this.module.moduleId;
	}

	get instanceId() {
		return this.module.instanceId;
	}

	get module() {
		return this._wamNode.module;
	}

	/**
	 * @param {Parameters<WamNode['addEventListener']>} args
	 */
	addEventListener(...args) {
		return this._wamNode.addEventListener(...args);
	}

	/**
	 * @param {Parameters<WamNode['removeEventListener']>} args
	 */
	removeEventListener(...args) {
		return this._wamNode.removeEventListener(...args);
	}

	/**
	 * @param {Parameters<WamNode['dispatchEvent']>} args
	 */
    dispatchEvent(...args) {
		return this._wamNode.dispatchEvent(...args);
	}

	/**
	 * @param {Parameters<WamNode['getParameterInfo']>} args
	 */
	getParameterInfo(...args) {
		return this._wamNode.getParameterInfo(...args);
	}

	/**
	 * @param {Parameters<WamNode['getParameterValues']>} args
	 */
	getParameterValues(...args) {
		return this._wamNode.getParameterValues(...args);
	}

	/**
	 * @param {Parameters<WamNode['setParameterValues']>} args
	 */
	setParameterValues(...args) {
		return this._wamNode.setParameterValues(...args);
	}

	getState() {
		return this._wamNode.getState();
	}

	/**
	 * @param {Parameters<WamNode['setState']>} args
	 */
	setState(...args) {
		return this._wamNode.setState(...args);
	}

	getCompensationDelay() {
		return this._wamNode.getCompensationDelay();
	}

	/**
	 * @param {Parameters<WamNode['scheduleEvents']>} args
	 */
	scheduleEvents(...args) {
		return this._wamNode.scheduleEvents(...args);
	}

	clearEvents() {
		return this._wamNode.clearEvents();
	}

	/**
	 * @param {Parameters<WamNode['connectEvents']>} args
	 */
	connectEvents(...args) {
		return this._wamNode.connectEvents(...args);
	}

	/**
	 * @param {Parameters<WamNode['disconnectEvents']>} args
	 */
	disconnectEvents(...args) {
		return this._wamNode.disconnectEvents(...args);
	}

	destroy() {
		return this._wamNode.destroy();
	}

	/**
	 * @type {AudioNode}
	 */
	_output = undefined;

	/**
	 * @type {WamNode}
	 */
	_wamNode = undefined;

	set channelCount(count) {
		if (this._output) this._output.channelCount = count;
		else super.channelCount = count;
	}

	get channelCount() {
		if (this._output) return this._output.channelCount;
		return super.channelCount;
	}

	set channelCountMode(mode) {
		if (this._output) this._output.channelCountMode = mode;
		else super.channelCountMode = mode;
	}

	get channelCountMode() {
		if (this._output) return this._output.channelCountMode;
		return super.channelCountMode;
	}

	set channelInterpretation(interpretation) {
		if (this._output) this._output.channelInterpretation = interpretation;
		else super.channelInterpretation = interpretation;
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
		return undefined;
	}

	connect(...args) {
		// @ts-ignore
		if (this._output && this._output !== this) return this._output.connect(...args);
		// @ts-ignore
		return super.connect(...args);
	}

	disconnect(...args) {
		// @ts-ignore
		if (this._output && this._output !== this) return this._output.disconnect(...args);
		// @ts-ignore
		return super.disconnect(...args);
	}
}

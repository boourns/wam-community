/** @typedef {import('@webaudiomodules/api').WamDescriptor} WamDescriptor */
/** @typedef {import('@webaudiomodules/api').WamNode} WamNode */
/** @template T @typedef {import('@webaudiomodules/api').WebAudioModule} IWebAudioModule<T> */

/** @implements {IWebAudioModule<WamNode>} */
class WebAudioModule {
	static get isWebAudioModuleConstructor() {
		return true;
	}

	/**
	 * @param {string} groupId
	 * @param {BaseAudioContext} audioContext
	 * @param {any} [initialState]
	 * @returns {Promise<IWebAudioModule<any>>}
	 */
	static createInstance(groupId, audioContext, initialState) {
		return new this(groupId, audioContext).initialize(initialState);
	}

	/** 
	 * @param {string} groupId
	 * @param {BaseAudioContext} audioContext 
	 */
	constructor(groupId, audioContext) {
		this._groupId = groupId;
		this._audioContext = audioContext;
		this._initialized = false;
		/** @type {WamNode} */
		this._audioNode = undefined;
		this._timestamp = performance.now();
		/**
		 * Url to load the plugin's GUI HTML
		 * @type {string}
		 */
		this._guiModuleUrl = undefined;
		/**
		 * Url to load the plugin's `descriptor.json`
		 * @type {string}
		 */
		this._descriptorUrl = './descriptor.json';
		/** @type {WamDescriptor} */
		this._descriptor = {
			name: `WebAudioModule_${this.constructor.name}`,
			vendor: 'WebAudioModuleVendor',
			description: '',
			version: '0.0.0',
			apiVersion: '2.0.0',
			thumbnail: '',
			keywords: [],
			isInstrument: false,
			website: '',
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
			hasSysexOutput: true,
		};
	}

	get isWebAudioModule() {
		return true;
	}

	get groupId() { return this._groupId; }

	get moduleId() { return this.vendor + this.name; }

	get instanceId() { return this.moduleId + this._timestamp; }

	get descriptor() { return this._descriptor; }

	get name() { return this.descriptor.name; }

	get vendor() { return this.descriptor.vendor; }

	get audioContext() {
		return this._audioContext;
	}

	get audioNode() {
		if (!this.initialized) console.warn('WAM should be initialized before getting the audioNode');
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

	/**
	 * @param {any} [initialState]
	 * @returns {Promise<WamNode>}
	 */
	async createAudioNode(initialState) {
		// should return a subclass of WamNode
		throw new TypeError('createAudioNode() not provided');
	}

	/**
	 * @param {any} [state]
	 * @returns {Promise<WebAudioModule>}
	 */
	async initialize(state) {
		// await this._loadDescriptor();
		if (!this._audioNode) this.audioNode = await this.createAudioNode();
		this.initialized = true;
		return this;
	}

	async _loadGui() {
		const url = this._guiModuleUrl;
		if (!url) throw new TypeError('Gui module not found');
		// @ts-ignore
		return import(/* webpackIgnore: true */url);
	}

	async _loadDescriptor() {
		const url = this._descriptorUrl;
		if (!url) throw new TypeError('Descriptor not found');
		const response = await fetch(url);
		const descriptor = await response.json();
		Object.assign(this._descriptor, descriptor);
		return this._descriptor;
	}

	/**
	 * @returns {Promise<HTMLElement>}
	 */
	async createGui() {
		if (!this.initialized) console.warn('Plugin should be initialized before getting the gui');
		// Do not fail if no gui is present, just return undefined
		if (!this._guiModuleUrl) return undefined;
		const { createElement } = await this._loadGui();
		return createElement(this);
	}

	destroyGui() {}
}

export default WebAudioModule;

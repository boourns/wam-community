import AutomationTrack from './AutomationTrack.js';

const player = document.querySelector('#player');
const mount = document.querySelector('#mount');

const main = document.querySelector('main');
const saveState = document.getElementById('save');
const restoreState = document.getElementById('restore');
const deleteState = document.getElementById('delete');
const inCache = document.getElementById('inCache');
const automationSelector = document.getElementById('param-select');
const download = document.getElementById('download');
const upload = document.getElementById('upload');
const input = document.getElementById('upload-input');
const automationAll = document.getElementById('automation-all');

inCache.setAttribute('data', localStorage.getItem('instanceState') != null);

// Safari...
const AudioContext =
	window.AudioContext || // Default
	window.webkitAudioContext || // Safari and old versions of Chrome
	false;

const audioContext = new AudioContext({ latencyHint: 'playback' });
const mediaElementSource = audioContext.createMediaElementSource(player);

// Very simple function to connect the plugin audionode to the host
const connectPlugin = (audioNode) => {
	mediaElementSource.connect(audioNode);
	audioNode.connect(audioContext.destination);
};

// Very simple function to append the plugin root dom node to the host
const mountPlugin = (domNode) => {
	mount.innerHtml = '';
	mount.appendChild(domNode);
};

(async () => {
	// Init WamEnv
	const { default: initializeWamHost } = await import(
		'../sdk/src/initializeWamHost.js'
	);
	const [hostGroupId] = await initializeWamHost(audioContext);

	// Import WAM
	const { default: WAM } = await import('./src/index.js');
	// Create a new instance of the plugin
	// You can can optionnally give more options such as the initial state of the plugin
	const instance = await WAM.createInstance(hostGroupId, audioContext);

	window.instance = instance;

	// Connect the audionode to the host
	connectPlugin(instance.audioNode);

	// Load the GUI if need (ie. if the option noGui was set to true)
	// And calls the method createElement of the Gui module
	const pluginDomNode = await instance.createGui();

	mountPlugin(pluginDomNode);

	player.onplay = () => {
		audioContext.resume(); // audio context must be resumed because browser restrictions
	};

	//State

	saveState.addEventListener('click', async () => {
		let state = await instance.audioNode.getState();
		localStorage.setItem('instanceState', JSON.stringify(state));
		inCache.setAttribute('data', true);
	});

	restoreState.addEventListener('click', async () => {
		let state = localStorage.getItem('instanceState');
		if (state) {
			await instance.audioNode.setState(JSON.parse(state));
		}
	});

	deleteState.addEventListener('click', async () => {
		localStorage.removeItem('instanceState');
		inCache.setAttribute('data', false);
	});

	download.addEventListener('click', async () => {
		let state = await instance.audioNode.getState();
		const blob = new Blob([JSON.stringify(state, undefined, 2)]);
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = 'PedalBoard-State.json';
		link.click();
	});

	upload.addEventListener('click', () => {
		input.click();
	});

	input.addEventListener('change', (e) => {
		let files = input.files;
		if (files.length > 0 && files[0].type == 'application/json') {
			try {
				var fr = new FileReader();
				fr.onload = async () => {
					await instance.audioNode.setState(JSON.parse(fr.result));
				};
				fr.readAsText(files[0]);
			} catch {
				console.warn('Could not import PedalBoard-State');
			}
		}
	});

	//Automation

	instance.audioNode.addEventListener('wam-info', async () => {
		window.pluginInfos = await instance.audioNode.getParameterInfo();
		let keys = Object.keys(window.pluginInfos);

		automationSelector.innerHTML =
			'<option value="">Add Automation...</option>';
		for (let key of keys) {
			let info = window.pluginInfos[key];
			let option = document.createElement('option');
			option.value = key;
			option.innerHTML = `${key} ➤ ${info.minValue} - ${info.maxValue}`;
			automationSelector.appendChild(option);
		}

		let useless = [];
		for (let track of document.querySelectorAll('automation-track')) {
			if (window.pluginInfos[track.paramId]?.nodeId != track.param.nodeId)
				useless.push(track);
		}
		useless.forEach((track) => track.remove());
	});

	automationSelector.addEventListener('input', (e) => {
		const paramId = e.target.value;
		const param = window.pluginInfos[paramId];
		if (param && !param.track) {
			param.track = true;
			main.appendChild(new AutomationTrack(paramId, param));
		}
	});

	automationAll.addEventListener('click', () => {
		window.instance.audioNode.clearEvents();
		for (let track of document.querySelectorAll('automation-track')) {
			track.scheduleEvents(false);
		}
	});
})();

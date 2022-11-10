import { WamProcessor, AudioWorkletGlobalScope as IAudioWorkletGlobalScope } from '@webaudiomodules/api';

export interface TypedAudioWorkletNodeOptions<T = any> extends AudioWorkletNodeOptions {
	processorOptions?: T;
}
export interface TypedMessageEvent<T = any> extends MessageEvent {
	data: T;
}
export interface TypedMessagePortEventMap<T = any> extends MessagePortEventMap {
	'message': TypedMessageEvent<T>;
}

export interface TypedEventListener<EventDetail = any> {
	(evt: CustomEvent<EventDetail>): void;
}

export interface TypedEventListenerObject<EventDetail = any> {
	handleEvent(evt: CustomEvent<EventDetail>): void;
}

export type TypedEventListenerOrEventListenerObject<EventDetail = any> = TypedEventListener<EventDetail> | TypedEventListenerObject<EventDetail>;

export interface TypedEventTarget<EventMap extends Record<string, any> = any> extends EventTarget {
	addEventListener<K extends keyof EventMap>(type: K, listener: TypedEventListenerOrEventListenerObject<EventMap[K]> | null, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
	dispatchEvent(event: Event): boolean;
	removeEventListener<K extends keyof EventMap>(type: K, listener: TypedEventListenerOrEventListenerObject<EventMap[K]> | null, options?: EventListenerOptions | boolean): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export interface TypedMessagePort<In = any, Out = any> extends MessagePort {
	onmessage: ((this: TypedMessagePort<In, Out>, ev: TypedMessageEvent<In>) => any) | null;
	onmessageerror: ((this: TypedMessagePort<In, Out>, ev: TypedMessageEvent<In>) => any) | null;
	postMessage(message: Out, transfer: Transferable[]): void;
	postMessage(message: Out, options?: StructuredSerializeOptions): void;
	addEventListener<K extends keyof TypedMessagePortEventMap<In>>(type: K, listener: (this: MessagePort, ev: TypedMessagePortEventMap<In>[K]) => any, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
	removeEventListener<K extends keyof TypedMessagePortEventMap<In>>(type: K, listener: (this: MessagePort, ev: TypedMessagePortEventMap<In>[K]) => any, options?: boolean | EventListenerOptions): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export interface AudioParamDescriptor {
	automationRate?: AutomationRate;
	defaultValue?: number;
	maxValue?: number;
	minValue?: number;
	name: string;
}
export interface TypedAudioParamDescriptor<Par extends string = string> extends AudioParamDescriptor {
	automationRate?: AutomationRate;
	defaultValue?: number;
	maxValue?: number;
	minValue?: number;
	name: Par;
}
export interface TypedAudioWorkletProcessor<MsgIn = any, MsgOut = any, Par extends string = string> {
	port: TypedMessagePort<MsgIn, MsgOut>;
	process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<Par, Float32Array>): boolean;
}
export const TypedAudioWorkletProcessor: {
	parameterDescriptors: TypedAudioParamDescriptor[];
	new <MsgIn = any, MsgOut = any, Par extends string = string>(): TypedAudioWorkletProcessor<MsgIn, MsgOut, Par>;
};

export interface AudioWorkletGlobalScope extends IAudioWorkletGlobalScope {
	AudioWorkletProcessor: typeof TypedAudioWorkletProcessor;
}

export type TypedAudioParamMap<P extends string = string> = ReadonlyMap<P, AudioParam>;

export interface TypedAudioWorkletNode<MsgIn = any, MsgOut = any, Par extends string = string, EventMap extends Record<string, any> = any> extends AudioWorkletNode {
	readonly port: TypedMessagePort<MsgIn, MsgOut>;
	readonly parameters: TypedAudioParamMap<Par>;
	addEventListener<K extends keyof AudioWorkletNodeEventMap>(type: K, listener: (this: AudioWorkletNode, ev: AudioWorkletNodeEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
	addEventListener<K extends keyof EventMap>(type: K, listener: (this: AudioWorkletNode, ev: CustomEvent<EventMap[K]>) => any, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
	removeEventListener<K extends keyof AudioWorkletNodeEventMap>(type: K, listener: (this: AudioWorkletNode, ev: AudioWorkletNodeEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
	removeEventListener<K extends keyof EventMap>(type: K, listener: (this: AudioWorkletNode, ev: CustomEvent<EventMap[K]>) => any, options?: boolean | EventListenerOptions): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export const TypedAudioWorkletNode: {
	prototype: TypedAudioWorkletNode;
	new <MsgIn = any, MsgOut = any, Par extends string = string, EventMap extends Record<string, any> = any, Opt = any>(context: BaseAudioContext, name: string, options?: TypedAudioWorkletNodeOptions<Opt>): TypedAudioWorkletNode<MsgIn, MsgOut, Par, EventMap>;
};

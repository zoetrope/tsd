// Type definitions for chai-fs v0.0.0 assert style
// Project: http://chaijs.com/
// Definitions by: Bart van der Schoor <https://github.com/Bartvds>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

///<reference path="../chai/chai-assert.d.ts" />

declare module Chai {
	export interface Assert {
		isFulfilled(promise:any, msg?:string):any;

		becomes(promise:any, value:any, msg?:string):any;
		doesNotBecome(promise:any, value:any, msg?:string):any;

		isRejected(promise:any, msg?:string):any;
		isRejected(promise:any, instanceOf:Function, msg?:string):any;
		isRejected(promise:any, regExp:RegExp, msg?:string):any;

		eventually:Assert;
	}
}

/** @param {NS} ns */

import {HackingOperationController} from "blob:file:///589b5dda-51e0-43f9-9aab-f2f36558eccc"

export class HackController extends HackingOperationController
{
	constructor(
		ns,
		targetServerName)
	{
		super(
			ns,
			targetServerName);

		this.scriptName = '/scripts/export/hack.js';

		this.scriptRAM = ns.getScriptRam(
			this.scriptName,
			'home');	
	}

	getNumOfThreads(numOfCores = 1)
	{
		return Math.ceil(
			this.ns.hackAnalyzeThreads(
				this.targetServerName,
				this.ns.getServerMoneyAvailable(this.targetServerName)));
	}

	getSleepTime()
	{
		return this.ns.getHackTime(this.targetServerName) * 1.1;
	}
}

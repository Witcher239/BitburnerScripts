/** @param {NS} ns */

import {HackingOperationController} from "/scripts/controllers/HackingOperationController.js"

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

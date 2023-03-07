/** @param {NS} ns */

import {HackingOperationController} from "blob:file:///63b3bf40-4f74-4ab7-8fbc-19a091df58e0"

export class WeakenController extends HackingOperationController
{
	constructor(
		ns,
		targetServerName)
	{
		super(
			ns,
			targetServerName);

		this.scriptName = '/scripts/export/weaken.js';

		this.scriptRAM = ns.getScriptRam(
			this.scriptName,
			'home');	
	}

	getNumOfThreadsCoefficient(serverName)
	{
		var numOfThreadsCoefficient;

		if (serverName == 'home')
		{
			numOfThreadsCoefficient = this.getNumOfThreads(this.ns.getServer('home').cpuCores) / this.getNumOfThreads(1);
		}
		else
		{
			numOfThreadsCoefficient = super.getNumOfThreadsCoefficient(serverName);
		}

		return numOfThreadsCoefficient;
	}

	getNumOfThreads(numOfCores = 1)
	{
		var currentSecurityLevel = this.ns.getServerSecurityLevel(this.targetServerName);
		var minSecurityLevel = this.ns.getServerMinSecurityLevel(this.targetServerName);

		return Math.ceil((currentSecurityLevel - minSecurityLevel) / this.ns.weakenAnalyze(numOfCores));
	}

	getSleepTime()
	{
		return this.ns.getWeakenTime(this.targetServerName) * 1.1;
	}
}

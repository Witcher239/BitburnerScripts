/** @param {NS} ns */

import {HackingOperationController} from "/scripts/controllers/HackingOperationController.js"

export class GrowController extends HackingOperationController
{
	constructor(
		ns,
		targetServerName)
	{
		super(
			ns,
			targetServerName);

		this.scriptName = '/scripts/export/grow.js';

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
		var maxMoney = this.ns.getServerMaxMoney(this.targetServerName);
		var currentMoney = this.ns.getServerMoneyAvailable(this.targetServerName);

		if (currentMoney == 0)
		{
			currentMoney = 1;
		}

		var growthMultiplier = maxMoney / currentMoney;

		return Math.ceil(
			this.ns.growthAnalyze(
				this.targetServerName,
				growthMultiplier,
				numOfCores));
	}

	getSleepTime()
	{
		return this.ns.getGrowTime(this.targetServerName) * 1.1;
	}
}

import { NS } from '@ns';

import { Manager } from "scripts/managers/Manager";

import { WeakenController } from "scripts/controllers/WeakenController";
import { GrowController } from "scripts/controllers/GrowController";
import { HackController } from "scripts/controllers/HackController";

export async function main(ns: NS)
{
	var targetServerName = ns.args[0].toString();

	var hackingManager = new HackingManager(
		ns,
		targetServerName);

	await hackingManager.startOperation();
}

export class HackingManager extends Manager
{
	targetServerName = '';

	minSecurityLevel = 0;
	acceptableSecurityLevelDifferencePercentage = 5;

	maxMoney = 0;
	acceptableMoneyDifferencePercentage = 5;

	constructor(
		ns: NS,
		targetServerName: string)
	{
		super(ns);

		this.waitTime = 0;

		this.targetServerName = targetServerName;
	}

	validate()
	{
		return this.ns.hasRootAccess(this.targetServerName)
			&& this.ns.getServerMaxMoney(this.targetServerName) > 0;
	}

	disableLogs()
	{
		this.ns.disableLog('scan');
		this.ns.disableLog('scp');
		this.ns.disableLog('hasRootAccess');
		this.ns.disableLog('getServerMaxRam');
		this.ns.disableLog('getServerUsedRam');
	}

	init()
	{
		this.minSecurityLevel = this.ns.getServerMinSecurityLevel(this.targetServerName);
		this.maxMoney = this.ns.getServerMaxMoney(this.targetServerName);	
	}

	async manage()
	{
		var couldRunOperation = false;

		if (this.ns.getServerSecurityLevel(this.targetServerName) > this.minSecurityLevel * ((100 + this.acceptableSecurityLevelDifferencePercentage) / 100))
		{
			var weakenController = new WeakenController(
				this.ns,
				this.targetServerName);

			couldRunOperation = await weakenController.startOperation();
		}
		else if (this.ns.getServerMoneyAvailable(this.targetServerName) < this.maxMoney * ((100 - this.acceptableMoneyDifferencePercentage) / 100))
		{
			var growController = new GrowController(
				this.ns,
				this.targetServerName);

			couldRunOperation = await growController.startOperation();
		}
		else
		{
			var hackController = new HackController(
				this.ns,
				this.targetServerName);

			couldRunOperation = await hackController.startOperation();
		}

		if (!couldRunOperation)
		{
			await this.ns.sleep(10000); 
		}
	}
}

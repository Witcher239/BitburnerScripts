/** @param {NS} ns */

import {Manager} from "blob:file:///1b501ff8-9934-4796-82f6-ad89d4aa647a"

import {WeakenController} from "blob:file:///3f7fd2ed-cb40-40f6-b7a2-006f6fa9bacf"
import {GrowController} from "blob:file:///f92ff8e0-d2e6-43fe-acaa-3c9f4859a6db"
import {HackController} from "blob:file:///c420a3b2-e2b4-4d24-9d37-0bef0de644c9"

export async function main(ns)
{
	var targetServerName = ns.args[0];

	var hackingManager = new HackingManager(
		ns,
		targetServerName);

	await hackingManager.startOperation();
}

export class HackingManager extends Manager
{
	targetServerName = '';

	minSecurityLevel = 0;
	acceptableSecurityLevelDifference = 0;

	maxMoney = 0;
	acceptableMoneyLevelPercentage = 100;

	constructor(
		ns,
		targetServerName)
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

		if (this.ns.getServerSecurityLevel(this.targetServerName) > this.minSecurityLevel + this.acceptableSecurityLevelDifference)
		{
			var weakenController = new WeakenController(
				this.ns,
				this.targetServerName);

			couldRunOperation = await weakenController.startOperation();
		}
		else if (this.ns.getServerMoneyAvailable(this.targetServerName) < this.maxMoney * (this.acceptableMoneyLevelPercentage / 100))
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

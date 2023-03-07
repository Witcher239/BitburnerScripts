/**@param {NS} ns**/

import {Manager} from "blob:file:///3ce62d30-3508-464d-93f0-f2c9d8d36e50"

import {UpgradeHacknetNodeService} from "blob:file:///791d2233-ce8a-4c60-889e-2f1f8409712c"

export async function main(ns)
{
	var hacknetManager = new HacknetManager(ns);

	await hacknetManager.startOperation();
}

export class HacknetManager extends Manager
{
	fractionOfMoneyForHacknetUpgrades = 0.001;

	targetRevenueTime = 10800;

	newHacknetNodeTargetRevenueTimeProduction = 0;

	moneyForHacknetUpgrades = 0;

	constructor(ns)
	{
		super(ns);
	}

	disableLogs()
	{
		this.ns.disableLog('getHacknetMultipliers');
		this.ns.disableLog('getServerMoneyAvailable');
		this.ns.disableLog('hacknet.numNodes');
		this.ns.disableLog('hacknet.getPurchaseNodeCost');
		this.ns.disableLog('getHacknetMultipliers');
		this.ns.disableLog('hacknet.getNodeStats');
		this.ns.disableLog('hacknet.getLevelUpgradeCost');
		this.ns.disableLog('hacknet.getRamUpgradeCost');
		this.ns.disableLog('hacknet.getCoreUpgradeCost');
	}

	init()
	{
		this.newHacknetNodeTargetRevenueTimeProduction = 1.5 * this.ns.getHacknetMultipliers().production * this.targetRevenueTime;
	}

	async manage()
	{
		this.updateInfo();

		this.upgradeExistingHacknetNodes();

		this.purchaseAndUpgradeNewHacknetNodes();
	}

	updateInfo()
	{
		this.moneyForHacknetUpgrades = this.ns.getServerMoneyAvailable(this.ns.getHostname()) * this.fractionOfMoneyForHacknetUpgrades;
	}

	upgradeExistingHacknetNodes()
	{
		var numOfNodes = this.ns.hacknet.numNodes();

		for (var i = 0; i < numOfNodes; i++)
		{
			this.upgradeHacknetNode(i);
		}
	}

	purchaseAndUpgradeNewHacknetNodes()
	{
		var purchaseNodeCost = this.ns.hacknet.getPurchaseNodeCost();

		while (purchaseNodeCost <= this.moneyForHacknetUpgrades
			   && purchaseNodeCost <= this.newHacknetNodeTargetRevenueTimeProduction)
		{
			var hacknetNodeIndex = this.ns.hacknet.purchaseNode();

			if (hacknetNodeIndex != -1)
			{
				this.ns.print(
					'Hacknet node with index "'
					+ hacknetNodeIndex
					+ '" has been purchased');

				this.upgradeHacknetNode(hacknetNodeIndex);
			}

			purchaseNodeCost = this.ns.hacknet.getPurchaseNodeCost();
		}
	}

	upgradeHacknetNode(hacknetNodeIndex)
	{
		var upgradeHacknetNodeService = new UpgradeHacknetNodeService(
			this.ns,
			hacknetNodeIndex,
			this.moneyForHacknetUpgrades,
			this.targetRevenueTime);

		upgradeHacknetNodeService.startOperation();

		this.moneyForHacknetUpgrades = upgradeHacknetNodeService.remainingMoneyForUpgrades;
	}
}

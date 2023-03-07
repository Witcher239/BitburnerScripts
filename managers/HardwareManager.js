/**@param {NS} ns**/

import {Manager} from "blob:file:///8663cb29-e98b-4f4e-8f61-7e5ad2eb208b"

import {getPurchasedServerNames} from "blob:file:///7d4eea69-2dea-45fc-9784-23001312ebad"

export async function main(ns)
{
	var hardwareManager = new HardwareManager(ns);

	await hardwareManager.startOperation();
}

export class HardwareManager extends Manager
{
	fractionOfMoneyForHardwareUpgrades = 0.001;

	torRouter = false;

	serverNames = [];

	upgradableServerNames = [];

	moneyForHardwareUpgrades = 0;

	newServerCost = 0;

	constructor(ns)
	{
		super(ns);
	}

	disableLogs()
	{
		this.ns.disableLog('scan');
		this.ns.disableLog('getPurchasedServerCost');
		this.ns.disableLog('getServerMoneyAvailable');
		this.ns.disableLog('getHostname');
		this.ns.disableLog('getServerMaxRam');
		this.ns.disableLog('getPurchasedServerMaxRam');
		this.ns.disableLog('hasTorRouter');
		this.ns.disableLog('serverExists');
		this.ns.disableLog('getPurchasedServerUpgradeCost');
		this.ns.disableLog('upgradePurchasedServer');
	}

	init()
	{
		this.newServerCost = this.ns.getPurchasedServerCost(2);
	}

	async manage()
	{
		this.updateInfo();

		this.buyTorRouter();

		this.buyServers();

		this.upgradeServers();
	}

	updateInfo()
	{
		this.moneyForHardwareUpgrades = this.ns.getServerMoneyAvailable(this.ns.getHostname()) * this.fractionOfMoneyForHardwareUpgrades;

		var serverNamesUpdated = false;

		if (this.serverNames.length != 25)
		{
			var numOfServerNames = this.serverNames.length;

			this.serverNames = getPurchasedServerNames(this.ns);

			serverNamesUpdated = numOfServerNames != this.serverNames.length;
		}

		if (serverNamesUpdated
			|| this.upgradableServerNames.length > 0)
		{
			var newUpgradableServerNames = [];

			for (var i = 0; i < this.serverNames.length; i++)
			{
				var serverName = this.serverNames[i];

				if (this.ns.getServerMaxRam(serverName) < this.ns.getPurchasedServerMaxRam())
				{
					newUpgradableServerNames.push(serverName);
				}
			}

			this.upgradableServerNames = newUpgradableServerNames;
		}

		if (!this.torRouter
			&& this.ns.hasTorRouter())
		{
			this.torRouter = true;
		}
	}

	buyTorRouter()
	{
		if (!this.torRouter
			&& this.moneyForHardwareUpgrades > 0)
		{
			//TODO Singularity
		}
	}

	buyServers()
	{
		while (this.serverNames.length != 25
			   && this.newServerCost < this.moneyForHardwareUpgrades)
		{
			var newServerName = this.generateServerName();

			this.ns.purchaseServer(
				newServerName,
				2);

			this.serverNames.push(newServerName);

			this.upgradableServerNames.push(newServerName);

			this.moneyForHardwareUpgrades -= this.newServerCost;
		}
	}

	generateServerName()
	{
		var serverName = '';

		var number = 1;

		while (serverName == '')
		{
			var serverNameForNumber = this.getServerNameForNumber(number);

			if (this.ns.serverExists(serverNameForNumber))
			{
				number++;
			}
			else
			{
				serverName = serverNameForNumber;
			}
		}

		return serverName;
	}

	getServerNameForNumber(number)
	{
		var prefix = number < 10 ?
			'hack0' :
			'hack';

		return prefix + number;
	}

	upgradeServers()
	{
		for (var i = 0; i < this.upgradableServerNames.length; i++)
		{
			this.upgradeServer(this.upgradableServerNames[i]);
		}
	}

	upgradeServer(serverName)
	{
		var mustTryToUpgradeMore = true;

		while (mustTryToUpgradeMore)
		{
			var newRAM = this.ns.getServerMaxRam(serverName) * 2;

			var upgradeCost = this.ns.getPurchasedServerUpgradeCost(
				serverName,
				newRAM);

			if (upgradeCost < this.moneyForHardwareUpgrades
				&& this.ns.upgradePurchasedServer(
						serverName,
						newRAM))
			{
				this.moneyForHardwareUpgrades -= upgradeCost;

				this.ns.print(
					'Server '
					+ serverName
					+ ' has been upgraded to '
					+ this.ns.formatRam(newRAM)
					+ ' RAM for '
					+ this.ns.formatNumber(upgradeCost));
			}
			else
			{
				mustTryToUpgradeMore = false;
			}
		}
	}

	shouldStopOperation()
	{
		return this.torRouter
			&& this.serverNames.length == 25
			&& this.upgradableServerNames.length == 0;
	}
}

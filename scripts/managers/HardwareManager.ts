import { NS } from '@ns';

import { Manager } from "scripts/managers/Manager";

import { getPurchasedServerNames } from "scripts/util/util";

export async function main(ns: NS)
{
	var hardwareManager = new HardwareManager(ns);
	
	await hardwareManager.startOperation();
}

export class HardwareManager extends Manager
{
	fractionOfMoneyForHomeServerUpgrades = 0.9;
	fractionOfMoneyForTorRouter = 0.1;
	fractionOfMoneyForServersPurchases = 0.1;
	fractionOfMoneyForServersUpgrades = 0.01;

	torRouter = false;

	serverNames: string[] = [];

	upgradableServerNames: string[] = [];

	moneyForHomeServerUpgrades = 0;
	moneyForTorRouter = 0;
	moneyForServersPurchases = 0;
	moneyForServersUpgrades = 0;

	newServerCost = 0;

	constructor(ns: NS)
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

		this.upgradeHomeServer();

		this.buyTorRouter();

		this.buyServers();

		this.upgradeServers();
	}

	updateInfo()
	{
		this.waitTime = 60000;

		this.moneyForHomeServerUpgrades = this.ns.getServerMoneyAvailable('home') * this.fractionOfMoneyForHomeServerUpgrades;
		this.moneyForTorRouter = this.ns.getServerMoneyAvailable('home') * this.fractionOfMoneyForTorRouter;
		this.moneyForServersPurchases = this.ns.getServerMoneyAvailable('home') * this.fractionOfMoneyForServersPurchases;
		this.moneyForServersUpgrades = this.ns.getServerMoneyAvailable('home') * this.fractionOfMoneyForServersUpgrades;

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
			var newUpgradableServerNames: string[] = [];

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

	upgradeHomeServer()
	{
		var mustTryToUpgradeMore = true;

		while (mustTryToUpgradeMore)
		{
			mustTryToUpgradeMore = this.upgradeHomeServerRam();

			mustTryToUpgradeMore =
				this.upgradeHomeServerCores()
				|| mustTryToUpgradeMore;
		}
	}

	upgradeHomeServerRam()
	{
		var upgraded = false;

		var upgradeCost = this.ns.singularity.getUpgradeHomeRamCost();

		if (upgradeCost <= this.moneyForHomeServerUpgrades
				&& this.ns.singularity.upgradeHomeRam())
		{
			this.moneyForHomeServerUpgrades -= upgradeCost;

			this.ns.print(
				'Home server RAM has been upgraded to '
				+ this.ns.formatRam(this.ns.getServerMaxRam('home'))
				+ ' for '
				+ this.ns.formatNumber(upgradeCost));

			this.waitTime = 1000;

			upgraded = true;
		}

		return upgraded;
	}

	upgradeHomeServerCores()
	{
		var upgraded = false;

		var upgradeCost = this.ns.singularity.getUpgradeHomeCoresCost();

		if (upgradeCost <= this.moneyForHomeServerUpgrades
				&& this.ns.singularity.upgradeHomeCores())
		{
			this.moneyForHomeServerUpgrades -= upgradeCost;

			this.ns.print(
				'Home server cores have been upgraded to '
				+ this.ns.getServer('home').cpuCores
				+ ' for '
				+ this.ns.formatNumber(upgradeCost));

			this.waitTime = 1000;

			upgraded = true;
		}

		return upgraded;
	}

	buyTorRouter()
	{
		if (!this.torRouter
			&& this.moneyForTorRouter > 200000)
		{
			this.ns.singularity.purchaseTor();
		}
	}

	buyServers()
	{
		while (this.serverNames.length != 25
			   && this.newServerCost < this.moneyForServersPurchases)
		{
			var newServerName = this.generateServerName();

			this.ns.purchaseServer(
				newServerName,
				2);

			this.serverNames.push(newServerName);

			this.upgradableServerNames.push(newServerName);

			this.moneyForServersPurchases -= this.newServerCost;

			this.waitTime = 1000;
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

	getServerNameForNumber(number: number)
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

	upgradeServer(serverName: string)
	{
		var mustTryToUpgradeMore = true;

		while (mustTryToUpgradeMore)
		{
			var newRAM = this.ns.getServerMaxRam(serverName) * 2;

			var upgradeCost = this.ns.getPurchasedServerUpgradeCost(
				serverName,
				newRAM);

			if (upgradeCost <= this.moneyForServersUpgrades
				&& this.ns.upgradePurchasedServer(
						serverName,
						newRAM))
			{
				this.moneyForServersUpgrades -= upgradeCost;

				this.ns.print(
					'Server '
					+ serverName
					+ ' has been upgraded to '
					+ this.ns.formatRam(newRAM)
					+ ' RAM for '
					+ this.ns.formatNumber(upgradeCost));

				this.waitTime = 1000;
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

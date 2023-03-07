/** @param {NS} ns */

import {Manager} from "blob:file:///d2d15847-5e52-40bc-a806-84cfd04f40f2"

import {getAllServerNames} from "blob:file:///5aba5048-dc18-4fd3-908e-597d79dd49c4"
import {executeOnRemoteServer} from "blob:file:///a6de1244-facb-4f26-bf71-d9bcfe4fc288"

export async function main(ns)
{
	var deploymentManager = new DeploymentManager(ns);

	await deploymentManager.startOperation();
}

export class DeploymentManager extends Manager
{
	serverNames = [];

	constructor(ns)
	{
		super(ns);
	}

	disableLogs()
	{
		this.ns.disableLog('isRunning');
		this.ns.disableLog('getHostname');
		this.ns.disableLog('hasRootAccess');
		this.ns.disableLog('getServerMaxMoney');
		this.ns.disableLog('scan');
		this.ns.disableLog('scp');
		this.ns.disableLog('getServerMaxRam');
		this.ns.disableLog('getServerUsedRam');
	}

	init()
	{
		this.serverNames = getAllServerNames(this.ns);
	}

	async manage()
	{
		await this.deployAccessManager();

		await this.deployHardwareManager();

		await this.deployHacknetManager();

		if (this.canDeployContractManager())
		{
			await this.deployContractManager();
		}

		if (this.canDeployGangManager())
		{
			await this.deployGangManager();
		}

		for (var i = 0; i < this.serverNames.length; i++)
		{
			var serverName = this.serverNames[i];

			if (this.canDeployHackingManager(serverName))
			{
				await this.deployHackingManager(serverName);
			}
		}
	}

	async deployAccessManager()
	{
		if (!this.ns.isRunning(
				'/scripts/managers/AccessManager.js',
				this.ns.getHostname()))
		{
			await executeOnRemoteServer(
				this.ns,
				'/scripts/managers/AccessManager.js',
				this.ns.getHostname(),
				1);
		}
	}

	async deployHardwareManager()
	{
		if (!this.ns.isRunning(
				'/scripts/managers/HardwareManager.js',
				this.ns.getHostname()))
		{
			await executeOnRemoteServer(
				this.ns,
				'/scripts/managers/HardwareManager.js',
				this.ns.getHostname(),
				1);
		}
	}

	async deployHacknetManager()
	{
		if (!this.ns.isRunning(
				'/scripts/managers/HacknetManager.js',
				this.ns.getHostname()))
		{
			await executeOnRemoteServer(
				this.ns,
				'/scripts/managers/HacknetManager.js',
				this.ns.getHostname(),
				1);
		}
	}

	canDeployContractManager()
	{
		return this.ns.getServerMaxRam(this.ns.getHostname()) >= 256;
	}

	async deployContractManager()
	{
		if (!this.ns.isRunning(
				'/scripts/managers/ContractManager.js',
				this.ns.getHostname()))
		{
			await executeOnRemoteServer(
				this.ns,
				'/scripts/managers/ContractManager.js',
				this.ns.getHostname(),
				1);
		}
	}

	canDeployGangManager()
	{
		return this.ns.gang.inGang()
			&& this.ns.getServerMaxRam(this.ns.getHostname()) >= 256;
	}

	async deployGangManager()
	{
		if (!this.ns.isRunning(
				'/scripts/managers/GangManager.js',
				this.ns.getHostname()))
		{
			await executeOnRemoteServer(
				this.ns,
				'/scripts/managers/GangManager.js',
				this.ns.getHostname(),
				1);
		}
	}

	canDeployHackingManager(targetServerName)
	{
		return this.ns.hasRootAccess(targetServerName)
			&& this.ns.getServerMaxMoney(targetServerName) > 0;
	}

	async deployHackingManager(targetServerName)
	{
		if (!this.ns.isRunning(
				'/scripts/managers/HackingManager.js',
				this.ns.getHostname(),
				targetServerName))
		{
			await executeOnRemoteServer(
				this.ns,
				'/scripts/managers/HackingManager.js',
				this.ns.getHostname(),
				1,
				[targetServerName]);
		}
	}
}

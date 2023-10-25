import { NS } from '@ns';

import { Manager } from "scripts/managers/Manager";

import { getAllServerNames } from "scripts/util/util";
import { executeOnRemoteServer } from "scripts/util/util";

export async function main(ns: NS)
{
	var deploymentManager = new DeploymentManager(ns);

	await deploymentManager.startOperation();
}

export class DeploymentManager extends Manager
{
	serverNames: string[] = [];

	constructor(ns: NS)
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
		this.resetFlags();

		this.serverNames = getAllServerNames(this.ns);
	}

	resetFlags()
	{
		this.ns.write(
			'flags/AllAccessGranted.txt',
			'0',
			'w');
		
		this.ns.write(
			'flags/AllSoftwareInstalled.txt',
			'0',
			'w');
	}

	async manage()
	{
		if (this.canDeployAccessManager())
		{
			await this.deployAccessManager();
		}

		if (this.canDeployHardwareManager())
		{
			await this.deployHardwareManager();
		}

		if (this.canDeploySoftwareManager())
		{
			await this.deploySoftwareManager();
		}

		if (this.canDeployHacknetManager())
		{
			await this.deployHacknetManager();
		}

		if (this.canDeployJobManager())
		{
			await this.deployJobManager();
        }

		if (this.canDeployFactionManager())
		{
			await this.deployFactionManager();
		}

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

	canDeployAccessManager()
	{
		return this.ns.read('flags/AllAccessGranted.txt') == '0';
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

	canDeployHardwareManager()
	{
		return true;
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

	canDeploySoftwareManager()
	{
		return this.ns.hasTorRouter();
	}

	async deploySoftwareManager()
	{
		if (!this.ns.isRunning(
				'/scripts/managers/SoftwareManager.js',
				this.ns.getHostname()))
		{
			await executeOnRemoteServer(
				this.ns,
				'/scripts/managers/SoftwareManager.js',
				this.ns.getHostname(),
				1);
		}
	}

	canDeployHacknetManager()
	{
		return true;
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

	canDeployJobManager()
	{
		return this.ns.getServerMaxRam(this.ns.getHostname()) >= 128;
	}

	async deployJobManager()
	{
		if (!this.ns.isRunning(
				'/scripts/managers/JobManager.js',
				this.ns.getHostname())) {
				await executeOnRemoteServer(
					this.ns,
					'/scripts/managers/JobManager.js',
					this.ns.getHostname(),
					1);
		}
	}

	canDeployFactionManager()
	{
		return this.ns.getServerMaxRam(this.ns.getHostname()) >= 128;
	}

	async deployFactionManager()
	{
		if (!this.ns.isRunning(
				'/scripts/managers/FactionManager.js',
				this.ns.getHostname()))
		{
			await executeOnRemoteServer(
				this.ns,
				'/scripts/managers/FactionManager.js',
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

	canDeployHackingManager(targetServerName: string)
	{
		return this.ns.hasRootAccess(targetServerName)
				&& this.ns.getServerMaxMoney(targetServerName) > 0;
	}

	async deployHackingManager(targetServerName: string)
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

import { NS } from '@ns';

import { Manager } from "scripts/managers/Manager";

import { executeOnRemoteServer } from "scripts/util/util";

export async function main(ns: NS)
{
	var shareManager = new ShareManager(ns);

	await shareManager.startOperation();
}

export class ShareManager extends Manager
{
	ownedServers: string[] = [];

	scriptName = 'scripts/export/share.js';

	scriptRamCost = 0;

	serverReservedRamPercent = 30;

	constructor(ns: NS)
	{
		super(ns);

		this.waitTime = 10000;
	}

	disableLogs()
	{
		this.ns.disableLog('getServerMaxRam');
		this.ns.disableLog('getServerUsedRam');
		this.ns.disableLog('scp');
	}

	init()
	{
		this.scriptRamCost = this.ns.getScriptRam(this.scriptName);
	}

	async manage()
	{
		this.updateInfo();

		if (this.doingWorkForFaction())
		{
			await this.runSharing();
        }
	}

	updateInfo()
	{
		if (this.ownedServers.length != 26)
		{
			this.ownedServers = this.ns.getPurchasedServers();

			this.ownedServers.push('home');
        }
	}

	doingWorkForFaction()
	{
		var currentWork = this.ns.singularity.getCurrentWork();

		return currentWork != null
			&& currentWork.type == 'FACTION';
	}

	async runSharing()
	{
		for (var i = 0; i < this.ownedServers.length; i++)
		{
			var serverName = this.ownedServers[i];

			var availableRam = this.ns.getServerMaxRam(serverName) * ((100 - this.serverReservedRamPercent) / 100) - this.ns.getServerUsedRam(serverName);

			if (availableRam > 0)
			{
				var availableThreads = Math.floor(availableRam / this.scriptRamCost);

				if (availableThreads > 0)
				{
					await executeOnRemoteServer(
						this.ns,
						this.scriptName,
						serverName,
						availableThreads);
                }
            }
        }
    }
}
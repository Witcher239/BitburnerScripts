import { NS } from '@ns';

import { executeOnRemoteServer } from "scripts/util/util";
import { getAllServerNames } from "scripts/util/util";

export class HackingOperationController
{
	ns;

	targetServerName = '';

	scriptName = '';
	scriptRAM = 0;

	homeReservedRAMPercent = 10;

	constructor(
		ns: NS,
		targetServerName: string)
	{
		this.ns = ns;

		this.targetServerName = targetServerName;
	}

	async startOperation()
	{
		var couldRunOperation = false;
		
		var numOfThreadsLeftToRun = this.getNumOfThreads();

		var serverNames = getAllServerNames(this.ns);

		for (var i = 0; i < serverNames.length; i++)
		{
			var serverName = serverNames[i];

			if (serverName != 'home')
			{
				var numOfExecutedThreads = await this.runOperationOnServer(
					serverName,
					numOfThreadsLeftToRun);

				if (numOfExecutedThreads > 0)
				{
					couldRunOperation = true;

					numOfThreadsLeftToRun -= numOfExecutedThreads

					if (numOfThreadsLeftToRun <= 0)
					{
						break;
					}
				}
			}
		}

		if (numOfThreadsLeftToRun > 0)
		{
			var numOfExecutedThreads = await this.runOperationOnServer(
				'home',
				numOfThreadsLeftToRun);

			if (numOfExecutedThreads > 0)
			{
				couldRunOperation = true;
			}
		}

		if (couldRunOperation)
		{
			await this.ns.sleep(this.getSleepTime());
		}

		return couldRunOperation;
	}

	async runOperationOnServer(
		serverName: string,
		numOfThreadsRequired: number)
	{
		var numOfExecutedThreads = 0;

		if (this.ns.hasRootAccess(serverName))
		{
			var serverFreeRAM = this.getServerFreeRAM(serverName);

			if (serverFreeRAM > this.scriptRAM)
			{
				var serverFreeThreads = Math.floor(serverFreeRAM / this.scriptRAM);

				var numOfThreadsCoefficient = this.getNumOfThreadsCoefficient(serverName);

				var numOfThreadsToExecute = Math.min(
					serverFreeThreads,
					Math.ceil(numOfThreadsRequired * numOfThreadsCoefficient));

				if (await executeOnRemoteServer(
							this.ns,
							this.scriptName,
							serverName,
							numOfThreadsToExecute,
							[this.targetServerName]))
				{
					numOfExecutedThreads = numOfThreadsToExecute;
				}
			}
		}

		return numOfExecutedThreads;
	}

	getNumOfThreads(numOfCores = 1)
	{
		return 0;
	}

	getServerFreeRAM(serverName: string)
	{
		var serverFreeRAM = this.ns.getServerMaxRam(serverName) - this.ns.getServerUsedRam(serverName);

		if (serverName == 'home')
		{
			serverFreeRAM *= (100 - this.homeReservedRAMPercent) / 100;
		}

		return serverFreeRAM;
	}

	getNumOfThreadsCoefficient(serverName: string)
	{
		return 1;
	}

	getSleepTime()
	{
		return 0;
	}
}

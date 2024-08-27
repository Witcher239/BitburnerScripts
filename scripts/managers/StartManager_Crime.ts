import { NS } from '@ns';

import { Manager } from "scripts/managers/Manager";

import { executeOnRemoteServer } from "scripts/util/util";

export async function main(ns: NS)
{
	var startManager = new StartManager_Crime(ns);

	await startManager.startOperation();
}

export class StartManager_Crime extends Manager
{
	cyclesTillAccessManagerDeploy = 0;

	targetServerName = 'foodnstuff';

	acceptableNodeUpgradeCost = 1000;

	constructor(ns: NS)
	{
		super(ns);
	}

	disableLogs()
	{
		this.ns.disableLog('getServerMaxRam');
		this.ns.disableLog('getServerUsedRam');
		this.ns.disableLog('scp');
	}

	async manage()
	{
		this.updateInfo();

		if (this.canDeployDeploymentManager())
		{
			this.deployDeploymentManager();
		}
		else
		{
			if (this.cyclesTillAccessManagerDeploy == 0)
			{
				this.undeployHackingManager(this.targetServerName);

				await this.deployAccessManager();

				this.cyclesTillAccessManagerDeploy = 10;
			}
			else
			{
				this.undeployAccessManager();

				await this.deployHackingManager(this.targetServerName);
			}

			this.commitCrime();

			this.upgradeHomeServerRam();

			this.upgradeHacknet();
        }
	}

	updateInfo()
	{
		if (this.cyclesTillAccessManagerDeploy > 0)
		{
			this.cyclesTillAccessManagerDeploy--;
        }
    }

	canDeployDeploymentManager()
	{
		return this.ns.getServerMaxRam(this.ns.getHostname()) >= 64;
	}

	async deployDeploymentManager()
	{
		this.undeployAccessManager();
		this.undeployHackingManager(this.targetServerName);

		this.ns.spawn('/scripts/managers/DeploymentManager.js');
	}

	undeployHackingManager(targetServerName: string)
	{
		if (this.ns.isRunning(
				'/scripts/managers/HackingManager.js',
				this.ns.getHostname(),
				targetServerName))
		{
			this.ns.scriptKill(
				'/scripts/managers/HackingManager.js',
				this.ns.getHostname());
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

	undeployAccessManager()
	{
		if (this.ns.isRunning(
				'/scripts/managers/AccessManager.js',
				this.ns.getHostname()))
		{
			this.ns.scriptKill(
				'/scripts/managers/AccessManager.js',
				this.ns.getHostname());
		}
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

	commitCrime()
	{
		var currentWork = this.ns.singularity.getCurrentWork();

		var committingCrime =
			currentWork != null
			&& currentWork.type == 'CRIME'
			&& currentWork.crimeType == this.ns.enums.CrimeType.robStore;

		if (!committingCrime)
		{
			this.ns.singularity.commitCrime(
				this.ns.enums.CrimeType.robStore,
				true);
		}
	}

	upgradeHomeServerRam()
	{
		var upgraded = false;

		if (this.ns.singularity.upgradeHomeRam())
		{
			this.ns.print(
				'Home server RAM has been upgraded to '
				+ this.ns.formatRam(this.ns.getServerMaxRam('home')));

			upgraded = true;
		}

		return upgraded;
	}

	upgradeHacknet()
	{
		var hacknetNodeCost = this.ns.hacknet.getPurchaseNodeCost();

		if (hacknetNodeCost <= this.acceptableNodeUpgradeCost
			&& hacknetNodeCost <= this.ns.getPlayer().money)
		{
			this.ns.hacknet.purchaseNode();
		}
		else
		{
			for (var i = 0; i < this.ns.hacknet.numNodes(); i++)
			{
				var canUpgradeMore = true;

				while (canUpgradeMore)
				{
					var nodeUpgradeCost = this.ns.hacknet.getLevelUpgradeCost(i);

					canUpgradeMore =
						nodeUpgradeCost <= this.acceptableNodeUpgradeCost
						&& nodeUpgradeCost <= this.ns.getPlayer().money
						&& this.ns.hacknet.upgradeLevel(i);
				}
			}
		}
	}
}
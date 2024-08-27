import { NS } from '@ns';

import { Manager } from "scripts/managers/Manager";

import { executeOnRemoteServer } from "scripts/util/util";

export async function main(ns: NS)
{
	var startManager = new StartManager(ns);

	await startManager.startOperation();
}

export class StartManager extends Manager
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

			if (!this.createProgram())
			{
				if (this.shouldWork())
				{
					this.deployStartManager_Crime();
				}
				else
				{
					this.studyComputerScience();
                }
            }

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

	createProgram()
	{
		var currentWork = this.ns.singularity.getCurrentWork();

		var creatingProgram =
			currentWork != null
			&& currentWork.type == 'CREATE_PROGRAM';

		if (!creatingProgram
			&& !this.ns.fileExists('BruteSSH.exe'))
		{
			creatingProgram = this.ns.singularity.createProgram(
				'BruteSSH.exe',
				true);
		}

		if (!creatingProgram
			&& !this.ns.fileExists('FTPCrack.exe'))
		{
			creatingProgram = this.ns.singularity.createProgram(
				'FTPCrack.exe',
				true);
		}

		return creatingProgram;
	}

	shouldWork()
	{
		return this.ns.fileExists('BruteSSH.exe')
			&& this.ns.fileExists('FTPCrack.exe');
	}

	async deployStartManager_Crime()
	{
		this.undeployAccessManager();
		this.undeployHackingManager(this.targetServerName);

		this.ns.spawn('/scripts/managers/StartManager_Crime.js');
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

	studyComputerScience()
	{
		var currentWork = this.ns.singularity.getCurrentWork();

		var studyingComputerScience =
			currentWork != null
			&& currentWork.type == 'CLASS'
			&& currentWork.classType == this.ns.enums.UniversityClassType.computerScience;

		if (!studyingComputerScience)
		{
			studyingComputerScience = this.ns.singularity.universityCourse(
				this.ns.enums.LocationName.Sector12RothmanUniversity,
				this.ns.enums.UniversityClassType.computerScience,
				true);
		}

		return studyingComputerScience;
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
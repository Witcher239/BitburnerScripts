import { NS } from '@ns';

import { Manager } from "scripts/managers/Manager";

import { BackdoorInstallerService } from "scripts/services/BackdoorInstallerService";

import { getAllServerNames } from "scripts/util/util";

export async function main(ns: NS)
{
	var accessManager = new AccessManager(ns);

	await accessManager.startOperation();
}

export class AccessManager extends Manager
{
	rootAccessTargetServerNames: string[] = [];
	backdoorTargetServerNames: string[] = [];

	torRouter = false;

	numOfHackingSoftwareInstalled = 0;

	hasBruteSSH = false;
	hasFTPCrack = false;
	hasRelaySMTP = false;
	hasHTTPWorm = false;
	hasSQLInject = false;

	backdoorCandidatesServerNames = [];

	constructor(ns: NS)
	{
		super(ns);
	}

	disableLogs()
	{
		this.ns.disableLog('hasRootAccess');
		this.ns.disableLog('getServerRequiredHackingLevel');
		this.ns.disableLog('getHackingLevel');
		this.ns.disableLog('getServerNumPortsRequired');
		this.ns.disableLog('fileExists');
		this.ns.disableLog('scan');
		this.ns.disableLog('getServerMaxRam');
		this.ns.disableLog('getServerUsedRam');
		this.ns.disableLog('scp');
	}

	init()
	{
		this.rootAccessTargetServerNames = getAllServerNames(this.ns);
		this.backdoorTargetServerNames = this.buildTargetServerList();

		this.torRouter = this.ns.hasTorRouter();
	}

	async manage()
	{
		this.updateInfo();

		this.updateTargetServerList();

		await this.getRootAccesses();
		
		await this.installBackdoorsOnServers();
	}

	updateInfo()
	{
		this.waitTime = 60000;

		this.updateHackingSoftwareInfo();
    }

	updateHackingSoftwareInfo()
	{
		if (this.numOfHackingSoftwareInstalled < 5)
		{
			if (!this.hasBruteSSH
					&& this.ns.fileExists("BruteSSH.exe"))
			{
				this.hasBruteSSH = true;

				this.numOfHackingSoftwareInstalled++;
			}

			if (!this.hasFTPCrack
					&& this.ns.fileExists("FTPCrack.exe"))
			{
				this.hasFTPCrack = true;

				this.numOfHackingSoftwareInstalled++;
			}

			if (!this.hasRelaySMTP
					&& this.ns.fileExists("relaySMTP.exe"))
			{
				this.hasRelaySMTP = true;

				this.numOfHackingSoftwareInstalled++;
			}

			if (!this.hasHTTPWorm
					&& this.ns.fileExists("HTTPWorm.exe"))
			{
				this.hasHTTPWorm = true;

				this.numOfHackingSoftwareInstalled++;
			}

			if (!this.hasSQLInject
					&& this.ns.fileExists("SQLInject.exe"))
			{
				this.hasSQLInject = true;

				this.numOfHackingSoftwareInstalled++;
			}
		}
	}

	updateTargetServerList()
	{
		if (!this.torRouter
			&& this.ns.hasTorRouter())
		{
			this.torRouter = true;

			this.rootAccessTargetServerNames = getAllServerNames(this.ns);
			this.backdoorTargetServerNames = this.buildTargetServerList();
		}
	}

	buildTargetServerList()
	{
		var allBackdoorTargetServerNames = getAllServerNames(this.ns);

		var importantBackdoorTargetServerNames = this.getImportantBackdoorTargetServerNames();

		for (var i = 0; i < importantBackdoorTargetServerNames.length; i++)
		{
			var serverName = importantBackdoorTargetServerNames[i];

			var serverIndex = allBackdoorTargetServerNames.indexOf(serverName);

			if (serverIndex != -1)
			{
				allBackdoorTargetServerNames.splice(
					serverIndex,
					1);
            }
		}

		return [...importantBackdoorTargetServerNames, ...allBackdoorTargetServerNames];
    }

	getImportantBackdoorTargetServerNames()
	{
		return ['CSEC',
				'avmnite-02h',
				'I.I.I.I',
				'run4theh111z',
				'fulcrumassets']
    }

	async getRootAccesses()
	{
		var targetServerNamesLeft: string[] = [];

		for (var i = 0; i < this.rootAccessTargetServerNames.length; i++)
		{
			var targetServerName = this.rootAccessTargetServerNames[i];

			if (!this.ns.hasRootAccess(targetServerName)
					&& !await this.getRootAccess(targetServerName))
			{
				targetServerNamesLeft.push(targetServerName);
			}
		}

		this.rootAccessTargetServerNames = targetServerNamesLeft;
	}

	async getRootAccess(serverName: string)
	{
		var ret = false;

		if (this.isHackingLevelEnough(serverName))
		{
			if (this.openPorts(serverName))
			{
				this.ns.nuke(serverName);

				ret = true;
			}
		}

		return ret;
	}

	isHackingLevelEnough(serverName: string)
	{
		return this.ns.getServerRequiredHackingLevel(serverName) <= this.ns.getHackingLevel();
	}

	openPorts(serverName: string)
	{
		var ret = false;

		var requiredPorts = this.ns.getServerNumPortsRequired(serverName);

		if (requiredPorts <= this.numOfHackingSoftwareInstalled)
		{
			if (requiredPorts > 0
					&& this.hasBruteSSH)
			{
				this.ns.brutessh(serverName);

				requiredPorts--;
			}

			if (requiredPorts > 0
					&& this.hasFTPCrack)
			{
				this.ns.ftpcrack(serverName);

				requiredPorts--;
			}

			if (requiredPorts > 0
					&& this.hasRelaySMTP)
			{
				this.ns.relaysmtp(serverName);

				requiredPorts--;
			}

			if (requiredPorts > 0
					&& this.hasHTTPWorm)
			{
				this.ns.httpworm(serverName);

				requiredPorts--;
			}

			if (requiredPorts > 0
					&& this.hasSQLInject)
			{
				this.ns.sqlinject(serverName);
			}

			ret = true;
		}

		return ret;
	}

	async installBackdoorsOnServers()
	{
		for (var i = 0; i < this.backdoorTargetServerNames.length; i++)
		{
			var targetServerName = this.backdoorTargetServerNames[i];

			if (this.ns.getServer(targetServerName).backdoorInstalled)
			{
				this.backdoorTargetServerNames.splice(
					i,
					1);

				i--;
			}
			else if (await this.installBackdoorOnServer(targetServerName))
			{
				this.backdoorTargetServerNames.splice(
					i,
					1);

				i--;

				this.waitTime = 1000;

				break;
            }
		}
	}

	async installBackdoorOnServer(serverName: string)
	{
		var ret = false;

		if (this.ns.hasRootAccess(serverName))
		{
			var backdoorInstallerService = new BackdoorInstallerService(
				this.ns,
				serverName);

			await backdoorInstallerService.startOperation();

			ret = this.ns.getServer(serverName).backdoorInstalled!;
		}

		return ret;
	}

	shouldStopOperation()
	{
		return this.rootAccessTargetServerNames.length == 0
			&& this.backdoorTargetServerNames.length == 0
			&& this.torRouter;
	}

	setFlags()
	{
		this.ns.write(
			'flags/AllAccessGranted.txt',
			'1',
			'w');
	}
}

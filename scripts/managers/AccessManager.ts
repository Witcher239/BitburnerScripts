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
	}

	init()
	{
		this.rootAccessTargetServerNames = getAllServerNames(this.ns);
		this.backdoorTargetServerNames = getAllServerNames(this.ns);

		this.torRouter = this.ns.hasTorRouter();
	}

	async manage()
	{
		this.updateHackingSoftwareInfo();

		this.updateTargetServerList();

		await this.getRootAccesses();
		
		await this.installBackdoorsOnServers();
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
			this.backdoorTargetServerNames = getAllServerNames(this.ns);
		}
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
		var targetServerNamesLeft = [];

		for (var i = 0; i < this.backdoorTargetServerNames.length; i++)
		{
			var targetServerName = this.backdoorTargetServerNames[i];

			if (!this.ns.getServer(targetServerName).backdoorInstalled
					&& !await this.installBackdoorOnServer(targetServerName))
			{
				targetServerNamesLeft.push(targetServerName);
			}
		}

		this.backdoorTargetServerNames = targetServerNamesLeft;
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

			ret = true;
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

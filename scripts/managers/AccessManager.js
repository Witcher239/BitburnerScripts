/**@param {NS} ns**/

import {Manager} from "/scripts/managers/Manager.js"

import {getAllServerNames} from "/scripts/util/util.js"

export async function main(ns)
{
	var accessManager = new AccessManager(ns);

	await accessManager.startOperation();
}

export class AccessManager extends Manager
{
	targetServerNames = [];

	torRouter = false;

	numOfHackingSoftwareInstalled = 0;

	hasBruteSSH = false;
	hasFTPCrack = false;
	hasRelaySMTP = false;
	hasHTTPWorm = false;
	hasSQLInject = false;

	constructor(ns)
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
		this.targetServerNames = getAllServerNames(this.ns);

		this.torRouter = this.ns.hasTorRouter();
	}

	async manage()
	{
		this.updateHackingSoftwareInfo();

		this.updateTargetServerList();

		var targetServerNamesLeft = [];

		for (var i = 0; i < this.targetServerNames.length; i++)
		{
			var targetServerName = this.targetServerNames[i];

			if (!this.ns.hasRootAccess(targetServerName)
				&& !this.getRootAccess(targetServerName))
			{
				targetServerNamesLeft.push(targetServerName);
			}
		}

		this.targetServerNames = targetServerNamesLeft;
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

			this.targetServerNames = getAllServerNames(this.ns);
		}
	}

	getRootAccess(serverName)
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

	isHackingLevelEnough(serverName)
	{
		return this.ns.getServerRequiredHackingLevel(serverName) <= this.ns.getHackingLevel();
	}

	openPorts(serverName)
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

	shouldStopOperation()
	{
		return this.targetServerNames.length == 0;
	}
}

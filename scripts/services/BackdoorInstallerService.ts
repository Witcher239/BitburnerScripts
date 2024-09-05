import { NS } from '@ns';

import { executeOnRemoteServer } from "scripts/util/util";

import { RouteFinderService } from "scripts/services/RouteFinderService";

export async function main(ns: NS)
{
	var targetServerName = ns.args[0].toString();

	var backdoorInstallerService = new BackdoorInstallerService(
		ns,
		targetServerName);

	await backdoorInstallerService.startOperation();
}

export class BackdoorInstallerService
{
	ns;

	targetServerName = '';

	callerServerName = '';

	route: string[] = [];

	constructor(
		ns: NS,
		targetServerName: string)
	{
		this.ns = ns;

		this.targetServerName = targetServerName;
	}

	async startOperation()
	{
		this.init();

		if (!this.installingBackdoor())
		{
			this.findRouteToTarget();

			await this.connectToTarget();

			await this.installBackdoorToTarget();

			await this.connectToCaller();
        }
	}

	init()
	{
		this.callerServerName = this.ns.singularity.getCurrentServer();
	}

	installingBackdoor()
	{
		return this.ns.isRunning(
			'/scripts/export/installBackdoor.js',
			'home',
			this.targetServerName);
    }

	findRouteToTarget()
	{
		var routeFinderService = new RouteFinderService(
			this.ns,
			this.targetServerName);

		routeFinderService.startOperation();

		this.route = routeFinderService.route;
	}

	async connectToTarget()
	{
		var clothestServerIndex = this.getClothestConnectableServerIndex();

		for (var i = clothestServerIndex; i >= 0; i--)
		{
			var serverName = this.route[i];

			await this.ns.singularity.connect(serverName);
		}
	}

	getClothestConnectableServerIndex()
	{
		var clothestConnectableServerIndex = this.route.length - 1;

		for (var i = 0; i < this.route.length; i++)
		{
			var serverName = this.route[i];

			if (this.ns.getServer(serverName).backdoorInstalled)
			{
				clothestConnectableServerIndex = i;

				break;
			}
		}

		return clothestConnectableServerIndex;
	}

	async installBackdoorToTarget()
	{
		if (this.ns.getScriptRam(
				'/scripts/export/installBackdoor.js',
				'home') <= this.ns.getServerMaxRam('home') - this.ns.getServerUsedRam('home'))
		{
			await executeOnRemoteServer(
				this.ns,
				'/scripts/export/installBackdoor.js',
				'home',
				1,
				[this.targetServerName]);

			await this.ns.sleep(1000);
		}
	}

	async connectToCaller()
	{
		await this.ns.singularity.connect(this.callerServerName);
	}
}

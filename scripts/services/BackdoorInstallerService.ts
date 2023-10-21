/** @param {NS} ns */

import {RouteFinderService} from "/scripts/services/RouteFinderService.js"

export async function main(ns)
{
	var targetServerName = ns.args[0];

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

	route = [];

	constructor(
		ns,
		targetServerName)
	{
		this.ns = ns;

		this.targetServerName = targetServerName;
	}

	async startOperation()
	{
		this.init();

		this.findRouteToTarget();

		await this.connectToTarget();

		await this.installBackdoorToTarget();

		await this.connectToCaller();
	}

	init()
	{
		this.callerServerName = this.ns.getHostname();
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
		await this.ns.singularity.installBackdoor();
	}

	async connectToCaller()
	{
		await this.ns.singularity.connect(this.callerServerName);
	}
}

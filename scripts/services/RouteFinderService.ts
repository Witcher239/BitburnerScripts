/** @param {NS} ns */

export async function main(ns)
{
	var targetServerName = ns.args[0];

	var routeFinderService = new RouteFinderService(
		ns,
		targetServerName);

	routeFinderService.startOperation();

	ns.tprint(routeFinderService.route);
}

export class RouteFinderService
{
	ns;

	targetServerName = '';

	route = [];

	constructor(
		ns,
		targetServerName)
	{
		this.ns = ns;

		this.targetServerName = targetServerName;
	}

	startOperation()
	{
		this.buildRoute();
	}

	buildRoute()
	{
		this.searchTargetServerRecursive(
			this.ns.getHostname(),
			'');
	}

	searchTargetServerRecursive(
		currentServerName,
		previousServerName)
	{
		var targetServerFound = false;

		var connectedServerNames = this.ns.scan(currentServerName);

		for (var i = 0; i < connectedServerNames.length; i++)
		{
			var connectedServerName = connectedServerNames[i];

			if (connectedServerName == previousServerName)
			{
				continue;
			}

			targetServerFound =
				connectedServerName == this.targetServerName
				|| this.searchTargetServerRecursive(
						connectedServerName,
						currentServerName);

			if (targetServerFound)
			{
				this.route.push(connectedServerName);

				break;
			}
		}

		return targetServerFound;
	}
}

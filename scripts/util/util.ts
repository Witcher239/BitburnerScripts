import { NS } from '@ns';

export function getAllServerNames(
	ns: NS,
	serverName = 'home',
	allServerNames = ['home'])
{
	var connectedServerNames = ns.scan(serverName);

	for (var i = 0; i < connectedServerNames.length; i++)
	{
		var connectedServerName = connectedServerNames[i];

		if (allServerNames.indexOf(connectedServerName) == -1)
		{
			allServerNames.push(connectedServerName);

			allServerNames = getAllServerNames(
				ns,
				connectedServerName,
				allServerNames);
		}
	}

	return allServerNames;
}

export function getPurchasedServerNames(ns: NS)
{
	var purchasedServerNames = [];

	var connectedServerNames = ns.scan('home');

	for (var i = 0; i < connectedServerNames.length; i++)
	{
		var connectedServerName = connectedServerNames[i];

		if (connectedServerName.search('hack') != -1)
		{
			purchasedServerNames.push(connectedServerName);
		}
	}

	return purchasedServerNames;
}

export async function executeOnRemoteServer(
	ns: NS,
	scriptName: string,
	serverName: string,
	numThreads = 1,
	args: string[] = [])
{
	var successfullRun = false;

	var serverFreeRAM = getServerFreeRAM(
		ns,
		serverName);

	var scriptRAM = ns.getScriptRam(
		scriptName,
		ns.getHostname());

	if (numThreads == -1)
	{
		numThreads = scriptRAM == 0 ?
			1 :
			Math.floor(serverFreeRAM / scriptRAM);

		if (numThreads == 0)
		{
			numThreads = 1;
		}
	}

	var requiredRAM = scriptRAM * numThreads;

	if (serverFreeRAM >= requiredRAM)
	{
		await ns.scp(
			scriptName,
			serverName);

		if (await ns.exec(
				scriptName,
				serverName,
				numThreads,
				...args) != 0)
		{
			successfullRun = true;
		}
	}
	else
	{
		ns.print(
			'There is not enough RAM available on the server '
			+ serverName
			+ ' to run a script '
			+ scriptName
			+ ' with a number of threads '
			+ numThreads
			+ '. RAM required: '
			+ ns.formatRam(requiredRAM)
			+ ' ('
			+ ns.formatRam(scriptRAM)
			+ ' per thread). Available RAM: '
			+ ns.formatRam(serverFreeRAM)
			+ ' (Max: '
			+ ns.formatRam(ns.getServerMaxRam(serverName))
			+ ')');
	}

	return successfullRun;	
}

export function getServerFreeRAM(
	ns: NS,
	serverName: string)
{
	var maxRAM = ns.getServerMaxRam(serverName);

	var currentScriptRAM = 0;

	if (serverName == ns.getHostname())
	{
		currentScriptRAM = ns.getScriptRam(
			ns.getScriptName(),
			serverName);
	}

	var freeRAM = maxRAM - ns.getServerUsedRam(serverName) + currentScriptRAM;
	
	return freeRAM;
}

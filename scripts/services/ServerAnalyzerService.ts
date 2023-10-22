import { NS } from '@ns';

import { ServerInfoBuilderService } from "scripts/services/ServerInfoBuilderService";

import { ServerInfoModel } from "../models/ServerInfoModel";

import { getAllServerNames } from "scripts/util/util";

export async function main(ns: NS)
{
	var serverName = ns.args[0].toString();
	var filter = ns.args[1].toString();

	var serverAnalyzerService = new ServerAnalyzerService(
		ns,
		serverName,
		filter);

	serverAnalyzerService.startOperation();
}

export class ServerAnalyzerService
{
	ns;

	serverName = '';

	filter = '';

	numOfHackablePorts = 0;

	serverInfoModels: ServerInfoModel[] = [];

	analysisData = '';

	constructor(
		ns: NS,
		serverName: string,
		filter: string)
	{
		this.ns = ns;

		this.serverName = serverName;

		this.filter = filter;
	}

	startOperation()
	{
		this.init();

		this.buildServerInfoModels();

		this.buildAnalysisData();

		this.displayAnalysisData();
	}

	init()
	{
		if (this.ns.fileExists('BruteSSH.exe'))
		{
			this.numOfHackablePorts++;
		}

		if (this.ns.fileExists('FTPCrack.exe'))
		{
			this.numOfHackablePorts++;
		}

		if (this.ns.fileExists('relaySMTP.exe'))
		{
			this.numOfHackablePorts++;
		}

		if (this.ns.fileExists('HTTPWorm.exe'))
		{
			this.numOfHackablePorts++;
		}

		if (this.ns.fileExists('SQLInject.exe'))
		{
			this.numOfHackablePorts++;
		}
	}

	buildServerInfoModels()
	{
		this.serverInfoModels = [];

		var serverNames = this.serverName == 'all' ?
			this.getFilteredServerList() :
			[this.serverName];

		for (var i = 0; i < serverNames.length; i++)
		{
			var serverInfoModel = this.buildServerInfoModel(serverNames[i]);

			this.serverInfoModels.push(serverInfoModel);
		}
	}

	getFilteredServerList()
	{
		var filteredServerList = [];

		var serverNames = getAllServerNames(this.ns).sort();

		if (this.filter)
		{
			for (var i = 0; i < serverNames.length; i++)
			{
				var serverName = serverNames[i];

				if (this.serverMatchesFilter(serverName))
				{
					filteredServerList.push(serverName);
				}
			}
		}
		else
		{
			filteredServerList = serverNames;
		}

		return filteredServerList;
	}

	serverMatchesFilter(serverName: string)
	{
		var ret = false;

		switch (this.filter)
		{
			case 'own':

				if (serverName == 'home'
					|| serverName.search('hack') != -1)
				{
					ret = true;
				}

				break;

			case 'res':

				if (this.ns.hasRootAccess(serverName)
					&& this.ns.getServerMaxRam(serverName) > 0
					&& this.ns.getServerMaxMoney(serverName) == 0)
				{
					ret = true;
				}

				break;

			case 'ext':

				if (this.ns.hasRootAccess(serverName)
					&& serverName != 'home'
					&& serverName.search('hack') == -1)
				{
					ret = true;
				}

				break;

			case 'tgt':

				if (this.ns.hasRootAccess(serverName)
					&& this.ns.getServerMaxMoney(serverName) > 0)
				{
					ret = true;
				}

				break;

			case 'psp':

				if (!this.ns.hasRootAccess(serverName)
					&& this.ns.getServerRequiredHackingLevel(serverName) > this.ns.getHackingLevel()
					&& this.ns.getServerNumPortsRequired(serverName) > this.numOfHackablePorts)
				{
					ret = true;
				}

				break;
		}

		return ret;
	}

	buildServerInfoModel(serverName: string)
	{
		var serverInfoBuilderService = new ServerInfoBuilderService(
			this.ns,
			serverName);

		serverInfoBuilderService.startOperation();

		return serverInfoBuilderService.serverInfoModel;
	}

	buildAnalysisData()
	{
		this.addNextRowSymbol();

		this.addLine(111);

		this.addNextRowSymbol();

		this.addAnalysisDataHeader();

		this.addNextRowSymbol();

		this.addLine(111);

		for (var i = 0; i < this.serverInfoModels.length; i++)
		{
			this.addNextRowSymbol();

			this.addAnalysisDataLine(this.serverInfoModels[i]);
		}

		this.addNextRowSymbol();

		this.addLine(111);
	}

	addAnalysisDataHeader()
	{
		this.addText('|');

		this.addText(
			'Name',
			18);

		this.addText('|');

		this.addText(
			'Sec.',
			12);

		this.addText('|');

		this.addText(
			'Min sec.',
			12);

		this.addText('|');

		this.addText(
			'Money',
			12);

		this.addText('|');

		this.addText(
			'Max money',
			12);

		this.addText('|');

		this.addText(
			'Free RAM',
			12);

		this.addText('|');

		this.addText(
			'Max RAM',
			12);

		this.addText('|');

		this.addText(
			'RAM %',
			12);

		this.addText('|');
	}

	addAnalysisDataLine(serverInfoModel: ServerInfoModel)
	{
		this.addText('|');

		this.addText(
			serverInfoModel.name,
			18);

		this.addText('|');

		this.addText(
			serverInfoModel.securityLevel.toFixed(3),
			12);

		this.addText('|');

		this.addText(
			serverInfoModel.minSecurityLevel.toFixed(3),
			12);

		this.addText('|');

		this.addText(
			this.ns.formatNumber(serverInfoModel.moneyAvailable),
			12);

		this.addText('|');

		this.addText(
			this.ns.formatNumber(serverInfoModel.maxMoney),
			12);

		this.addText('|');

		this.addText(
			this.ns.formatRam(serverInfoModel.freeRAM),
			12);

		this.addText('|');

		this.addText(
			this.ns.formatRam(serverInfoModel.maxRAM),
			12);

		this.addText('|');

		this.addText(
			this.ns.formatPercent(
				serverInfoModel.maxRAM > 0 ?
					serverInfoModel.freeRAM / serverInfoModel.maxRAM :
					0),
			12);

		this.addText('|');
	}

	addNextRowSymbol()
	{
		this.analysisData += '\n';
	}

	addLine(length: number)
	{
		for (var i = 0; i < length; i++)
		{
			this.analysisData += '-';
		}
	}

	addText(
		text: string,
		size = text.length)
	{
		var spacesBefore = '';
		var spacesAfter = '';

		var textLength = text.length;

		if (size > textLength)
		{
			var sizeDifference = size - textLength;

			var numOfSpacesBefore = Math.ceil(sizeDifference / 2);

			for (var i = 0; i < numOfSpacesBefore; i++)
			{
				spacesBefore += ' ';
			}

			var numOfSpacesAfter = sizeDifference - numOfSpacesBefore;

			for (var i = 0; i < numOfSpacesAfter; i++)
			{
				spacesAfter += ' ';
			}
		}

		this.analysisData += spacesBefore + text + spacesAfter;
	}

	displayAnalysisData()
	{
		this.ns.tprint(this.analysisData);
	}
}

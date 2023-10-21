/** @param {NS} ns */

import {ServerInfoModel} from "scripts/models/ServerInfoModel"

export class ServerInfoBuilderService
{
	ns;

	serverName = '';

	serverInfoModel = null;

	constructor(
		ns,
		serverName)
	{
		this.ns = ns;

		this.serverName = serverName;

		this.serverInfoModel = new ServerInfoModel();
	}

	startOperation()
	{
		this.addBasicInfo();
		this.addSecurityLevelInfo();
		this.addMoneyInfo();
		this.addRAMInfo();
	}

	addBasicInfo()
	{
		this.serverInfoModel.name = this.serverName;
	}

	addSecurityLevelInfo()
	{
		this.serverInfoModel.securityLevel = this.ns.getServerSecurityLevel(this.serverName);
		this.serverInfoModel.minSecurityLevel = this.ns.getServerMinSecurityLevel(this.serverName);
	}

	addMoneyInfo()
	{
		this.serverInfoModel.moneyAvailable = this.ns.getServerMoneyAvailable(this.serverName);
		this.serverInfoModel.maxMoney = this.ns.getServerMaxMoney(this.serverName);
	}

	addRAMInfo()
	{
		var serverMaxRam = this.ns.getServerMaxRam(this.serverName);

		this.serverInfoModel.maxRAM = serverMaxRam;

		var serverFreeRAM = serverMaxRam - this.ns.getServerUsedRam(this.serverName);

		this.serverInfoModel.freeRAM = serverFreeRAM;
	}
}

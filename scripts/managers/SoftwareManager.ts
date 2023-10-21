/** @param {NS} ns */

import {Manager} from "/scripts/managers/Manager.js"

export async function main(ns)
{
	var softwareManager = new SoftwareManager(ns);

	await softwareManager.startOperation();
}

export class SoftwareManager extends Manager
{
	fractionOfMoneyForSoftwarePurchases = 0.1;

	moneyForSoftwarePurchases = 0;

	darkwebPrograms = [];

	constructor(ns)
	{
		super(ns);
	}

	validate()
	{
		return this.ns.hasTorRouter();
	}

	disableLogs()
	{
		this.ns.disableLog('getServerMoneyAvailable');
	}

	init()
	{
		this.darkwebPrograms = this.ns.singularity.getDarkwebPrograms();
	}

	async manage()
	{
		this.updateInfo();

		this.purchasePrograms();
	}

	updateInfo()
	{
		this.moneyForSoftwarePurchases = this.ns.getServerMoneyAvailable('home') * this.fractionOfMoneyForSoftwarePurchases;

		this.updateRemainingDarkwebProgramsList();
	}

	updateRemainingDarkwebProgramsList()
	{
		var darkwebProgramsLeft = [];

		for (var i = 0; i < this.darkwebPrograms.length; i++)
		{
			var darkwebProgram = this.darkwebPrograms[i];

			if (!this.ns.fileExists(darkwebProgram))
			{
				darkwebProgramsLeft.push(darkwebProgram);
			}
		}

		this.darkwebPrograms = darkwebProgramsLeft;
	}

	purchasePrograms()
	{
		for (var i = 0; i < this.darkwebPrograms.length; i++)
		{
			var programName = this.darkwebPrograms[i];

			var programCost = this.ns.singularity.getDarkwebProgramCost(programName);

			if (this.moneyForSoftwarePurchases >= programCost)
			{
				this.ns.singularity.purchaseProgram(programName);

				this.moneyForSoftwarePurchases -= programCost;

				this.ns.print(
					'Program '
					+ programName
					+ ' has been purchased for '
					+ this.ns.formatNumber(programCost));
			}
		}
	}

	shouldStopOperation()
	{
		return this.darkwebPrograms.length == 0;
	}

	setFlags()
	{
		this.ns.write(
			'flags/AllSoftwareInstalled.txt',
			'1',
			'w');
	}
}

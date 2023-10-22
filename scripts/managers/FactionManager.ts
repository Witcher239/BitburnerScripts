import { NS } from '@ns';

import { Manager } from "scripts/managers/Manager";

export async function main(ns: NS)
{
	var factionManager = new FactionManager(ns);

	await factionManager.startOperation();
}

export class FactionManager extends Manager
{
	constructor(ns: NS)
	{
		super(ns);
	}

	async manage()
	{
		this.processInvitations();
	}

	processInvitations()
	{
		var factionInvitations = this.ns.singularity.checkFactionInvitations();

		for (var i = 0; i < factionInvitations.length; i++)
		{
			var factionName = factionInvitations[i];

			this.ns.singularity.joinFaction(factionName);
		}
	}
}

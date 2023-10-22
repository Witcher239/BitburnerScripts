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

			this.processInvitation(factionName);
		}
	}

	processInvitation(factionName: string)
	{
		if (this.shouldJoinFaction(factionName))
		{
			this.ns.singularity.joinFaction(factionName);
        }
	}

	shouldJoinFaction(factionName: string)
	{
		var ret = true;

		var cityFactionGroup = this.getCityFactionGroup(factionName);

		if (cityFactionGroup != '')
		{
			ret =
				this.belongToCityFactionGroup(cityFactionGroup)
				|| this.augmentationsLeftInCityFactionGroup(cityFactionGroup);
        }

		return ret;
    }

	getCityFactionGroup(factionName: string)
	{
		var cityFactionGroup = '';

		switch (factionName)
		{
			case this.ns.enums.CityName.Sector12:
			case this.ns.enums.CityName.Aevum:

				cityFactionGroup = 'America';

				break;

			case this.ns.enums.CityName.Chongqing:
			case this.ns.enums.CityName.NewTokyo:
			case this.ns.enums.CityName.Ishima:

				cityFactionGroup = 'Asia';

				break;

			case this.ns.enums.CityName.Volhaven:

				cityFactionGroup = 'Europe';

				break;
		}

		return cityFactionGroup;
	}

	belongToCityFactionGroup(cityFactionGroup: string)
	{
		var ret = false;

		switch (cityFactionGroup)
		{
			case 'America':

				ret =
					this.ns.getPlayer().factions.includes(this.ns.enums.CityName.Sector12)
					|| this.ns.getPlayer().factions.includes(this.ns.enums.CityName.Aevum);

				break;

			case 'Asia':

				ret =
					this.ns.getPlayer().factions.includes(this.ns.enums.CityName.Chongqing)
					|| this.ns.getPlayer().factions.includes(this.ns.enums.CityName.NewTokyo)
					|| this.ns.getPlayer().factions.includes(this.ns.enums.CityName.Ishima);

				break;

			case 'Europe':

				ret = this.ns.getPlayer().factions.includes(this.ns.enums.CityName.Volhaven);

				break;
        }

		return ret;
	}

	augmentationsLeftInCityFactionGroup(cityFactionGroup: string)
	{
		var ret = false;

		var purchasedAugmentations = this.ns.singularity.getOwnedAugmentations(true);

		var cityFactionGroupAugmentations: string[] = [];

		switch (cityFactionGroup)
		{
			case 'America':

				cityFactionGroupAugmentations.push(...this.ns.singularity.getAugmentationsFromFaction(this.ns.enums.CityName.Sector12));
				cityFactionGroupAugmentations.push(...this.ns.singularity.getAugmentationsFromFaction(this.ns.enums.CityName.Aevum));

				break;

			case 'Asia':

				cityFactionGroupAugmentations.push(...this.ns.singularity.getAugmentationsFromFaction(this.ns.enums.CityName.Chongqing));
				cityFactionGroupAugmentations.push(...this.ns.singularity.getAugmentationsFromFaction(this.ns.enums.CityName.NewTokyo));
				cityFactionGroupAugmentations.push(...this.ns.singularity.getAugmentationsFromFaction(this.ns.enums.CityName.Ishima));

				break;

			case 'Europe':

				cityFactionGroupAugmentations.push(...this.ns.singularity.getAugmentationsFromFaction(this.ns.enums.CityName.Volhaven));

				break;
		}

		for (var i = 0; i < cityFactionGroupAugmentations.length; i++)
		{
			var augmentationName = cityFactionGroupAugmentations[i];

			if (!purchasedAugmentations.includes(augmentationName))
			{
				ret = true;

				break;
            }
        }

		return ret;
    }
}

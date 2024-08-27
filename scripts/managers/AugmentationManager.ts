import { NS } from '@ns';

import { Manager } from "scripts/managers/Manager";

import { AnalyzeAugmentationPurchaseRequirementsResultModel } from "scripts/models/AnalyzeAugmentationPurchaseRequirementsResultModel";

export async function main(ns: NS)
{
	var augmentationManager = new AugmentationManager(ns);

	await augmentationManager.startOperation();
}

export class AugmentationManager extends Manager
{
	purchasedAugmentations: string[] = [];

	selectedFactions: string[] = [];

	notCompletedFactions: string[] = [];
	selectedNotCompletedFactions: string[] = [];

	availableAugmentations: string[] = [];
	selectedAvailableAugmentations: string[] = [];

	purchasableAugmentations: string[] = [];
	selectedPurchasableAugmentations: string[] = [];
	notSelectedPurchasableAugmentations: string[] = [];

	neurofluxGovernor = 'NeuroFlux Governor';

	multiplierBase = 1.9;

	fractionOfMoneyForAugmentations = 1;

	moneyForAugmentations = 0;

	minimalQuantityOfAugmentationsToPurchase = 10;

	constructor(ns: NS)
	{
		super(ns);
	}

	async manage()
	{
		this.updateInfo();

		var augmentationsToPurchase = this.getAugmentationsToPurchase();

		if (this.canPurchaseAugmentations(augmentationsToPurchase))
		{
			this.purchaseAugmentations(augmentationsToPurchase);

			this.purchaseNeurofluxGovernors();

			this.installAugmentations();
		}
		else
		{
			this.ns.print(
				'There are ' +
				augmentationsToPurchase.length +
				' augmentations that can be purchased: ' +
				augmentationsToPurchase);
        }
	}

	updateInfo()
	{
		this.selectedFactions = this.ns.read('settings/SelectedFactions.txt').split(',');

		this.moneyForAugmentations = this.ns.getPlayer().money * this.fractionOfMoneyForAugmentations;

		this.purchasedAugmentations = this.ns.singularity.getOwnedAugmentations(true);

		this.updateFactionsLists();

		this.updateAvailableAugmentationsLists();

		this.updatePurchasableAugmentationsLists();
	}

	updateFactionsLists()
	{
		this.notCompletedFactions = [];
		this.selectedNotCompletedFactions = [];

		var joinedFactions = this.ns.getPlayer().factions;

		for (var i = 0; i < joinedFactions.length; i++)
		{
			var factionName = joinedFactions[i];

			var availableAugmentationsInFaction = this.getAvailableAugmentationsInFaction(factionName);

			if (availableAugmentationsInFaction.length > 0)
			{
				this.notCompletedFactions.push(factionName);

				if (this.selectedFactions.includes(factionName))
				{
					this.selectedNotCompletedFactions.push(factionName);
                }
			}
		}
    }

	updateAvailableAugmentationsLists()
	{
		this.availableAugmentations = [];
		this.selectedAvailableAugmentations = [];

		for (var i = 0; i < this.notCompletedFactions.length; i++)
		{
			var factionName = this.notCompletedFactions[i];

			var availableAugmentationsInFaction = this.getAvailableAugmentationsInFaction(factionName);

			availableAugmentationsInFaction.forEach(
				(augmentationInFaction) =>
				{
					if (!this.availableAugmentations.includes(augmentationInFaction))
					{
						this.availableAugmentations.push(augmentationInFaction);
					}

					if (this.selectedNotCompletedFactions.includes(factionName)
						&& !this.selectedAvailableAugmentations.includes(augmentationInFaction))
					{
						this.selectedAvailableAugmentations.push(augmentationInFaction);
                    }
				});
		}

		this.sortAugmentationsByPrice(this.availableAugmentations);
		this.sortAugmentationsByPrice(this.selectedAvailableAugmentations);
	}

	getAvailableAugmentationsInFaction(factionName: string)
	{
		var availableAugmentationsInFaction: string[] = [];

		var allAugmentationsInFaction = this.ns.singularity.getAugmentationsFromFaction(factionName);

		for (var i = 0; i < allAugmentationsInFaction.length; i++)
		{
			var augmentationName = allAugmentationsInFaction[i];

			if (!this.purchasedAugmentations.includes(augmentationName)
				&& augmentationName != this.neurofluxGovernor)
			{
				availableAugmentationsInFaction.push(augmentationName);
            }
		}

		return availableAugmentationsInFaction;
	}

	sortAugmentationsByPrice(augmentations: string[])
	{
		return augmentations.sort(
			(
				a,
				b) =>
			{
				return this.ns.singularity.getAugmentationPrice(b) - this.ns.singularity.getAugmentationPrice(a);
			});
	}

	updatePurchasableAugmentationsLists()
	{
		this.purchasableAugmentations = [];
		this.selectedPurchasableAugmentations = [];

		this.availableAugmentations.forEach(
			(augmentationName) =>
			{
				if (this.haveReputationForAugmentation(augmentationName)
					&& this.haveMoneyForAugmentation(augmentationName))
				{
					this.purchasableAugmentations.push(augmentationName);

					if (this.selectedAvailableAugmentations.includes(augmentationName))
					{
						this.selectedPurchasableAugmentations.push(augmentationName);
					}
					else
					{
						this.notSelectedPurchasableAugmentations.push(augmentationName);
                    }
				}
			});
	}

	haveReputationForAugmentation(augmentationName: string)
	{
		var haveReputation = true;

		var analyzeResult = this.recursiveAnalyzeAugmentationPurchaseRequirements(augmentationName);

		for (var i = 0; i < analyzeResult.requiredAugmentations.length; i++)
		{
			var augmentationName = analyzeResult.requiredAugmentations[i];

			if (this.getFirstFactionWhereAugmentationCanBePurchased(augmentationName) == '')
			{
				haveReputation = false;

				break;
            }
		}

		return haveReputation;
	}

	haveMoneyForAugmentation(
		augmentationName: string,
		multiplierPower: number = 0,
		lockedMoney: number = 0)
	{
		var analyzeResult = this.recursiveAnalyzeAugmentationPurchaseRequirements(
			augmentationName,
			multiplierPower);

		return (this.moneyForAugmentations - lockedMoney) >= analyzeResult.requiredMoney;
	}

	getAugmentationsToPurchase()
	{
		var augmentationsToPurchase = this.buildPurchaseList(this.selectedPurchasableAugmentations);

		if (this.augmentationsListHasAllSelectedAugmentations(augmentationsToPurchase))
		{
			for (var i = 0; i < this.notSelectedPurchasableAugmentations.length; i++)
			{
				var augmentationName = this.notSelectedPurchasableAugmentations[i];

				if (!augmentationsToPurchase.includes(augmentationName))
				{
					var augmentations = [...augmentationsToPurchase, augmentationName];

					this.sortAugmentationsByPrice(augmentations);

					var predictedAugmentationsToPurchase = this.buildPurchaseList(augmentations);

					if (this.augmentationsListHasAllSelectedAugmentations(predictedAugmentationsToPurchase))
					{
						augmentationsToPurchase = [...predictedAugmentationsToPurchase];
					}
				}
			}
        }

		return augmentationsToPurchase;
	}

	buildPurchaseList(augmentations: string[])
	{
		var augmentationsToPurchase: string[] = [];

		var multiplierPower = 0;
		var lockedMoney = 0;

		augmentations.forEach(
			(augmentationName) =>
			{
				if (!augmentationsToPurchase.includes(augmentationName))
				{
					var result = this.recursiveAnalyzeAugmentationPurchaseRequirements(
						augmentationName,
						multiplierPower);

					if (this.moneyForAugmentations >= lockedMoney + result.requiredMoney)
					{
						augmentationsToPurchase = [...augmentationsToPurchase, ...result.requiredAugmentations];
						multiplierPower += result.requiredAugmentations.length;
						lockedMoney += result.requiredMoney;
					}
				}
			});

		return augmentationsToPurchase;
	}

	recursiveAnalyzeAugmentationPurchaseRequirements(
		augmentationName: string,
		multiplierPower: number = 0)
	{
		var result = new AnalyzeAugmentationPurchaseRequirementsResultModel();

		if (!this.purchasedAugmentations.includes(augmentationName))
		{
			var requiredAugmentations: string[] = [];

			var requiredMoney = 0;

			var havePrerequisites = this.haveAllPrerequisitesForAugmentation(augmentationName);

			if (!havePrerequisites)
			{
				var prerequisitesResult = this.recursiveAnalyzeAugmentationPurchaseRequirements(
					this.ns.singularity.getAugmentationPrereq(augmentationName)[0],
					multiplierPower);

				requiredAugmentations.push(...prerequisitesResult.requiredAugmentations);
				requiredMoney += prerequisitesResult.requiredMoney;

				havePrerequisites = requiredAugmentations.length > 0;
			}

			if (havePrerequisites)
			{
				requiredMoney += this.calculateAugmentationPrice(
					augmentationName,
					multiplierPower + requiredAugmentations.length);

				requiredAugmentations.push(augmentationName);

				result.requiredAugmentations = requiredAugmentations;
				result.requiredMoney = requiredMoney;
			}
		}

		return result;
	}

	haveAllPrerequisitesForAugmentation(augmentationName: string)
	{
		var ret = true;

		var prerequisitesForAugmentation = this.ns.singularity.getAugmentationPrereq(augmentationName);

		for (var i = 0; i < prerequisitesForAugmentation.length; i++)
		{
			var prerequisiteAugmentationName = prerequisitesForAugmentation[i];

			if (!this.purchasedAugmentations.includes(prerequisiteAugmentationName))
			{
				ret = false;

				break;
			}
		}

		return ret;
	}

	calculateAugmentationPrice(
		augmentationName: string,
		multiplierPower: number = 0)
	{
		var multiplier = Math.pow(
			this.multiplierBase,
			multiplierPower);

		return this.ns.singularity.getAugmentationPrice(augmentationName) * multiplier;
	}

	canPurchaseAugmentations(augmentationsToPurchase: string[])
	{
		var canPurchase = true;

		if (this.selectedAvailableAugmentations.length > 0)
		{
			canPurchase = this.augmentationsListHasAllSelectedAugmentations(augmentationsToPurchase);
        }
		else
		{
			canPurchase = augmentationsToPurchase.length >= this.minimalQuantityOfAugmentationsToPurchase;
        }

		return canPurchase;
	}

	augmentationsListHasAllSelectedAugmentations(augmentations: string[])
	{
		var augmentationsListHasAllSelectedAugmentations = true;

		for (var i = 0; i < this.selectedAvailableAugmentations.length; i++)
		{
			var augmentationName = this.selectedAvailableAugmentations[i];

			if (!augmentations.includes(augmentationName))
			{
				augmentationsListHasAllSelectedAugmentations = false;

				break;
			}
		}

		return augmentationsListHasAllSelectedAugmentations;
	}

	purchaseAugmentations(augmentations: string[])
	{
		augmentations.forEach(
			(augmentationName) =>
			{
				this.ns.singularity.purchaseAugmentation(
					this.getFirstFactionWhereAugmentationCanBePurchased(augmentationName),
					augmentationName);
			});
	}

	purchaseNeurofluxGovernors()
	{
		var mustTryToPurchaseMore = true;

		while (mustTryToPurchaseMore)
		{
			mustTryToPurchaseMore =
				this.ns.singularity.purchaseAugmentation(
					this.getFirstFactionWhereAugmentationCanBePurchased(this.neurofluxGovernor),
					this.neurofluxGovernor)
				&& this.ns.getPlayer().money >= this.ns.singularity.getAugmentationPrice(this.neurofluxGovernor);
		}
	}

	getFirstFactionWhereAugmentationCanBePurchased(augmentationName: string)
	{
		var factionWhereAugmentationCanBePurchased = '';

		var requiredReputation = this.ns.singularity.getAugmentationRepReq(augmentationName);

		var factionsWithAugmentation = this.ns.singularity.getAugmentationFactions(augmentationName);

		for (var i = 0; i < factionsWithAugmentation.length; i++)
		{
			var factionName = factionsWithAugmentation[i];

			if (this.ns.getPlayer().factions.includes(factionName)
				&& this.ns.singularity.getFactionRep(factionName) >= requiredReputation)
			{
				factionWhereAugmentationCanBePurchased = factionName;

				break;
			}
		}

		return factionWhereAugmentationCanBePurchased;
	}

	installAugmentations()
	{
		this.ns.singularity.installAugmentations('/scripts/managers/StartManager.js');
    }
}
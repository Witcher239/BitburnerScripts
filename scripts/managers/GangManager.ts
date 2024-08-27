import { NS } from '@ns';

import { Manager } from "scripts/managers/Manager";

export async function main(ns: NS)
{
	var gangManager = new GangManager(ns);

	await gangManager.startOperation();
}

export class GangManager extends Manager
{
	augmentationNames: string[] = [];
	equipmentNames: string[] = [];

	newMembersNames = ['Tommy', 'Paul', 'Sam', 'Mike', 'Frank', 'Trevor', 'Zack', 'Dave', 'Andy', 'Luke', 'Goro', 'Kiryu'];

	fractionOfMoneyForAugmentationsPurchase = 0.01;
	fractionOfMoneyForEquipmentPurchase = 0.001;

	expectedTotalMultipliersGain = 10;

	moneyForAugmentationsPurchase = 0;
	moneyForEquipmentPurchase = 0;

	constructor(ns: NS)
	{
		super(ns);
	}

	validate()
	{
		return this.ns.gang.inGang();
	}

	disableLogs()
	{
		this.ns.disableLog('gang.getEquipmentNames');
		this.ns.disableLog('gang.getEquipmentType');
		this.ns.disableLog('gang.canRecruitMember');
		this.ns.disableLog('gang.getMemberNames');
		this.ns.disableLog('gang.getMemberInformation');
		this.ns.disableLog('gang.getEquipmentCost');
		this.ns.disableLog('getServerMoneyAvailable');
		this.ns.disableLog('gang.getAscensionResult');
	}

	init()
	{
		var allEquipmentNames = this.ns.gang.getEquipmentNames();

		for (var i = 0; i < allEquipmentNames.length; i++)
		{
			var equipmentName = allEquipmentNames[i];

			if (this.ns.gang.getEquipmentType(equipmentName) == 'Augmentation')
			{
				this.augmentationNames.push(equipmentName);
			}
			else
			{
				this.equipmentNames.push(equipmentName);
			}
		}
	}

	async manage()
	{
		this.updateInfo();

		this.recruitMembers();

		this.manageMembers();
	}

	updateInfo()
	{
		this.waitTime = 60000;

		this.moneyForAugmentationsPurchase = this.ns.getPlayer().money * this.fractionOfMoneyForAugmentationsPurchase;
		this.moneyForEquipmentPurchase = this.ns.getPlayer().money * this.fractionOfMoneyForEquipmentPurchase;
	}

	recruitMembers()
	{
		while (this.ns.gang.canRecruitMember())
		{
			var memberName = this.getNewMemberName();

			this.ns.gang.recruitMember(memberName);

			this.ns.gang.setMemberTask(
				memberName,
				this.ns.gang.getGangInformation().isHacking ?
					'Train Hacking' :
					'Train Combat');	
		}
	}

	getNewMemberName()
	{
		var newMemberName = '';

		var memberNames = this.ns.gang.getMemberNames();

		for (var i = 0; i < this.newMembersNames.length; i++)
		{
			var memberName = this.newMembersNames[i];

			if (memberNames.indexOf(memberName) == -1)
			{
				newMemberName = memberName;

				break;
			}
		}

		return newMemberName;
	}

	manageMembers()
	{
		var memberNames = this.ns.gang.getMemberNames();

		for (var i = 0; i < memberNames.length; i++)
		{
			var memberName = memberNames[i];

			this.purchaseAugmentationsForMember(memberName);

			if (this.shouldAscendMember(memberName))
			{
				this.ns.gang.ascendMember(memberName);
			}
			
			this.purchaseEquipmentForMember(memberName);
		}
	}

	purchaseAugmentationsForMember(memberName: string)
	{
		var gangMemberInfo = this.ns.gang.getMemberInformation(memberName);

		if (gangMemberInfo.augmentations.length < this.equipmentNames.length)
		{
			for (var i = 0; i < this.augmentationNames.length; i++)
			{
				var augmentationName = this.augmentationNames[i];

				if (gangMemberInfo.augmentations.indexOf(augmentationName) == -1
					&& this.ns.gang.getEquipmentCost(augmentationName) < this.moneyForAugmentationsPurchase)
				{
					this.ns.gang.purchaseEquipment(
						memberName,
						augmentationName);

					this.waitTime = 1000;
				}
			}
		}
	}

	shouldAscendMember(memberName: string)
	{
		var ret = false;

		var ascensionResult = this.ns.gang.getAscensionResult(memberName);

		if (ascensionResult != undefined)
		{
			var agilityMultiplierGain = (ascensionResult.agi - 1) * 100;
			var charismaMultiplierGain = (ascensionResult.cha - 1) * 100;
			var defenceMultiplierGain = (ascensionResult.def - 1) * 100;
			var dexterityMultiplierGain = (ascensionResult.dex - 1) * 100;
			var hackingMultiplierGain = (ascensionResult.hack - 1) * 100;
			var strengthMultiplierGain = (ascensionResult.str - 1) * 100;

			var totalMultipliersGain = agilityMultiplierGain + charismaMultiplierGain + defenceMultiplierGain + dexterityMultiplierGain + hackingMultiplierGain + strengthMultiplierGain;

			ret = totalMultipliersGain >= this.expectedTotalMultipliersGain;
		}

		return ret;
	}

	purchaseEquipmentForMember(memberName: string)
	{
		var gangMemberInfo = this.ns.gang.getMemberInformation(memberName);

		if (gangMemberInfo.upgrades.length < this.equipmentNames.length)
		{
			for (var i = 0; i < this.equipmentNames.length; i++)
			{
				var equipmentName = this.equipmentNames[i];

				if (gangMemberInfo.upgrades.indexOf(equipmentName) == -1
					&& this.ns.gang.getEquipmentCost(equipmentName) < this.moneyForEquipmentPurchase)
				{
					this.ns.gang.purchaseEquipment(
						memberName,
						equipmentName);

					this.waitTime = 1000;
				}
			}
		}
	}
}

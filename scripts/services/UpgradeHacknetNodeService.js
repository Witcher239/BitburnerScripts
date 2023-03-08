/** @param {NS} ns */

export async function main(ns)
{
	var hacknetNodeIndex = ns.args[0];
	var moneyForUpgrades = ns.args[1];
	var targetRevenueTime = ns.args[2];

	var upgradeHacknetNodeService = new UpgradeHacknetNodeService(
		ns,
		hacknetNodeIndex,
		moneyForUpgrades,
		targetRevenueTime);

	upgradeHacknetNodeService.startOperation();
}

export class UpgradeHacknetNodeService
{
	ns;

	hacknetNodeIndex = 0;

	remainingMoneyForUpgrades = 0;

	targetRevenueTime = 0;

	hacknetMultipliers = null;
	nodeStats = null;

	currentTargetRevenueTimeProduction = 0;

	constructor(
		ns,
		hacknetNodeIndex,
		moneyForUpgrades,
		targetRevenueTime)
	{
		this.ns = ns;

		this.hacknetNodeIndex = hacknetNodeIndex;

		this.remainingMoneyForUpgrades = moneyForUpgrades;

		this.targetRevenueTime = targetRevenueTime;
	}

	startOperation()
	{
		this.init();

		this.upgradeHacknetNode();
	}

	init()
	{
		this.hacknetMultipliers = this.ns.getHacknetMultipliers();

		this.nodeStats = this.ns.hacknet.getNodeStats(this.hacknetNodeIndex);

		this.currentTargetRevenueTimeProduction = this.nodeStats.production * this.targetRevenueTime;
	}

	upgradeHacknetNode()
	{
		var mustTryToUpgradeMore = true;

		while (mustTryToUpgradeMore)
		{
			this.upgradeHacknetNodeLevel();

			mustTryToUpgradeMore = this.upgradeHacknetNodeRAM();

			mustTryToUpgradeMore =
				this.upgradeHacknetNodeCores()
				|| mustTryToUpgradeMore;
		}
	}

	upgradeHacknetNodeLevel()
	{
		var upgraded = false;

		if (this.nodeStats.level < 200
			&& this.ns.hacknet.getLevelUpgradeCost(
					this.hacknetNodeIndex,
					1) <= this.remainingMoneyForUpgrades)
		{
			var numOfUpgradesLeft = 200 - this.nodeStats.level;

			for (var numOfUpgrades = numOfUpgradesLeft; numOfUpgrades > 0; numOfUpgrades--)
			{
				var upgradeCost = this.ns.hacknet.getLevelUpgradeCost(
					this.hacknetNodeIndex,
					numOfUpgrades);

				if (upgradeCost <= this.remainingMoneyForUpgrades
					&& this.calculateTargetRevenueTimeHacknetNodeProduction(
							this.nodeStats.level + numOfUpgrades,
							this.nodeStats.ram,
							this.nodeStats.cores) - this.currentTargetRevenueTimeProduction >= upgradeCost)
				{
					if (this.ns.hacknet.upgradeLevel(
							this.hacknetNodeIndex,
							numOfUpgrades))
					{
						this.remainingMoneyForUpgrades -= upgradeCost;

						this.nodeStats = this.ns.hacknet.getNodeStats(this.hacknetNodeIndex);

						this.currentTargetRevenueTimeProduction = this.nodeStats.production * this.targetRevenueTime;

						this.ns.print(
							'For hacknet node '
							+ this.nodeStats.name
							+ ' level has been upgraded '
							+ numOfUpgrades
							+ ' times for '
							+ this.ns.formatNumber(upgradeCost));

						upgraded = true;

						break;
					}
				}
			}
		}

		return upgraded;
	}

	upgradeHacknetNodeRAM()
	{
		var upgraded = false;

		if (this.nodeStats.ram < 64
			&& this.ns.hacknet.getRamUpgradeCost(
					this.hacknetNodeIndex,
					1) <= this.remainingMoneyForUpgrades)
		{
			var currentNumOfRamUpgrades = Math.log2(this.nodeStats.ram);

			var numOfUpgradesLeft = 6 - currentNumOfRamUpgrades;

			for (var numOfUpgrades = numOfUpgradesLeft; numOfUpgrades > 0; numOfUpgrades--)
			{
				var upgradeCost = this.ns.hacknet.getRamUpgradeCost(
					this.hacknetNodeIndex,
					numOfUpgrades);

				if (upgradeCost <= this.remainingMoneyForUpgrades
					&& this.calculateTargetRevenueTimeHacknetNodeProduction(
							this.nodeStats.level,
							Math.pow(
								2,
								currentNumOfRamUpgrades + numOfUpgrades),
							this.nodeStats.cores) - this.currentTargetRevenueTimeProduction >= upgradeCost)
				{
					if (this.ns.hacknet.upgradeRam(
							this.hacknetNodeIndex,
							numOfUpgrades))
					{
						this.remainingMoneyForUpgrades -= upgradeCost;

						this.nodeStats = this.ns.hacknet.getNodeStats(this.hacknetNodeIndex);

						this.currentTargetRevenueTimeProduction = this.nodeStats.production * this.targetRevenueTime;

						this.ns.print(
							'For hacknet node '
							+ this.nodeStats.name
							+ ' RAM has been upgraded '
							+ numOfUpgrades
							+ ' times for '
							+ this.ns.formatNumber(upgradeCost));

						upgraded = true;

						break;
					}
				}
			}
		}

		return upgraded;
	}

	upgradeHacknetNodeCores()
	{
		var upgraded = false;

		if (this.nodeStats.cores < 16
			&& this.ns.hacknet.getCoreUpgradeCost(
					this.hacknetNodeIndex,
					1) <= this.remainingMoneyForUpgrades)
		{
			var numOfUpgradesLeft = 16 - this.nodeStats.cores;

			for (var numOfUpgrades = numOfUpgradesLeft; numOfUpgrades > 0; numOfUpgrades--)
			{
				var upgradeCost = this.ns.hacknet.getCoreUpgradeCost(
					this.hacknetNodeIndex,
					numOfUpgrades);

				if (upgradeCost <= this.remainingMoneyForUpgrades
					&& this.calculateTargetRevenueTimeHacknetNodeProduction(
							this.nodeStats.level,
							this.nodeStats.ram,
							this.nodeStats.cores + numOfUpgrades) - this.currentTargetRevenueTimeProduction >= upgradeCost)
				{
					if (this.ns.hacknet.upgradeCore(
							this.hacknetNodeIndex,
							numOfUpgrades))
					{
						this.remainingMoneyForUpgrades -= upgradeCost;

						this.nodeStats = this.ns.hacknet.getNodeStats(this.hacknetNodeIndex);

						this.currentTargetRevenueTimeProduction = this.nodeStats.production * this.targetRevenueTime;

						this.ns.print(
							'For hacknet node '
							+ this.nodeStats.name
							+ ' cores have been upgraded '
							+ numOfUpgrades
							+ ' times for '
							+ this.ns.formatNumber(upgradeCost));

						upgraded = true;

						break;
					}
				}
			}
		}

		return upgraded;
	}

	calculateTargetRevenueTimeHacknetNodeProduction(
		level,
		ram,
		cores)
	{
		var ramMultiplier = Math.pow(1.035, (ram - 1));
		var coresMultiplier = 1 + 0.167 * (cores - 1);

		return 1.5 * level * ramMultiplier * coresMultiplier * this.hacknetMultipliers.production * this.targetRevenueTime;
	}
}

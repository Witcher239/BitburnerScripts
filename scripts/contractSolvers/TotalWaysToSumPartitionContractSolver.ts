import { NS } from '@ns';

import { ContractSolver } from "scripts/contractSolvers/ContractSolver";

export class TotalWaysToSumPartitionContractSolver extends ContractSolver
{
	inputNumber = 0;

	waysToSumPerNumber: number[] = [1];

	constructor(
		ns: NS,
		inputNumber: number)
	{
		super(ns);

		this.inputNumber = inputNumber;
	}

	async calculate()
	{
		await this.searchWaysToSum();
	}

	async searchWaysToSum()
	{
		for (let i = 1; i <= this.inputNumber; i++)
		{
			await this.searchWaysToSumForNumber(i);
		}
    }

	async searchWaysToSumForNumber(number: number)
	{
		let waysToSum = 0;

		let stepsTillPartitionSignReverse = 1;

		let signMultiplier = 1;

		let pentagonalNumberIndex = 1;

		let waysToSumFound = false;

		while (!waysToSumFound)
		{
			let pentagonalNumber = this.getPentagonalNumberForIndex(pentagonalNumberIndex);

			if (number - pentagonalNumber >= 0)
			{
				waysToSum += signMultiplier * this.waysToSumPerNumber[number - pentagonalNumber];

				if (stepsTillPartitionSignReverse == 0)
				{
					signMultiplier = -signMultiplier;

					stepsTillPartitionSignReverse = 1;
				}
				else
				{
					stepsTillPartitionSignReverse--;
				}

				pentagonalNumberIndex = pentagonalNumberIndex > 0 ?
					-pentagonalNumberIndex :
					1 - pentagonalNumberIndex;
			}
			else
			{
				waysToSumFound = true;
			}
		}

		this.waysToSumPerNumber.push(waysToSum);
	}

	getPentagonalNumberForIndex(pentagonalNumberIndex: number)
	{
		return ((3 * Math.pow(pentagonalNumberIndex, 2)) - pentagonalNumberIndex) / 2;
    }

	buildResult()
	{
		return this.waysToSumPerNumber[this.inputNumber] - 1;
	}
}
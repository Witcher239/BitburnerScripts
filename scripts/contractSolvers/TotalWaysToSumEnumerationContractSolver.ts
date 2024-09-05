import { NS } from '@ns';

import { ContractSolver } from "scripts/contractSolvers/ContractSolver";

export class TotalWaysToSumEnumerationContractSolver extends ContractSolver
{
	inputNumber = 0;

	allowedNumbers: number[] = [];

	waysToSumPerNumber = new Map<number, string[]>();

	constructor(
		ns: NS,
		inputNumber: number,
		allowedNumbers: number[])
	{
		super(ns);

		this.inputNumber = inputNumber;
		this.allowedNumbers = allowedNumbers;
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
		let waysToSum: string[] = [];

		for (let i = number - 1; i > 0; i--)
		{
			if (this.allowedNumbers.length > 0
				&& !this.allowedNumbers.includes(i))
			{
				continue;
			}

			let difference = number - i;

			if (this.allowedNumbers.length == 0
				|| this.allowedNumbers.includes(difference))
			{
				let resultingNumbers = this.getResultingNumbers(
					i,
					[difference]);

				if (!waysToSum.includes(resultingNumbers))
				{
					waysToSum.push(resultingNumbers);
				}
            }

			if (this.waysToSumPerNumber.has(difference))
			{
				let waysToSumForDifference = this.waysToSumPerNumber.get(difference)!;

				for (let j = 0; j < waysToSumForDifference.length; j++)
				{
					if (j % 1000 == 0)
					{
						await this.ns.sleep(1);
                    }

					let resultingNumbers = this.getResultingNumbers(
						i,
						JSON.parse(waysToSumForDifference[j]));

					if (!waysToSum.includes(resultingNumbers))
					{
						waysToSum.push(resultingNumbers);
					}
                }
            }
		}

		this.waysToSumPerNumber.set(
			number,
			waysToSum);
    }

	getResultingNumbers(
		number: number,
		numbersToAdd: number[])
	{
		return JSON.stringify(
			[number, ...numbersToAdd].sort(
				(a, b) =>
				{
					return b - a;
				}));
    }

	buildResult()
	{
		return this.waysToSumPerNumber.get(this.inputNumber)!.length;
	}
}
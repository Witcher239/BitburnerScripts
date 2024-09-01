import { NS } from '@ns';

import { ContractSolver } from "scripts/contractSolvers/ContractSolver";

export class MaxSumContractSolver extends ContractSolver
{
	numbers: number[] = [];

	maxSum = 0;

	constructor(
		ns: NS,
		numbers: number[])
	{
		super(ns);

		this.numbers = numbers;
	}

	async calculate()
	{
		this.searchMaxSum();
	}

	searchMaxSum()
	{
		for (let i = 1; i <= this.numbers.length; i++)
		{
			this.searchMaxSumInPiecesOfSpecifiedSize(i);
		}
	}

	searchMaxSumInPiecesOfSpecifiedSize(sizeOfPiece: number)
	{
		for (let i = 0; i < this.numbers.length - sizeOfPiece + 1; i++)
		{
			let sum = this.sumInNumbersSegment(
				this.numbers.slice(
					i,
					i + sizeOfPiece));

			if (sum > this.maxSum)
			{
				this.maxSum = sum;
			}
		}
	}

	sumInNumbersSegment(numbersSegment: number[])
	{
		let sum = 0;

		for (let i = 0; i < numbersSegment.length; i++)
		{
			let number = numbersSegment[i];

			sum += number;
		}

		return sum;
	}

	buildResult()
	{
		return this.maxSum.toString();
    }
}

import { NS } from '@ns';

import { ContractSolver } from "scripts/contractSolvers/ContractSolver";

export class PrimeFactorContractSolver extends ContractSolver
{
	inputNumber = 0;

	primeFactors: number[] = [];

	constructor(
		ns: NS,
		inputNumber: number)
	{
		super(ns);

		this.inputNumber = inputNumber;
	}

	async calculate()
	{
		await this.doRecursivePrimeFactorsSearch(this.inputNumber);
	}

	async doRecursivePrimeFactorsSearch(number: number)
	{
		await this.ns.sleep(1);

		for (let i = 2; i <= number; i++)
		{
			if (number % i == 0)
			{
				this.primeFactors.push(i);

				await this.doRecursivePrimeFactorsSearch(number / i);

				break;
			}
		}
	}

	buildResult()
	{
		let largestPrimeFactor = 0;

		for (let i = 0; i < this.primeFactors.length; i++)
		{
			let primeFactor = this.primeFactors[i];

			if (primeFactor > largestPrimeFactor)
			{
				largestPrimeFactor = primeFactor;
			}
		}

		return largestPrimeFactor;
    }
}

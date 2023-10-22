export class PrimeFactorContractSolver
{
	inputNumber = 0;

	primeFactors: number[] = [];

	constructor(inputNumber: number)
	{
		this.inputNumber = inputNumber;
	}

	solve()
	{
		this.doRecursivePrimeFactorsSearch(this.inputNumber);

		return this.largestPrimeFactor();
	}

	doRecursivePrimeFactorsSearch(number: number)
	{
		for (var i = 2; i <= number; i++)
		{
			if (number % i == 0)
			{
				this.primeFactors.push(i);

				this.doRecursivePrimeFactorsSearch(number / i);

				break;
			}
		}
	}

	largestPrimeFactor()
	{
		var largestPrimeFactor = 0;

		for (var i = 0; i < this.primeFactors.length; i++)
		{
			var primeFactor = this.primeFactors[i];

			if (primeFactor > largestPrimeFactor)
			{
				largestPrimeFactor = primeFactor;
			}
		}

		return largestPrimeFactor;
	}
}

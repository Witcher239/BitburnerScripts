/** @param {NS} ns */

export class MaxSumContractSolver
{
	numbers = [];

	maxSum = 0;

	constructor(numbers)
	{
		this.numbers = numbers;
	}

	solve()
	{
		this.searchMaxSum();

		return this.maxSum;
	}

	searchMaxSum()
	{
		for (var i = 1; i <= this.numbers.length; i++)
		{
			this.searchMaxSumInPiecesOfSpecifiedSize(i);
		}
	}

	searchMaxSumInPiecesOfSpecifiedSize(sizeOfPiece)
	{
		for (var i = 0; i < this.numbers.length - sizeOfPiece + 1; i++)
		{
			var sum = this.sumInNumbersSegment(
				this.numbers.slice(
					i,
					i + sizeOfPiece));

			if (sum > this.maxSum)
			{
				this.maxSum = sum;
			}
		}
	}

	sumInNumbersSegment(numbersSegment)
	{
		var sum = 0;

		for (var i = 0; i < numbersSegment.length; i++)
		{
			var number = numbersSegment[i];

			sum += number;
		}

		return sum;
	}
}

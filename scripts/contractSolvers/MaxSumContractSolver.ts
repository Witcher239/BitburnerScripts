export class MaxSumContractSolver
{
	numbers: number[] = [];

	maxSum = 0;

	constructor(numbers: number[])
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

	searchMaxSumInPiecesOfSpecifiedSize(sizeOfPiece: number)
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

	sumInNumbersSegment(numbersSegment: number[])
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

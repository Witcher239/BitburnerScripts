export class StockPriceContractSolver
{
	numOfTransactions = 0;

	prices: number[] = [];

	maxProfit = 0;

	constructor(
		numOfTransactions: number,
		prices: number[])
	{
		this.numOfTransactions = numOfTransactions;
		
		this.prices = prices;
	}

	solve()
	{
		this.searchMaxProfit();

		return this.maxProfit;
	}

	searchMaxProfit()
	{
		var maxNumOfPricesPairs = Math.floor(this.prices.length / 2);

		var maxNumOfPieces = Math.min(
			this.numOfTransactions,
			maxNumOfPricesPairs);

		for (var i = 1; i <= maxNumOfPieces; i++)
		{
			this.searchMaxProfitInSpecifiedNumOfPieces(i);
		}
	}

	searchMaxProfitInSpecifiedNumOfPieces(numOfPieces: number)
	{
		if (this.canSearchMaxProfitInSpecifiedNumOfPieces(numOfPieces))
		{
			this.doRecursiveMaxProfitSearch(
				numOfPieces,
				1,
				0,
				0);
		}
	}

	canSearchMaxProfitInSpecifiedNumOfPieces(numOfPieces: number)
	{
		return this.prices.length / 2 >= numOfPieces;
	}

	doRecursiveMaxProfitSearch(
		numOfPieces: number,
		currentPieceNum: number,
		startIndex: number,
		previousProfit: number)
	{
		if (currentPieceNum == numOfPieces)
		{
			var profit = previousProfit;

			profit += this.maxProfitInPriceSegment(
				this.prices.slice(
					startIndex,
					this.prices.length));

			if (profit > this.maxProfit)
			{
				this.maxProfit = profit;
			}
		}
		else
		{
			for (var i = startIndex + 1; i < (this.prices.length - 2 * (numOfPieces - currentPieceNum)); i++)
			{
				var profit = previousProfit;

				profit += this.maxProfitInPriceSegment(
					this.prices.slice(
						startIndex,
						i + 1));

				this.doRecursiveMaxProfitSearch(
					numOfPieces,
					currentPieceNum + 1,
					i + 1,
					profit);
			}
		}
	}

	maxProfitInPriceSegment(pricesSegment: number[])
	{
		var maxProfit = 0;

		for (var i = 0; i < pricesSegment.length; i++)
		{
			var purchPrice = pricesSegment[i];

			for (var j = i + 1; j < pricesSegment.length; j++)
			{
				var salesPrice = pricesSegment[j];

				var profit = salesPrice - purchPrice;

				if (profit > maxProfit)
				{
					maxProfit = profit;
				}
			}
		}

		return maxProfit;
	}
}

import { NS } from '@ns';

import { ContractSolver } from "scripts/contractSolvers/ContractSolver";

export class StockPriceContractSolver extends ContractSolver
{
	numOfTransactions = 0;

	prices: number[] = [];

	maxProfit = 0;

	constructor(
		ns: NS,
		numOfTransactions: number,
		prices: number[])
	{
		super(ns);

		this.numOfTransactions = numOfTransactions;
		
		this.prices = prices;
	}

	async calculate()
	{
		await this.searchMaxProfit();
	}

	async searchMaxProfit()
	{
		let maxNumOfPricesPairs = Math.floor(this.prices.length / 2);

		let maxNumOfPieces = Math.min(
			this.numOfTransactions,
			maxNumOfPricesPairs);

		for (let i = 1; i <= maxNumOfPieces; i++)
		{
			await this.searchMaxProfitInSpecifiedNumOfPieces(i);
		}
	}

	async searchMaxProfitInSpecifiedNumOfPieces(numOfPieces: number)
	{
		if (this.canSearchMaxProfitInSpecifiedNumOfPieces(numOfPieces))
		{
			await this.recursiveMaxProfitSearch(
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

	async recursiveMaxProfitSearch(
		numOfPieces: number,
		currentPieceNum: number,
		startIndex: number,
		previousProfit: number)
	{
		await this.ns.sleep(1);

		if (currentPieceNum == numOfPieces)
		{
			let profit = previousProfit;

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
			for (let i = startIndex + 1; i < (this.prices.length - 2 * (numOfPieces - currentPieceNum)); i++)
			{
				let profit = previousProfit;

				profit += this.maxProfitInPriceSegment(
					this.prices.slice(
						startIndex,
						i + 1));

				await this.recursiveMaxProfitSearch(
					numOfPieces,
					currentPieceNum + 1,
					i + 1,
					profit);
			}
		}
	}

	maxProfitInPriceSegment(pricesSegment: number[])
	{
		let maxProfit = 0;

		for (let i = 0; i < pricesSegment.length; i++)
		{
			let purchPrice = pricesSegment[i];

			for (let j = i + 1; j < pricesSegment.length; j++)
			{
				let salesPrice = pricesSegment[j];

				let profit = salesPrice - purchPrice;

				if (profit > maxProfit)
				{
					maxProfit = profit;
				}
			}
		}

		return maxProfit;
	}

	buildResult()
	{
		return this.maxProfit;
    }
}

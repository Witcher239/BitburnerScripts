import { NS } from '@ns';

import { ContractSolver } from "scripts/contractSolvers/ContractSolver";

export class LZDecompressionContractSolver extends ContractSolver
{
	inputExpression = '';

	outputExpression = '';

	constructor(
		ns: NS,
		inputExpression: string)
	{
		super(ns);

		this.inputExpression = inputExpression;
	}

	async calculate()
	{
		await this.recursiveBuildOutputExpression();
	}

	async recursiveBuildOutputExpression(
		inputExpression = this.inputExpression,
		isDirectChunk = true)
	{
		await this.ns.sleep(1);

		if (inputExpression != '')
		{
			let chunkSize = 1;

			let length = parseInt(
				inputExpression.substr(
					0,
					1));

			if (length != 0)
			{
				if (isDirectChunk)
				{
					this.decodeDirectChunk(
						inputExpression,
						length);

					chunkSize += length;
				}
				else
				{
					this.decodeReferenceChunk(
						inputExpression,
						length);

					chunkSize++;
				}
			}

			await this.recursiveBuildOutputExpression(
				inputExpression.substr(
					chunkSize,
					inputExpression.length - chunkSize),
				!isDirectChunk);
		}
	}

	decodeDirectChunk(
		inputExpression: string,
		length: number)
	{
		this.outputExpression += inputExpression.substr(
			1,
			length);
	}

	decodeReferenceChunk(
		inputExpression: string,
		length: number)
	{
		let numOfPlacesBefore = parseInt(
			inputExpression.substr(
				1,
				1));

		for (let i = 0; i < length; i++)
		{
			this.outputExpression += this.outputExpression.substr(
				this.outputExpression.length - numOfPlacesBefore,
				1);
		}
	}

	buildResult()
	{
		return this.outputExpression;
    }
}

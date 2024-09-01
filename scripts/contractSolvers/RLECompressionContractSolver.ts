import { NS } from '@ns';

import { ContractSolver } from "scripts/contractSolvers/ContractSolver";

export class RLECompressionContractSolver extends ContractSolver
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
		this.buildOutputExpression();
	}

	buildOutputExpression()
	{
		let lastCharacter = '';
		let numOfLastCharacters = 0;

		for (let i = 0; i < this.inputExpression.length; i++)
		{
			let character = this.inputExpression[i];

			if (character == lastCharacter
				&& numOfLastCharacters < 9)
			{
				numOfLastCharacters++;
			}
			else
			{
				if (lastCharacter
					&& numOfLastCharacters)
				{
					this.outputExpression += '' + numOfLastCharacters + lastCharacter;
				}

				lastCharacter = character;
				numOfLastCharacters = 1;
			}
		}

		if (lastCharacter
			&& numOfLastCharacters)
		{
			this.outputExpression += '' + numOfLastCharacters + lastCharacter;
		}
	}

	buildResult()
	{
		return this.outputExpression;
    }
}

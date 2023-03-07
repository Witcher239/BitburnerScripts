/** @param {NS} ns */

export class RLECompressionContractSolver
{
	inputExpression = '';

	outputExpression = '';

	constructor(inputExpression)
	{
		this.inputExpression = inputExpression;
	}

	solve()
	{
		this.buildOutputExpression();

		return this.outputExpression;
	}

	buildOutputExpression()
	{
		var lastCharacter = '';
		var numOfLastCharacters = 0;

		for (var i = 0; i < this.inputExpression.length; i++)
		{
			var character = this.inputExpression[i];

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
}

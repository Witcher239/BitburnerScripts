export class LZDecompressionContractSolver
{
	inputExpression = '';

	outputExpression = '';

	constructor(inputExpression: string)
	{
		this.inputExpression = inputExpression;
	}

	solve()
	{
		this.recursiveBuildOutputExpression();

		return this.outputExpression;
	}

	recursiveBuildOutputExpression(
		inputExpression = this.inputExpression,
		isDirectChunk = true)
	{
		if (inputExpression != '')
		{
			var chunkSize = 1;

			var length = parseInt(
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

			this.recursiveBuildOutputExpression(
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
		var numOfPlacesBefore = parseInt(
			inputExpression.substr(
				1,
				1));

		for (var i = 0; i < length; i++)
		{
			this.outputExpression += this.outputExpression.substr(
				this.outputExpression.length - numOfPlacesBefore,
				1);
		}
	}
}

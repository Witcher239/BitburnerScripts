export class LZCompressionContractSolver
{
	inputExpression = '';

	outputExpression = '';

	constructor(inputExpression: string)
	{
		this.inputExpression = inputExpression;
	}

	solve()
	{
		this.recursiveEncodeDirect();

		return this.outputExpression;
	}

	recursiveEncodeDirect(
		startingIndex = 0,
		outputExpression = '',
		canSkipChunk = false)
	{
		if (!this.tryToSaveEncoding(
				startingIndex,
				outputExpression))
		{
			var bestEncodingLengthFound = 0;

			var bestEncodedLengthFound = 0;

			var bestOutputExpression = '';

			var canSkipNextChunk = true;

			var minChunkLength = canSkipChunk ?
				0 :
				1;

			var maxChunkLength = Math.min(
				9,
				this.inputExpression.length - startingIndex);

			for (var i = minChunkLength; i <= maxChunkLength; i++)
			{
				var directOutputExpression = '' + i;

				var textToEncode = this.inputExpression.substr(
					startingIndex,
					i);

				directOutputExpression += textToEncode;

				var encodingLength = directOutputExpression.length;
				var encodedLength = i;
				var newOutputExpression = directOutputExpression;

				if (this.tryToSaveEncoding(
						startingIndex + i,
						outputExpression + newOutputExpression))
				{
					if (bestEncodingLengthFound == 0
						|| (bestEncodedLengthFound / bestEncodingLengthFound) < (encodedLength / encodingLength))
					{
						bestEncodingLengthFound = encodingLength;

						bestEncodedLengthFound = encodedLength;

						bestOutputExpression = newOutputExpression;
					}

					break;
				}
				else
				{
					var referenceLengthString = '';
					var referenceOutputExpression = '';

					[referenceLengthString, referenceOutputExpression] = this.encodeReference(
						startingIndex + i,
						i != 0);

					var referenceLength = parseInt(referenceLengthString);

					encodingLength += referenceOutputExpression.length;
					encodedLength += referenceLength;
					newOutputExpression += referenceOutputExpression;

					if (i + referenceLength > 0
						&& (bestEncodingLengthFound == 0
						 || (bestEncodedLengthFound / bestEncodingLengthFound) < (encodedLength / encodingLength)))
					{
						bestEncodingLengthFound = encodingLength;

						bestEncodedLengthFound = encodedLength;

						bestOutputExpression = newOutputExpression;

						canSkipNextChunk = referenceLength != 0;
					}
				}
			}

			this.recursiveEncodeDirect(
				startingIndex + bestEncodedLengthFound,
				outputExpression + bestOutputExpression,
				canSkipNextChunk);
		}
	}

	tryToSaveEncoding(
		startingIndex: number,
		outputExpression: string)
	{
		var ret = false;

		if (startingIndex == this.inputExpression.length
			&& outputExpression != '')
		{
			if (this.outputExpression.length == 0
				|| this.outputExpression.length > outputExpression.length)
			{
				this.outputExpression = outputExpression;
			}

			ret = true;
		}

		return ret;
	}

	encodeReference(
		startingIndex = 0,
		canSkipChunk = false)
	{
		var bestLengthFound = 0;
		var referenceExpression = '';

		var minChunkLength = canSkipChunk ?
			0 :
			1;

		var maxChunkLength = Math.min(
			9,
			this.inputExpression.length - startingIndex);

		for (var i = maxChunkLength; i >= minChunkLength; i--)
		{
			referenceExpression = '' + i;

			if (i == 0)
			{
				bestLengthFound = i;
			}
			else
			{
				var positionsBackFound = 0;

				var textToEncode = this.inputExpression.substr(
					startingIndex,
					i);

				var maxPositionsBack = Math.min(
					9,
					startingIndex);

				for (var j = 1; j <= maxPositionsBack; j++)
				{
					var referenceText = this.inputExpression.substr(
						startingIndex - j,
						i);

					if (referenceText == textToEncode)
					{
						positionsBackFound = j;

						break;
					}
				}

				if (positionsBackFound > 0)
				{
					bestLengthFound = i;

					referenceExpression += positionsBackFound;

					break;
				}		
			}
		}

		return [bestLengthFound.toString(), referenceExpression]
	}
}

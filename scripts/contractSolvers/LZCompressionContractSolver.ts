import { NS } from '@ns';

import { ContractSolver } from "scripts/contractSolvers/ContractSolver";

export class LZCompressionContractSolver extends ContractSolver
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
		await this.recursiveEncodeDirect();
	}

	async recursiveEncodeDirect(
		startingIndex = 0,
		outputExpression = '',
		canSkipChunk = false)
	{
		await this.ns.sleep(1);

		if (!this.tryToSaveEncoding(
				startingIndex,
				outputExpression))
		{
			let bestEncodingLengthFound = 0;

			let bestEncodedLengthFound = 0;

			let bestOutputExpression = '';

			let canSkipNextChunk = true;

			let minChunkLength = canSkipChunk ?
				0 :
				1;

			let maxChunkLength = Math.min(
				9,
				this.inputExpression.length - startingIndex);

			for (let i = minChunkLength; i <= maxChunkLength; i++)
			{
				let directOutputExpression = '' + i;

				let textToEncode = this.inputExpression.substr(
					startingIndex,
					i);

				directOutputExpression += textToEncode;

				let encodingLength = directOutputExpression.length;
				let encodedLength = i;
				let newOutputExpression = directOutputExpression;

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
					let referenceLengthString = '';
					let referenceOutputExpression = '';

					[referenceLengthString, referenceOutputExpression] = this.encodeReference(
						startingIndex + i,
						i != 0);

					let referenceLength = parseInt(referenceLengthString);

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

			await this.recursiveEncodeDirect(
				startingIndex + bestEncodedLengthFound,
				outputExpression + bestOutputExpression,
				canSkipNextChunk);
		}
	}

	tryToSaveEncoding(
		startingIndex: number,
		outputExpression: string)
	{
		let ret = false;

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
		let bestLengthFound = 0;
		let referenceExpression = '';

		let minChunkLength = canSkipChunk ?
			0 :
			1;

		let maxChunkLength = Math.min(
			9,
			this.inputExpression.length - startingIndex);

		for (let i = maxChunkLength; i >= minChunkLength; i--)
		{
			referenceExpression = '' + i;

			if (i == 0)
			{
				bestLengthFound = i;
			}
			else
			{
				let positionsBackFound = 0;

				let textToEncode = this.inputExpression.substr(
					startingIndex,
					i);

				let maxPositionsBack = Math.min(
					9,
					startingIndex);

				for (let j = 1; j <= maxPositionsBack; j++)
				{
					let referenceText = this.inputExpression.substr(
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

	buildResult()
	{
		return this.outputExpression;
    }
}

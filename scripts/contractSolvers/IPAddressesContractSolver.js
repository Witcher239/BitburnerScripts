/** @param {NS} ns */

export class IPAddressesContractSolver
{
	inputExpression = '';

	ipAddresses = [];

	constructor(inputExpression)
	{
		this.inputExpression = inputExpression;
	}

	solve()
	{
		this.buildIPAddresses();

		return this.buildOutputExpression();
	}

	buildIPAddresses()
	{
		if (this.inputExpression.length >= 4
			&& this.inputExpression.length <= 12)
		{
			this.recursiveBuildSegments();
		}
	}

	recursiveBuildSegments(
		segmentNum = 1,
		inputExpression = this.inputExpression,
		unfinishedIPAddress = '')
	{
		if (segmentNum == 4)
		{
			if (this.validateSegment(inputExpression))
			{
				this.ipAddresses.push(unfinishedIPAddress + inputExpression);
			}
		}
		else
		{
			for (var i = 1; i < 4; i++)
			{
				var segment = inputExpression.substr(
					0,
					i);

				if (!this.validateSegment(segment))
				{
					break;
				}

				this.recursiveBuildSegments(
					segmentNum + 1,
					inputExpression.substr(
						i,
						inputExpression.length - i),
					unfinishedIPAddress + segment + '.');
			}
		}
	}

	validateSegment(segment)
	{
		var ret = segment != '';

		if (ret
			&& segment.length > 1)
		{
			ret =
				segment.substr(
					0,
					1) != '0'
				&& parseInt(segment) <= 255
		}

		return ret;
	}

	buildOutputExpression()
	{
		var outputExpression = '[';

		var firstIPAddress = true;

		for (var i = 0; i < this.ipAddresses.length; i++)
		{
			var ipAddress = this.ipAddresses[i];

			if (!firstIPAddress)
			{
				outputExpression += ', ';
			}

			outputExpression +=
				'"'
				+ ipAddress
				+ '"';

			firstIPAddress = false;
		}

		outputExpression += ']';

		return outputExpression;
	}
}

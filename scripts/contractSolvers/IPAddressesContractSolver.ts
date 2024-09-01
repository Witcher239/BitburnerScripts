import { NS } from '@ns';

import { ContractSolver } from "scripts/contractSolvers/ContractSolver";

export class IPAddressesContractSolver extends ContractSolver
{
	inputExpression = '';

	ipAddresses: string[] = [];

	constructor(
		ns: NS,
		inputExpression: string)
	{
		super(ns);

		this.inputExpression = inputExpression;
	}

	async calculate()
	{
		await this.buildIPAddresses();
	}

	async buildIPAddresses()
	{
		if (this.inputExpression.length >= 4
			&& this.inputExpression.length <= 12)
		{
			await this.recursiveBuildSegments();
		}
	}

	async recursiveBuildSegments(
		segmentNum = 1,
		inputExpression = this.inputExpression,
		unfinishedIPAddress = '')
	{
		await this.ns.sleep(1);

		if (segmentNum == 4)
		{
			if (this.validateSegment(inputExpression))
			{
				this.ipAddresses.push(unfinishedIPAddress + inputExpression);
			}
		}
		else
		{
			for (let i = 1; i < 4; i++)
			{
				let segment = inputExpression.substr(
					0,
					i);

				if (!this.validateSegment(segment))
				{
					break;
				}

				await this.recursiveBuildSegments(
					segmentNum + 1,
					inputExpression.substr(
						i,
						inputExpression.length - i),
					unfinishedIPAddress + segment + '.');
			}
		}
	}

	validateSegment(segment: string)
	{
		let ret = segment != '';

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

	buildResult()
	{
		let outputExpression = '[';

		let firstIPAddress = true;

		for (let i = 0; i < this.ipAddresses.length; i++)
		{
			let ipAddress = this.ipAddresses[i];

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

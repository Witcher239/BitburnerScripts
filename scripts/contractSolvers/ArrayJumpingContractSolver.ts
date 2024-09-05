import { NS } from '@ns';

import { ContractSolver } from "scripts/contractSolvers/ContractSolver";

export class ArrayJumpingContractSolver extends ContractSolver
{
	jumpLengths: number[] = [];

	returnMinJumpsRequired = false;

	minJumpsRequired = 0;

	constructor(
		ns: NS,
		jumpLengths: number[],
		returnMinJumpsRequired: boolean)
	{
		super(ns);

		this.jumpLengths = jumpLengths;

		this.returnMinJumpsRequired = returnMinJumpsRequired;
	}

	async calculate()
	{
		await this.recursiveTryToReachTheEnd();
	}

	async recursiveTryToReachTheEnd(
		startingPositionIndex = 0,
		currentJumpNum = 1)
	{
		await this.ns.sleep(1);

		if (this.canReachTheEndFromPosition(startingPositionIndex))
		{
			if (this.minJumpsRequired == 0
				|| currentJumpNum < this.minJumpsRequired)
			{
				this.minJumpsRequired = currentJumpNum;
			}
		}
		else
		{
			for (let i = 1; i <= this.jumpLengths[startingPositionIndex]; i++)
			{
				await this.recursiveTryToReachTheEnd(
					startingPositionIndex + i,
					currentJumpNum + 1);
			}
		}
	}

	canReachTheEndFromPosition(positionIndex: number)
	{
		return positionIndex + this.jumpLengths[positionIndex] >= this.jumpLengths.length - 1;
	}

	buildResult()
	{
		return this.returnMinJumpsRequired ?
			this.minJumpsRequired :
			Math.min(
				this.minJumpsRequired,
				1);
	}
}

/** @param {NS} ns */

export class ArrayJumpingContractSolver
{
	jumpLengths = [];

	returnMinJumpsRequired = false;

	minJumpsRequired = 0;

	constructor(
		jumpLengths,
		returnMinJumpsRequired)
	{
		this.jumpLengths = jumpLengths;

		this.returnMinJumpsRequired = returnMinJumpsRequired;
	}

	solve()
	{
		this.recursiveTryToReachTheEnd();

		return this.buildOutputExpression();
	}

	recursiveTryToReachTheEnd(
		startingPositionIndex = 0,
		currentJumpNum = 1)
	{
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
			for (var i = 1; i <= this.jumpLengths[startingPositionIndex]; i++)
			{
				this.recursiveTryToReachTheEnd(
					startingPositionIndex + i,
					currentJumpNum + 1);
			}
		}
	}

	canReachTheEndFromPosition(positionIndex)
	{
		return positionIndex + this.jumpLengths[positionIndex] >= this.jumpLengths.length - 1;
	}

	buildOutputExpression()
	{
		return this.returnMinJumpsRequired ?
			this.minJumpsRequired :
			Math.min(
				this.minJumpsRequired,
				1);
	}
}

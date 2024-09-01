import { NS } from '@ns';

export class ContractSolver
{
	ns;

	constructor(ns: NS)
	{
		this.ns = ns;
	}

	async solve()
	{
		await this.calculate();

		return this.buildResult();
	}

	async calculate()
	{

	}

	buildResult()
	{
		return "";
	}
}
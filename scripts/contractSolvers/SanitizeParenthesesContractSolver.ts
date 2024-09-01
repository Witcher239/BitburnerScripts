import { NS } from '@ns';

import { ContractSolver } from "scripts/contractSolvers/ContractSolver";

export class SanitizeParenthesesContractSolver extends ContractSolver
{
	inputExpression = "";

	outputExpressions: string[] = [];

	minNumOfDeletes = 0;

	constructor(
		ns: NS,
		inputExpression: string)
	{
		super(ns);

		this.inputExpression = inputExpression;
	}

	async calculate()
	{
		await this.recursiveOutputExpressionsSearch(this.inputExpression);
	}

	async recursiveOutputExpressionsSearch(expression: string)
	{
		await this.ns.sleep(1);

		let numOfDeletes = this.deletesAmount(expression);

		if (numOfDeletes <= this.minNumOfDeletes
			|| this.outputExpressions.length == 0)
		{
			if (this.validateParentheses(expression))
			{
				if (numOfDeletes == this.minNumOfDeletes)
				{
					if (!this.outputExpressions.includes(expression))
					{
						this.outputExpressions.push(expression);
					}
				}
				else
				{
					this.outputExpressions = [expression];

					this.minNumOfDeletes = numOfDeletes;
				}			
			}
			else
			{
				for (let i = 0; i < expression.length; i++)
				{
					let charachter = expression[i];

					if (charachter == '('
						|| charachter == ')')
					{
						await this.recursiveOutputExpressionsSearch(
							this.removeCharacter(
								expression,
								i));
					}
				}
			}
		}
	}

	deletesAmount(expression: string)
	{
		return this.inputExpression.length - expression.length;
	}

	validateParentheses(expression: string)
	{
		let ret = true;

		let openParentheses = 0;

		for (let i = 0; i < expression.length; i++)
		{
			let character = expression[i];

			if (character == '(')
			{
				openParentheses++;
			}
			else if (character == ')')
			{
				if (openParentheses)
				{
					openParentheses--;
				}
				else
				{
					ret = false;

					break;
				}
			}
		}

		if (ret)
		{
			ret = openParentheses == 0;
		}

		return ret;
	}

	removeCharacter(
		expression: string,
		characterIndex: number)
	{
		let ret = expression.substring(
			0,
			characterIndex);

		if (characterIndex + 1 < expression.length)
		{
			ret += expression.substr(
				characterIndex + 1,
				expression.length);
		}

		return ret;
	}

	buildResult()
	{
		let ret = '[';

		if (this.outputExpressions.length > 0)
		{
			let firstExpression = true;

			for (let i = 0; i < this.outputExpressions.length; i++)
			{
				if (firstExpression)
				{
					firstExpression = false;
				}
				else
				{
					ret += ', ';
				}

				ret += this.outputExpressions[i];
			}
		}
		else
		{
			ret += '""';
		}

		ret += ']';

		return ret;
    }
}

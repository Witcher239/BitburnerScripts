export class SanitizeParenthesesContractSolver
{
	inputExpression = "";

	outputExpressions: string[] = [];

	minNumOfDeletes = 0;

	constructor(inputExpression: string)
	{
		this.inputExpression = inputExpression;
	}

	solve()
	{
		this.searchOutputExpressions();

		return this.outputExpressionsString();
	}

	searchOutputExpressions()
	{
		this.doRecursiveOutputExpressionsSearch(this.inputExpression);
	}

	doRecursiveOutputExpressionsSearch(expression: string)
	{
		var numOfDeletes = this.deletesAmount(expression);

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
				for (var i = 0; i < expression.length; i++)
				{
					var charachter = expression[i];

					if (charachter == '('
						|| charachter == ')')
					{
						this.doRecursiveOutputExpressionsSearch(
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
		var ret = true;

		var openParentheses = 0;

		for (var i = 0; i < expression.length; i++)
		{
			var character = expression[i];

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
		var ret = expression.substring(
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

	outputExpressionsString()
	{
		var ret = '[';

		if (this.outputExpressions.length > 0)
		{
			var firstExpression = true;

			for (var i = 0; i < this.outputExpressions.length; i++)
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

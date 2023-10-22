import { NS } from '@ns';

import { Manager } from "scripts/managers/Manager";

import { StockPriceContractSolver } from "scripts/contractSolvers/StockPriceContractSolver";
import { SanitizeParenthesesContractSolver } from "scripts/contractSolvers/SanitizeParenthesesContractSolver";
import { PrimeFactorContractSolver } from "scripts/contractSolvers/PrimeFactorContractSolver";
import { MaxSumContractSolver } from "scripts/contractSolvers/MaxSumContractSolver";
import { RLECompressionContractSolver } from "scripts/contractSolvers/RLECompressionContractSolver";
import { LZDecompressionContractSolver } from "scripts/contractSolvers/LZDecompressionContractSolver";
import { LZCompressionContractSolver } from "scripts/contractSolvers/LZCompressionContractSolver";
import { IPAddressesContractSolver } from "scripts/contractSolvers/IPAddressesContractSolver";
import { ArrayJumpingContractSolver } from "scripts/contractSolvers/ArrayJumpingContractSolver";

import { getAllServerNames } from "scripts/util/util";

export async function main(ns: NS)
{
	var contractManager = new ContractManager(ns);

	await contractManager.startOperation();
}

export class ContractManager extends Manager
{
	serverNames: string[] = [];

	sendResults = true;

	constructor(ns: NS)
	{
		super(ns);
	}

	disableLogs()
	{
		this.ns.disableLog('scan');
		this.ns.disableLog('ls');
		this.ns.disableLog('codingcontract.getContractType');
		this.ns.disableLog('codingcontract.getData');
	}

	init()
	{
		this.serverNames = getAllServerNames(this.ns);
	}

	async manage()
	{
		for (var i = 0; i < this.serverNames.length; i++)
		{
			var serverName = this.serverNames[i];

			this.solveContractsFromServer(serverName);
		}
	}

	solveContractsFromServer(serverName: string)
	{
		var contractNames = this.ns.ls(
			serverName,
			'.cct');

		for (var j = 0; j < contractNames.length; j++)
		{
			var contractName = contractNames[j];

			this.solveContract(
				serverName,
				contractName);
		}
	}

	solveContract(
		serverName: string,
		contractName: string)
	{
		var contractType = this.ns.codingcontract.getContractType(
			contractName,
			serverName);

		var contractData = this.ns.codingcontract.getData(
			contractName,
			serverName);

		var contractSolver = this.getContractSolver(
			contractType,
			contractData);

		if (contractSolver != null)
		{
			var result = contractSolver.solve();

			this.ns.print(
				'Result of the contract "'
				+ contractName
				+ '" of a type "'
				+ contractType
				+ '" on the server "'
				+ serverName
				+ '" is: '
				+ result);

			if (this.sendResults)
			{
				this.ns.codingcontract.attempt(
					result,
					contractName,
					serverName);
			}
		}
	}

	getContractSolver(
		contractType: string,
		contractData: any)
	{
		this.sendResults = true;

		var contractSolver;

		switch (contractType)
		{
			case 'Algorithmic Stock Trader I':
			
				var prices = contractData;

				contractSolver = new StockPriceContractSolver(
					1,
					prices);

				break;

			case 'Algorithmic Stock Trader II':

				var prices = contractData;

				contractSolver = new StockPriceContractSolver(
					Math.floor(prices.length / 2),
					prices);
					
				break;

			case 'Algorithmic Stock Trader III':

				var prices = contractData;

				contractSolver = new StockPriceContractSolver(
					2,
					prices);
					
				break;

			case 'Algorithmic Stock Trader IV':

				var numOfTransactions = contractData[0];
				var prices = contractData[1];

				contractSolver = new StockPriceContractSolver(
					numOfTransactions,
					prices);
					
				break;

			case 'Sanitize Parentheses in Expression':

				var inputExpression = contractData;

				contractSolver = new SanitizeParenthesesContractSolver(inputExpression);

				break;

			case 'Find Largest Prime Factor':

				var inputNumber = contractData;

				contractSolver = new PrimeFactorContractSolver(inputNumber);

				break;

			case 'Subarray with Maximum Sum':

				var numbers = contractData;

				contractSolver = new MaxSumContractSolver(numbers);

				break;

			case 'Compression I: RLE Compression':

				var inputExpression = contractData;

				contractSolver = new RLECompressionContractSolver(inputExpression);

				break;

			case 'Compression II: LZ Decompression':

				var inputExpression = contractData;

				contractSolver = new LZDecompressionContractSolver(inputExpression);

				break;

			case 'Compression III: LZ Compression':

				var inputExpression = contractData;

				contractSolver = new LZCompressionContractSolver(inputExpression);

				break;

			case 'Generate IP Addresses':

				var inputExpression = contractData;

				contractSolver = new IPAddressesContractSolver(inputExpression);

				break;

			case 'Array Jumping Game':

				var jumpLengths = contractData;

				contractSolver = new ArrayJumpingContractSolver(
					jumpLengths,
					false);

				break;

			case 'Array Jumping Game II':

				var jumpLengths = contractData;

				contractSolver = new ArrayJumpingContractSolver(
					jumpLengths,
					true);

				break;
		}

		return contractSolver;
	}
}

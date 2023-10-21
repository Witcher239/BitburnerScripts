/**@param {NS} ns**/

import {Manager} from "/scripts/managers/Manager.js"

import {StockPriceContractSolver} from "/scripts/contractSolvers/StockPriceContractSolver.js"
import {SanitizeParenthesesContractSolver} from "/scripts/contractSolvers/SanitizeParenthesesContractSolver.js"
import {PrimeFactorContractSolver} from "/scripts/contractSolvers/PrimeFactorContractSolver.js"
import {MaxSumContractSolver} from "/scripts/contractSolvers/MaxSumContractSolver.js"
import {RLECompressionContractSolver} from "/scripts/contractSolvers/RLECompressionContractSolver.js"
import {LZDecompressionContractSolver} from "scripts/contractSolvers/LZDecompressionContractSolver.js"
import {LZCompressionContractSolver} from "scripts/contractSolvers/LZCompressionContractSolver.js"
import {IPAddressesContractSolver} from "/scripts/contractSolvers/IPAddressesContractSolver.js"
import {ArrayJumpingContractSolver} from "/scripts/contractSolvers/ArrayJumpingContractSolver.js"

import {getAllServerNames} from "/scripts/util/util.js"

export async function main(ns)
{
	var contractManager = new ContractManager(ns);

	await contractManager.startOperation();
}

export class ContractManager extends Manager
{
	serverNames = [];

	sendResults = true;

	constructor(ns)
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

	solveContractsFromServer(serverName)
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
		serverName,
		contractName)
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
		contractType,
		contractData)
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

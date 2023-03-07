/**@param {NS} ns**/

import {Manager} from "blob:file:///18e2e5f2-e602-44f8-bd8a-56a1f4bdc174"

import {StockPriceContractSolver} from "blob:file:///13e76d67-59be-4b72-80ef-bd97ee4776ad"
import {SanitizeParenthesesContractSolver} from "blob:file:///aeaf2aa0-3b81-4083-bb36-c04e06fc3bac"
import {PrimeFactorContractSolver} from "blob:file:///bc4b8fd2-cc55-4fca-8b50-a28b3522fa6b"
import {MaxSumContractSolver} from "blob:file:///ab82927d-96a7-4937-92fe-cca21a20eefc"
import {RLECompressionContractSolver} from "blob:file:///08582d04-0887-42b4-a361-dbd4accaad6e"
import {LZDecompressionContractSolver} from "blob:file:///e907fa64-46d1-4770-86b3-788a05fc824f"
import {LZCompressionContractSolver} from "blob:file:///056dcd61-8172-485c-b493-a26aac85b3d4"
import {IPAddressesContractSolver} from "blob:file:///5806fe9f-c10d-4d2a-bfc5-38dbd49ec7c0"
import {ArrayJumpingContractSolver} from "blob:file:///6df08cf6-5d14-4d3f-80e9-47ace8db0617"

import {getAllServerNames} from "blob:file:///8019f9bd-28c3-4a85-bb75-72131bd7b3d1"

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

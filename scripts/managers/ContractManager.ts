import { NS } from '@ns';

import { Manager } from "scripts/managers/Manager";

import { ContractSolver } from "scripts/contractSolvers/ContractSolver";
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
	let contractManager = new ContractManager(ns);

	await contractManager.startOperation();
}

export class ContractManager extends Manager
{
	serverNames: string[] = [];

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
		this.ns.disableLog('sleep');
	}

	init()
	{
		this.serverNames = getAllServerNames(this.ns);
	}

	async manage()
	{
		await this.solveContracts();
	}

	async solveContracts()
	{
		for (let i = 0; i < this.serverNames.length; i++)
		{
			let serverName = this.serverNames[i];

			await this.solveContractsFromServer(serverName);
		}
    }

	async solveContractsFromServer(serverName: string)
	{
		let contractNames = this.ns.ls(
			serverName,
			'.cct');

		for (let j = 0; j < contractNames.length; j++)
		{
			let contractName = contractNames[j];

			await this.solveContract(
				serverName,
				contractName);
		}
	}

	async solveContract(
		serverName: string,
		contractName: string)
	{
		let contractType = this.ns.codingcontract.getContractType(
			contractName,
			serverName);

		let contractData = this.ns.codingcontract.getData(
			contractName,
			serverName);

		let contractSolver = this.getContractSolver(
			contractType,
			contractData);

		if (contractSolver)
		{
			let result = await contractSolver.solve();

			this.ns.print(
				'Result of the contract "'
				+ contractName
				+ '" of a type "'
				+ contractType
				+ '" on the server "'
				+ serverName
				+ '" is: '
				+ result);

			this.ns.codingcontract.attempt(
				result,
				contractName,
				serverName);
		}
	}

	getContractSolver(
		contractType: string,
		contractData: any)
	{
		let contractSolver: ContractSolver | undefined;

		switch (contractType)
		{
			case 'Algorithmic Stock Trader I':
			
				var prices = contractData;

				contractSolver = new StockPriceContractSolver(
					this.ns,
					1,
					prices);

				break;

			case 'Algorithmic Stock Trader II':

				var prices = contractData;

				contractSolver = new StockPriceContractSolver(
					this.ns,
					Math.floor(prices.length / 2),
					prices);
					
				break;

			case 'Algorithmic Stock Trader III':

				var prices = contractData;

				contractSolver = new StockPriceContractSolver(
					this.ns,
					2,
					prices);
					
				break;

			case 'Algorithmic Stock Trader IV':

				var numOfTransactions = contractData[0];
				var prices = contractData[1];

				contractSolver = new StockPriceContractSolver(
					this.ns,
					numOfTransactions,
					prices);
					
				break;

			case 'Sanitize Parentheses in Expression':

				var inputExpression = contractData;

				contractSolver = new SanitizeParenthesesContractSolver(
					this.ns,
					inputExpression);

				break;

			case 'Find Largest Prime Factor':

				var inputNumber = contractData;

				contractSolver = new PrimeFactorContractSolver(
					this.ns,
					inputNumber);

				break;

			case 'Subarray with Maximum Sum':

				var numbers = contractData;

				contractSolver = new MaxSumContractSolver(
					this.ns,
					numbers);

				break;

			case 'Compression I: RLE Compression':

				var inputExpression = contractData;

				contractSolver = new RLECompressionContractSolver(
					this.ns,
					inputExpression);

				break;

			case 'Compression II: LZ Decompression':

				var inputExpression = contractData;

				contractSolver = new LZDecompressionContractSolver(
					this.ns,
					inputExpression);

				break;

			case 'Compression III: LZ Compression':

				var inputExpression = contractData;

				contractSolver = new LZCompressionContractSolver(
					this.ns,
					inputExpression);

				break;

			case 'Generate IP Addresses':

				var inputExpression = contractData;

				contractSolver = new IPAddressesContractSolver(
					this.ns,
					inputExpression);

				break;

			case 'Array Jumping Game':

				var jumpLengths = contractData;

				contractSolver = new ArrayJumpingContractSolver(
					this.ns,
					jumpLengths,
					false);

				break;

			case 'Array Jumping Game II':

				var jumpLengths = contractData;

				contractSolver = new ArrayJumpingContractSolver(
					this.ns,
					jumpLengths,
					true);

				break;
		}

		return contractSolver;
	}
}

import { NS } from '@ns';

import { getAllServerNames } from "scripts/util/util";

export async function main(ns: NS)
{
	var showAllInformation =
		ns.args[0] != null
		&& ns.args[0].toString() == "all";

	var totalNumberOfContracts = 0;

	var numberOfContractsByType = new Map<string, number>();

	var serverNames = getAllServerNames(ns).sort();

	for (var i = 0; i < serverNames.length; i++)
	{
		var serverName = serverNames[i];

		var contractNames = ns.ls(
			serverName,
			".cct");

		for (var j = 0; j < contractNames.length; j++)
		{
			var contractName = contractNames[j];

			var contractType = ns.codingcontract.getContractType(
				contractName,
				serverName);

			numberOfContractsByType.set(
				contractType,
				numberOfContractsByType.has(contractType) ?
					numberOfContractsByType.get(contractType)! + 1 :
					1);

			if (showAllInformation)
			{
				ns.tprint(
					"Server '"
					+ serverName
					+ "' contains contract '"
					+ contractName
					+ "' of type '"
					+ contractType
					+ "'");
            }
		}

		totalNumberOfContracts += contractNames.length;
	}

	if (!showAllInformation)
	{
		numberOfContractsByType.forEach(
			(numberOfContracts: number,
			contractType: string) =>
		{
			ns.tprint(
				"Contract type: '"
				+ contractType
				+ "'. Number of contracts: "
				+ numberOfContracts);
		});
	}

	ns.tprint(
		"Total contracts found: "
		+ totalNumberOfContracts);
}

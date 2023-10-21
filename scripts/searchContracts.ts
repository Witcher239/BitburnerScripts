/** @param {NS} ns */

import {getAllServerNames} from "scripts/util/util"

export async function main(ns)
{
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

			ns.tprint(
				"Server '"
				+ serverName
				+ "' contains contract '"
				+ contractName
				+ "' of type '"
				+ ns.codingcontract.getContractType(
					contractName,
					serverName)
				+ "'");
		}
	}
}

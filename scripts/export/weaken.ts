import { NS } from '@ns';

export async function main(ns: NS)
{
	var targetServerName = ns.args[0].toString();

	await ns.weaken(targetServerName);
}

/** @param {NS} ns */

export async function main(ns)
{
	var targetServerName = ns.args[0];

	await ns.grow(targetServerName);
}

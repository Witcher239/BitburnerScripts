import { NS } from '@ns';

export async function main(ns: NS)
{
	var fileName = ns.args[0].toString();

	ns.tprint(ns.read(fileName));
}
import { NS } from '@ns';

export async function main(ns: NS)
{
	var selectedFactions = ns.args[0].toString();

	ns.write(
		'settings/SelectedFactions.txt',
		selectedFactions,
		'w');
}
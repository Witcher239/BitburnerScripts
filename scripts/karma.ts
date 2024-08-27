import { NS } from '@ns';

export async function main(ns: NS)
{
	ns.toast(
		ns.heart.break().toString(),
		"info");
}

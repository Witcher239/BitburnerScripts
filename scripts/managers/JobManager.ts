import { CompanyName, JobName, NS } from '@ns';

import { Manager } from "scripts/managers/Manager";

export async function main(ns: NS)
{
	var jobManager = new JobManager(ns);

	await jobManager.startOperation();
}

export class JobManager extends Manager
{
	constructor(ns: NS)
	{
		super(ns);
	}

	async manage()
	{
		this.getPromotions();
	}

	getPromotions()
	{
		var currentJobs = this.ns.getPlayer().jobs;

		Object.entries(currentJobs).forEach(([companyName, jobName]) =>
		{
			var currentPositionInfo = this.ns.singularity.getCompanyPositionInfo(
				companyName as CompanyName,
				jobName);

			var nextJobName = currentPositionInfo.nextPosition;

			if (nextJobName != null
				&& this.canGetJob(
						companyName as CompanyName,
						nextJobName))
			{
				this.ns.singularity.applyToCompany(
					companyName as CompanyName,
					currentPositionInfo.field);
            }
		});
	}

	canGetJob(
		companyName: CompanyName,
		jobName: JobName)
	{
		var ret = false;

		var playerSkills = this.ns.getPlayer().skills;

		var positionInfo = this.ns.singularity.getCompanyPositionInfo(
			companyName,
			jobName);

		if (positionInfo.requiredReputation <= this.ns.singularity.getCompanyRep(companyName)
			&& positionInfo.requiredSkills.hacking <= playerSkills.hacking
			&& positionInfo.requiredSkills.strength <= playerSkills.strength
			&& positionInfo.requiredSkills.defense <= playerSkills.defense
			&& positionInfo.requiredSkills.dexterity <= playerSkills.dexterity
			&& positionInfo.requiredSkills.agility <= playerSkills.agility
			&& positionInfo.requiredSkills.charisma <= playerSkills.charisma)	
		{
			ret = true;
        }

		return ret;
	}
}
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
					this.getFieldOfWork(nextJobName));
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

	getFieldOfWork(jobName: JobName)
	{
		var fieldOfWork = '';

		switch (jobName)
		{
			case this.ns.enums.JobName.software0:
			case this.ns.enums.JobName.software1:
			case this.ns.enums.JobName.software2:
			case this.ns.enums.JobName.software3:
			case this.ns.enums.JobName.software4:
			case this.ns.enums.JobName.software5:
			case this.ns.enums.JobName.software6:
			case this.ns.enums.JobName.software7:

				fieldOfWork = 'software';

				break;

			case this.ns.enums.JobName.IT0:
			case this.ns.enums.JobName.IT1:
			case this.ns.enums.JobName.IT2:
			case this.ns.enums.JobName.IT3:

				fieldOfWork = 'it';

				break;

			case this.ns.enums.JobName.securityEng:

				fieldOfWork = 'security engineer';

				break;

			case this.ns.enums.JobName.networkEng0:
			case this.ns.enums.JobName.networkEng1:

				fieldOfWork = 'network engineer';

				break;

			case this.ns.enums.JobName.business0:
			case this.ns.enums.JobName.business1:
			case this.ns.enums.JobName.business2:
			case this.ns.enums.JobName.business3:
			case this.ns.enums.JobName.business4:
			case this.ns.enums.JobName.business5:

				fieldOfWork = 'business';

				break;

			case this.ns.enums.JobName.security0:
			case this.ns.enums.JobName.security1:
			case this.ns.enums.JobName.security2:
			case this.ns.enums.JobName.security3:

				fieldOfWork = 'security';

				break;

			case this.ns.enums.JobName.agent0:
			case this.ns.enums.JobName.agent1:
			case this.ns.enums.JobName.agent2:

				fieldOfWork = 'agent';

				break;

			case this.ns.enums.JobName.waiter:

				fieldOfWork = 'waiter';

				break;

			case this.ns.enums.JobName.employee:

				fieldOfWork = 'employee';

				break;

			case this.ns.enums.JobName.softwareConsult0:
			case this.ns.enums.JobName.softwareConsult1:

				fieldOfWork = 'software consultant';

				break;

			case this.ns.enums.JobName.businessConsult0:
			case this.ns.enums.JobName.businessConsult1:

				fieldOfWork = 'business consultant';

				break;

			case this.ns.enums.JobName.waiterPT:

				fieldOfWork = 'part-time waiter';

				break;

			case this.ns.enums.JobName.employeePT:

				fieldOfWork = 'part-time employee';

				break;
        }

		return fieldOfWork;
    }
}
/**@param {NS} ns**/

export class Manager
{
	ns;

	waitTime = 60000;

	constructor(ns)
	{
		this.ns = ns;
	}

	async startOperation()
	{
		if (!this.validate())
		{
			return;
		}

		this.disableLogs();

		this.init();

		while (true)
		{
			await this.manage();

			if (this.shouldStopOperation())
			{
				this.setFlags();

				break;
			}
			else if (this.waitTime > 0)
			{
				await this.ns.sleep(this.waitTime);
			}
		}
	}

	validate()
	{
		return true;
	}

	disableLogs()
	{

	}

	init()
	{
		
	}

	async manage()
	{
		
	}

	shouldStopOperation()
	{
		return false;
	}

	setFlags()
	{

	}
}

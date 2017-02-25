import '/src/util.js';

export class BaseClass
{
	constructor(options)
	{
		this.options = Util.extend(this.defaultOptions, options);
		this.vars = {};
	}

	option(name, value)
	{
		if(value === undefined)
		{
			return name in this.options ? this.options[name] : null;
		}
		else
		{
			this.options[name] = value;
		}
	}

	get defaultOptions()
	{
		return {};
	}
}
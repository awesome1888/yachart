import '/src/util.js';

export class Animation
{
	constructor(options = {})
	{
		//super();

		this.opts = {
			cb: function(){},
			duration: options.duration || 1000,
			tag: Util.randomInt(),
			start: {},
			end: {},
		};

		// if(Util.isArray(this.opts.duration))
		// {
		// 	this.opts.duration = _.random(this.opts.duration[0], this.opts.duration[1]);
		// }

		this.vars = {
			step: 0,
			current: this.opts.start
		};

		this.vars.steps = Math.ceil(this.opts.duration / this.flow.frameRate());
		this.vars.increments = this.calcIncrements();
	}

	/**
	 * @access private
	 * @returns {{}}
	 */
	calcIncrements()
	{
		let start = this.opts.start;
		let end = this.opts.end;
		let deltas = {};

		for(let k in start)
		{
			if(start.hasOwnProperty(k))
			{
				if(k in end)
				{
					deltas[k] = (end[k] - start[k]) / this.vars.steps;
				}
			}
		}

		return deltas;
	}

	/**
	 * @access private
	 */
	applyIncrements()
	{
		for(let k in this.vars.increments)
		{
			if(this.vars.increments.hasOwnProperty(k))
			{
				this.vars.current[k] += this.vars.increments[k];
			}
		}
	}

	nextFrame()
	{
		this.vars.step++;

		let isLastFrame = this.vars.step == this.vars.steps;
		let stepData = {};
		if(isLastFrame)
		{
			stepData = this.opts.end;
		}
		else
		{
			this.applyIncrements();
			stepData = this.vars.current;
		}

		this.opts.cb.apply(this, [stepData]);

		return isLastFrame;
	}

	get tag()
	{
		return this.opts.tag;
	}

	get flow()
	{
		return this.vars.flow;
	}

	set flow(flow)
	{
		this.vars.flow = flow || null;
	}

	get promise()
	{
		if(!this.vars.promise)
		{
			this.vars.promise = new Util.Promise();
		}

		return this.vars.promise;
	}
}
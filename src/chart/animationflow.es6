YAChart.AnimationFlow = class
{
	constructor()
	{
		this.vars = {
			pool: {},
			order: [],
			frameRate: 20,
			lastFrameAt: (new Date()).getSeconds(),
			tickThis: this.tick.bind(this),
			tickRequest: null,
			chart: null,
			date: new Date()
		};
	}

	get frameRate()
	{
		return this.vars.frameRate;
	}

	startTicking()
	{
		if(this.vars.tickRequest === null)
		{
			this.vars.tickRequest = window.requestAnimationFrame(this.vars.tickThis);
		}
	}

	stopTicking()
	{
		if(this.vars.tickRequest !== null)
		{
			window.cancelAnimationFrame(this.vars.tickRequest);
		}
		this.vars.tickRequest = null;
	}

	tick(time)
	{
		if(time - this.vars.lastFrameAt > this.vars.frameRate)
		{
			let len = this.vars.order.length;

			//console.dir('tick: dT = '+(time - this.vars.lastFrameAt)+' stack size='+len);

			let animation = null;
			let done = [];
			for(let k = 0; k < len; k++)
			{
				animation = this.vars.pool[this.vars.order[k]];
				if(animation.nextFrame() === true)
				{
					done.push(animation.getTag());
				}
			}

			for(k = 0; k < done.length; k++)
			{
				this.done(done[k], true);
			}

			this.parent.renderFrame();

			this.vars.lastFrameAt = time;
		}

		if(this.vars.tickRequest !== null) // we need to continue chaining
		{
			this.vars.tickRequest = window.requestAnimationFrame(this.vars.tickThis);
		}
	}

	add(params)
	{
		params.parent = this;
		let animation = new AW.UI.Chart.Flow.Task(params);
		let tag = animation.getTag();

		this.vars.pool[tag] = animation;
		this.vars.order.push(tag);

		this.startTicking();

		return animation.getPromise();
	}

	done(tag, how)
	{
		if(!this.vars.pool[tag])
		{
			return; // no such animation
		}

		let p = this.vars.pool[tag].getPromise();
		if(how)
		{
			p.resolve();
		}
		else
		{
			p.reject();
		}

		delete(this.vars.pool[tag]);
		_.pull(this.vars.order, tag);

		if(!this.vars.order.length)
		{
			this.stopTicking();
		}

		return this;
	}

	get parent()
	{
		return this.vars.parent;
	}

	set parent(parent)
	{
		this.vars.parent = parent || null;
	}
}
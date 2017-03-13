import {Animation} from '/src/chart/fx/animation.es6';

export class Flow
{
	constructor()
	{
		this.vars = {
			pool: {},
			order: [],
			frameRate: 20,
			lastFrameAt: (new Date()).getSeconds(),
			tickRequest: null,
			chart: null,
			date: new Date()
		};

		this.tick = this.tick.bind(this);
	}

	get frameRate()
	{
		return this.vars.frameRate;
	}

	startTicking()
	{
		if(this.vars.tickRequest === null)
		{
			this.vars.tickRequest = window.requestAnimationFrame(this.tick);
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
					done.push(animation.tag);
				}
			}

			for(let k = 0; k < done.length; k++)
			{
				this.done(done[k], true);
			}

			this.parent.renderFrame();

			this.vars.lastFrameAt = time;
		}

		if(this.vars.tickRequest !== null) // we need to continue chaining
		{
			this.vars.tickRequest = window.requestAnimationFrame(this.tick);
		}
	}

	add(params)
	{
		let animation = new Animation(params);
		animation.flow = this;

		let tag = animation.tag;

		this.done(tag, false); // kill previous animation, if any

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

	get grid()
	{
		return this.vars.grid;
	}

	set grid(grid)
	{
		this.vars.grid = grid || null;
	}
};
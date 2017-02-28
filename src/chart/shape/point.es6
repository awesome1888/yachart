import {BaseClass} from '/src/util/baseclass.es6';
import '/src/util.js';

export class Point extends BaseClass
{
	constructor(options)
	{
		super(options);

		this.x = options.x;
		this.y = options.y;
	}

	render(grid)
	{
		throw new Error();
	}

	appear()
	{
		let p = new Util.Promise();
		p.resolve();

		return p;
	}

	disappear()
	{
		let p = new Util.Promise();
		p.resolve();

		return p;
	}

	get location()
	{
		return {x: this.x, y: this.y};
	}

	get x()
	{
		return this.vars.x;
	}
	get y()
	{
		return this.vars.y;
	}
	set x(x)
	{
		this.vars.x = x || 0;
	}
	set y(y)
	{
		this.vars.y = y || 0;
	}
}
import {BaseClass} from '/src/util/baseclass.es6';
import '/src/util.js';

export class Point extends BaseClass
{
	constructor(options)
	{
		super(options);

		this.x = options.x;
		this.y = options.y;

		this.grid = options.grid || null;
	}

	render(parameters)
	{
		throw new Error();
	}

	get coordinates()
	{
		return this.grid.data2Pixel(this);
	}

	get coordinatesCenter00()
	{
		return this.grid.data2Pixel(this, {center: {x: 0, y: 0}});
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

	get bounds()
	{
		let coordinates = this.coordinates;
		return [coordinates, coordinates];
	}

	get boundsCenter00()
	{
		let coordinates = this.coordinatesCenter00;
		return [coordinates, coordinates];
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
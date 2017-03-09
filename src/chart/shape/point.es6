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

	getPixel(parameters)
	{
		return this.grid.data2Pixel(this, parameters);
	}

	get pixel()
	{
		return this.grid.data2Pixel(this);
	}

	getPixelRelative(parameters)
	{
		return this.grid.data2PixelRelative(this, parameters);
	}

	get pixelRelative()
	{
		return this.grid.data2PixelRelative(this);
	}

	get pixelRelativeMeasuresDefault()
	{
		return this.grid.data2PixelRelative(this, {unitSize: this.grid.defaultUnitSize});
	}

	get isVisible()
	{
		return this.grid.isVisible(this.pixel);
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

	// get bounds()
	// {
	// 	let coordinates = this.coordinates;
	// 	return [coordinates, coordinates];
	// }
	//
	// get boundsCenter00()
	// {
	// 	let coordinates = this.coordinatesCenter00;
	// 	return [coordinates, coordinates];
	// }

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
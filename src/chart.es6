import {BaseClass} from '/src/util/baseclass.es6';
import {Manager as PointManager} from '/src/chart/point/manager.es6';

export class Chart extends BaseClass
{
	constructor(options)
	{
		super(options);

		this.addPoints(this.option('data'));
		this.render();
	}

	get defaultOptions()
	{
		return {
			scope: null,
			fit: 'fit', // also 'fit-x', 'fit-y'
			align: 'topRight', // also 'topLeft', 'bottomRight', 'bottomLeft'
			unitSize: 10, // in pixels
			data: [],
		};
	}

	render()
	{
		//layers
	}

	addPoints(data)
	{
		for(let item in data)
		{
			if(data.hasOwnProperty(item))
			{
				this.addPoint(data[item]);
			}
		}
	}

	addPoint(data)
	{
		this.points.add(data);
	}

	get points()
	{
		if(this.vars.points === undefined)
		{
			this.vars.points = new PointManager();
		}

		return this.vars.points;
	}

	get scope()
	{
		return this.option('scope');
	}
}
import {Iterable} from '/src/util/iterable.es6';
import {Circle} from '/src/chart/shape/circle.es6';
import '/src/util.js';

export class Manager extends Iterable
{
	constructor()
	{
		super();
	}

	add(data)
	{
		let params = {grid: data.grid};
		let type = 'circle'; // by default
		if(Util.isArray(data))
		{
			params.x = data[0];
			params.y = data[1];
			if(data[2])
			{
				type = data[2];
			}
		}

		if(type)
		{
			if(type.toLowerCase() === 'circle')
			{
				super.push(new Circle(params));
			}
		}

		// todo: throw an error?
	}
}
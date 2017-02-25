import {Iterable} from '/src/util/iterable.es6';
import {Point} from '/src/chart/point.es6';

export class Manager extends Iterable
{
	constructor()
	{
		super();
	}

	add(data)
	{
		super.push(new Point(data));
	}
}
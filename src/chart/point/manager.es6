import {Iterable} from '/src/util/iterable.es6';
import {Circle} from '/src/chart/shape/circle.es6';
import '/src/util.js';

export class Manager extends Iterable
{
	constructor()
	{
		super();

		this.clearCaches();
	}

	clearCaches()
	{
		this.vars.caches = {x: null};
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

		let x = params.x;
		let existing = this.findItemByX(x);
		if(existing)
		{
			existing.y = params.y;
		}
		else
		{
			if(type)
			{
				if(type.toLowerCase() === 'circle')
				{
					super.push(new Circle(params));
				}
			}
		}
	}

	findItemByX(x)
	{
		return this.vars.values[x];
	}

	/**
	 *
	 * @param parameters
	 * @returns {{square: [*,*,*,*], size: {w: number, h: number}}}
	 */
	getDataBounds(parameters = {})
	{
		let bounds = {square: [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}], size: {w: 0, h: 0}};

		if(this.count)
		{
			let firstPx = this.first.getPixelRelative(parameters);
			let lastPx = this.last.getPixelRelative(parameters);

			bounds.square[0].x = firstPx.x;
			bounds.square[3].x = firstPx.x;

			bounds.square[1].x = lastPx.x;
			bounds.square[2].x = lastPx.x;

			bounds.size.w = lastPx.x - firstPx.x;

			let minY = null;
			let maxY = null;
			let itemPx = null;

			this.each(function(item){

				itemPx = item.getPixelRelative(parameters);

				if(minY === null || minY > itemPx.y)
				{
					minY = itemPx.y;
				}
				if(maxY === null || maxY < itemPx.y)
				{
					maxY = itemPx.y;
				}
			});

			bounds.square[0].y = maxY;
			bounds.square[1].y = maxY;

			bounds.square[2].y = minY;
			bounds.square[3].y = minY;

			bounds.size.h = maxY - minY;
		}

		return bounds;
	}
}
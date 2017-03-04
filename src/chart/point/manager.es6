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

	/**
	 *
	 * @returns {{square: [*,*], size: {w: number, h: number}}}
	 */
	get dataBounds()
	{
		let bounds = {square: [{x: 0, y: 0}, {x: 0, y: 0}], size: {w: 0, h: 0}};

		if(this.count)
		{
			let firstPx = this.first.pixelRelativeMeasuresDefault;
			let lastPx = this.last.pixelRelativeMeasuresDefault;

			bounds.square[0].x = firstPx.x;
			bounds.square[1].x = lastPx.x;
			bounds.size.w = lastPx.x - firstPx.x;

			let minY = null;
			let maxY = null;
			let itemPx = null;

			this.each(function(item){

				itemPx = item.pixelRelativeMeasuresDefault;

				if(minY === null || minY > itemPx.y)
				{
					minY = itemPx.y;
				}
				if(maxY === null || maxY < itemPx.y)
				{
					maxY = itemPx.y;
				}
			});

			bounds.square[0].y = minY;
			bounds.square[1].y = maxY;
			bounds.size.h = maxY - minY;
		}

		return bounds;
	}
}
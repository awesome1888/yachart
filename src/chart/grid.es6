/**
 * This class takes care about conversion between data points into canvas points
 */

import {BaseClass} from '/src/util/baseclass.es6';
import {Manager as PointManager} from '/src/chart/point/manager.es6';
import {Canvas} from '/src/chart/canvas.es6';

export class Grid extends BaseClass
{
	constructor(options)
	{
		super(options);

		this.clearCaches();
		this.bindEvent('click', this.onClick.bind(this));
	}

	get defaultOptions()
	{
		return {
			fit: 'fit-y', // also 'fit', 'fit-x'
			align: 'left', // also 'right', 'right-when-overflow'
			unitSize: 10, // in pixels
			minGridSpace: 20,
		};
	}

	clearCaches()
	{
		this.center = null;
		this.unitSize = null;
	}

	clearCanvasCaches()
	{
		this.canvas.clearCaches();
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
		this.clearCaches();

		data.grid = this;
		this.points.add(data);
	}

	render(ifResized)
	{
		if(ifResized)
		{
			this.clearCanvasCaches();
			this.clearCaches();
			if(this.canvas.fit(this.option('container')))
			{
				this.renderLayers();
			}
		}
		else
		{
			this.renderLayers();
		}
	}

	renderLayers()
	{
		this.canvas.clear();

		this.renderGridUnitLines();
		this.renderGridAxis();

		this.renderData();
		this.renderGridBorder();
	}

	renderGridBorder()
	{
		this.canvas.rectangle(this.topLeft, {w: this.widthPadded, h: this.heightPadded}, {
			color: '#000000',
		});
	}

	renderGridUnitLines()
	{
		let center = this.center;
		let rightX = this.rightX;
		let leftX = this.leftX;
		let topY = this.topY;
		let bottomY = this.bottomY;

		// vertical to right
		this.renderGridLineSequence(
			center.x + this.paddingLeft,
			rightX,
			true, true, topY, bottomY, true
		);

		// vertical to left
		this.renderGridLineSequence(
			center.x + this.paddingLeft,
			leftX,
			false, true, topY, bottomY, true
		);

		// horizontal to top
		this.renderGridLineSequence(
			this.height - center.y - this.paddingBottom,
			topY,
			false, false, leftX, rightX, false
		);

		// horizontal to bottom
		this.renderGridLineSequence(
			this.height - center.y - this.paddingBottom,
			bottomY,
			true, false, leftX, rightX, false
		);
	}

	renderGridLineSequence(start, end, way, hWay, hWayStart, hWayEnd, wayOrient)
	{
		let step = this.unitSize;
		let dStep = way ? step : -step;
		let minRange = this.option('minGridSpace');
		let range = 0;

		let paddingLeft = this.paddingLeft;
		let paddingTop = this.paddingTop;
		let width = this.widthPadded;
		let height = this.heightPadded;

		//let count = 0;

		for(let offset = start; (way ? offset <= end : offset >= end); offset += dStep, range += step)
		{
			if(way) // vertical
			{
				if(offset < paddingLeft || offset > paddingLeft + width)
				{
					continue;
				}
			}
			else
			{
				if(offset < paddingTop || offset > paddingTop + height)
				{
					continue;
				}
			}

			//count++;

			if(range > minRange)
			{
				this.canvas.line(
					hWay ? {x: offset, y: hWayStart} : {x: hWayStart, y: offset},
					hWay ? {x: offset, y: hWayEnd} : {x: hWayEnd, y: offset},
					{color: 'lightgray'}
				);
				range = 0;
			}
		}

		//console.dir(count);
	}

	renderGridAxis()
	{
		let paddingLeft = this.paddingLeft;
		let paddingTop = this.paddingTop;
		let width = this.widthPadded;
		let height = this.heightPadded;

		let chl = this.centerHeightLeft;
		let chr = this.centerHeightRight;

		// horizontal
		if(chl.x >= paddingLeft && chl.x <= paddingLeft + width)
		{
			this.canvas.line(chl, chr);
		}

		let cwt = this.centerWidthTop;
		let cwb = this.centerWidthBottom;

		// vertical
		if(cwt.y >= paddingTop && cwt.y <= paddingTop + height)
		{
			this.canvas.line(cwt, cwb);
		}
	}

	renderData()
	{
		this.points.each(function(item, key, extra){
			item.render(extra);
		}.bind(this));
	}

	onClick(coords, coordsGlobal)
	{
		// paddings already excluded
		let data = this.pixel2Data(coordsGlobal, {paddingTop: 0, paddingBottom: 0});

		this.addPoint(data);

		//console.dir('Click: '+coordsGlobal.x+' : '+coordsGlobal.y+' => '+data.x+' : '+data.y);
	}

	onCanvasClick(coords)
	{
		if(coords.x >= this.paddingLeft && coords.x <= this.paddingLeft + this.widthPadded)
		{
			if(coords.y >= this.paddingTop && coords.y <= this.paddingTop + this.heightPadded)
			{
				this.fireEvent('click', [{x: coords.x - this.paddingLeft, y: coords.y - this.paddingTop}, coords]);
			}
		}
	}

	/**
	 * Map data values into canvas absolute pixels
	 * @param point
	 * @param parameters
	 * @returns {{x: number, y: number}}
	 */
	data2Pixel(point, parameters = {})
	{
		let unit = parameters.unitSize || this.unitSize;
		let center = parameters.center || this.center;

		return {
			x: center.x + this.paddingLeft + point.x * unit,
			y: (this.height - this.paddingBottom - center.y) - point.y * unit
		};
	}

	data2PixelRelative(point, parameters = {})
	{
		let unit = parameters.unitSize || this.unitSize;
		return {
			x: point.x * unit,
			y: point.y * unit
		};
	}

	/**
	 * Map canvas absolute pixels into data values
	 * @param point
	 * @param parameters
	 * @returns {{x: number, y: number}}
	 */
	pixel2Data(point, parameters = {})
	{
		let unit = parameters.unitSize || this.unitSize;
		let center = parameters.center || this.center;
		let paddingBottom = parameters.paddingBottom || this.paddingBottom;
		let paddingLeft = parameters.paddingLeft || this.paddingLeft;

		// Math.floor((point.y) / unit)

		return {
			x: Math.floor((point.x - center.x - paddingLeft) / unit),
			y: Math.floor((this.height - paddingBottom - center.y - point.y) / unit)
		};
	}

	/**
	 * Maps pixels relative to the bottom left corner of the grid (including paddings) to canvas absolute pixels
	 * @param point
	 * @returns {{x: number, y: number}}
	 */
	relativePixelToPixel(point)
	{
		return {x: this.paddingLeft + point.x, y: this.paddingTop + this.heightPadded - point.y};
	}

	/**
	 * Maps canvas absolute pixels to pixels relative to the bottom left corner of the grid (including paddings)
	 * @param point
	 * @returns {{x: number, y: number}}
	 */
	pixelToRelativePixel(point)
	{
		return {x: point.x - this.paddingLeft, y: (this.paddingTop + this.heightPadded) - point.y};
	}

	/**
	 * Set center pixel coordinates WITHOUT paddings
	 * @param {x: number, y: number}|null point
	 */
	set center(point)
	{
		this.vars.center = point;
	}

	/**
	 * Get center pixel coordinates WITHOUT paddings
	 * @returns {x: number, y: number}|null
	 */
	get center()
	{
		if(this.vars.center !== null)
		{
			return this.vars.center;
		}

		let couple = this.defineCenterAndUnitSize();
		this.vars.center = couple.center;

		return this.vars.center;
	}

	get defaultCenter()
	{
		return {x: 0, y: 0};
	}

	set unitSize(size)
	{
		this.vars.unitSize = size;
	}

	get unitSize()
	{
		if(this.vars.unitSize !== null)
		{
			return this.vars.unitSize;
		}

		let couple = this.defineCenterAndUnitSize();
		this.vars.unitSize = couple.unitSize;

		return this.vars.unitSize;
	}

	get defaultUnitSize()
	{
		return this.option('unitSize') || 10;
	}

	defineCenterAndUnitSize()
	{
		let pair = {center: this.defaultCenter, unitSize: this.defaultUnitSize};
		let fit = this.option('fit');
		let align = this.option('align');

		let fitAll = fit === 'fit';
		let fitX = fit === 'fit-x';
		let fitY = fit === 'fit-y';

		if(fitAll || fitX || fitY)
		{
			if(this.points.count)
			{
				let width = this.widthPadded;
				let height = this.heightPadded;

				let bounds = this.points.getDataBounds(pair);

				let k = 1;

				if(fitAll || fitX)
				{
					if(width <= bounds.size.w)
					{
						k = width / bounds.size.w;
					}
				}

				if(fitAll || fitY)
				{
					let newHeight = k * bounds.size.h;
					if(height <= newHeight)
					{
						k = k * (height / newHeight);
					}
				}

				if(k !== 1)
				{
					pair.unitSize = k * this.defaultUnitSize;
					bounds = this.points.getDataBounds(pair); // re-obtain bounds for new unitSize
				}

				// move center to match bounds

				if(fitAll || fitX)
				{
					pair.center.x = pair.center.x - bounds.square[3].x;

					if(fitX)
					{
						// do smth with Y
					}
				}
				if(fitAll || fitY)
				{
					pair.center.y = pair.center.y - bounds.square[3].y;

					if(fitY)
					{
						// do smth with X
						if(bounds.size.w <= this.widthPadded || align === 'left')
						{
							pair.center.x = pair.center.x - bounds.square[3].x;
						}
						else if(align === 'right-when-overflow')
						{
							let diffX = this.widthPadded - bounds.square[1].x;
							pair.center.x = pair.center.x + diffX;
						}
					}
				}
			}
		}

		return pair;
	}

	get height()
	{
		return this.canvas.height;
	}

	get heightPadded()
	{
		return this.canvas.height - this.paddingTop - this.paddingBottom;
	}

	get width()
	{
		return this.canvas.width;
	}

	get widthPadded()
	{
		return this.canvas.width - this.paddingLeft - this.paddingRight;
	}

	get topY()
	{
		return this.paddingTop;
	}

	get bottomY()
	{
		return this.paddingTop + this.heightPadded;
	}

	get rightX()
	{
		return this.width - this.paddingRight;
	}

	get leftX()
	{
		return this.paddingLeft;
	}

	get topLeft()
	{
		return {x: this.paddingLeft, y: this.topY};
	}

	get topRight()
	{
		return {x: this.paddingLeft + this.widthPadded, y: this.topY};
	}

	get bottomLeft()
	{
		return {x: this.paddingLeft, y: this.bottomY};
	}

	get bottomRight()
	{
		return {x: this.paddingLeft + this.widthPadded, y: this.bottomY};
	}

	get centerHeightLeft()
	{
		return {x: this.paddingLeft, y: this.height - this.paddingBottom - this.center.y};
	}

	get centerHeightRight()
	{
		return {x: this.paddingLeft + this.widthPadded, y: this.height - this.paddingBottom - this.center.y};
	}

	get centerWidthTop()
	{
		return {x: this.paddingLeft + this.center.x, y: this.paddingTop};
	}

	get centerWidthBottom()
	{
		return {x: this.paddingLeft + this.center.x, y: this.height - this.paddingBottom};
	}

	get canvas()
	{
		if(this.vars.canvas === undefined)
		{
			let canvas = new Canvas(this.option('container').querySelector('canvas'));
			//Util.bindEvent(canvas, 'canvasMouseMove', this.onCanvasMouseMove.bind(this));
			Util.bindEvent(canvas, 'canvasClick', this.onCanvasClick.bind(this));

			this.vars.canvas = canvas;
		}

		return this.vars.canvas;
	}

	get points()
	{
		if(this.vars.points === undefined)
		{
			this.vars.points = new PointManager();
		}

		return this.vars.points;
	}

	////////////////////////////////////
	// animated properties below

	// paddings

	get padding()
	{
		return {
			t: this.paddingTop,
			b: this.paddingBottom,
			l: this.paddingLeft,
			r: this.paddingRight
		};
	}

	get paddingTop()
	{
	    return this.vars.paddingTop || 0;
	}

	// animated version
	set paddingTop(value)
	{
	    this.vars.paddingTop = value;
	}

	set paddingTopInstant(value)
	{
		this.vars.paddingTop = value;
	}

	get paddingBottom()
	{
	    return this.vars.paddingBottom || 0;
	}

	// animated version
	set paddingBottom(value)
	{
	    this.vars.paddingBottom = value;
	}

	set paddingBottomInstant(value)
	{
		this.vars.paddingBottom = value;
	}

	get paddingLeft()
	{
	    return this.vars.paddingLeft || 0;
	}

	// animated version
	set paddingLeft(value)
	{
	    this.vars.paddingLeft = value;
	}

	set paddingLeftInstant(value)
	{
		this.vars.paddingLeft = value;
	}

	get paddingRight()
	{
	    return this.vars.paddingRight || 0;
	}

	// animated version
	set paddingRight(value)
	{
	    this.vars.paddingRight = value;
	}

	set paddingRightInstant(value)
	{
		this.vars.paddingRight = value;
	}
}
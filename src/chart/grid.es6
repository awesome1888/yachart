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
	}

	get defaultOptions()
	{
		return {
			fit: 'none', // also 'fit', 'fit-x', 'fit-y'
			align: 'topRight', // also 'topLeft', 'bottomRight', 'bottomLeft'
			unitSize: 10, // in pixels
			minGridSpace: 30,
		};
	}

	clearCaches()
	{
		this.center = null;
		this.unitSize = null;
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
		this.renderGridBorder();
		this.renderData();
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

		for(let offset = start; (way ? offset <= end : offset >= end); offset += dStep, range += step)
		{
			if(way) // vertical
			{
				if(offset < this.paddingLeft || offset > this.paddingLeft + this.widthPadded)
				{
					continue;
				}
			}
			else
			{
				if(offset < this.paddingTop || offset > this.paddingTop + this.heightPadded)
				{
					continue;
				}
			}

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
	}

	renderGridAxis()
	{
		this.canvas.line(this.centerHeightLeft, this.centerHeightRight);
		this.canvas.line(this.centerWidthTop, this.centerWidthBottom);
	}

	renderData()
	{
		this.points.each(function(item, key, extra){
			item.render(extra);
		}.bind(this));
	}

	onCanvasMouseMove()
	{
		//console.dir('cmm');
	}

	onCanvasClick()
	{
		//console.dir('ccl');
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
		let unit = this.unitSize;

		return {
			x: Math.floor(point.x / unit),
			y: Math.floor(point.y / unit)
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
		let center = null;
		let unitSize = null;
		let fit = this.option('fit');

		let defCenter = this.defaultCenter;

		let first = this.points.first;
		let last = this.points.last;

		if(fit == 'none')
		{
			// no fit, then use align
			unitSize = this.defaultUnitSize;

			if(first && last)
			{
				// we need to locate center
				let align = this.option('align');
				let bounds = this.points.dataBounds;

				center = defCenter;

				if(bounds.size.w > this.widthPadded)
				{
					if(align === 'top-right')
					{
						let delta = this.data2PixelRelative(last, {unitSize: unitSize, center: center}).x - this.widthPadded;
						center.x = center.x - delta;
					}
					else
					{
						// todo
					}
				}
			}
			else
			{
				// just set the default and leave this
				center = defCenter;
			}
		}
		else if(fit == 'fit-x')
		{
			if(first && last)
			{
				let width = this.widthPadded;
				let height = this.heightPadded;

				let bounds = this.points.dataBounds;

				let k = 1;
				if(width <= bounds.size.w)
				{
					k = width / bounds.size.w;
				}

				let newHeight = k * bounds.size.h;
				if(height <= newHeight)
				{
					k = k * (height / newHeight);
				}

				// data is smaller than grid, left unit size as is
				if(k === 1)
				{
					unitSize = this.defaultUnitSize;
				}
				else
				{
					unitSize = k * this.defaultUnitSize;
				}

				let firstPixel = this.data2PixelRelative(this.points.first, {unitSize: unitSize});
				center = {x: Math.round(defCenter.x - firstPixel.x), y: Math.round(defCenter.y - firstPixel.y)};
			}
			else
			{
				// just set the default and leave this
				center = defCenter;
			}
		}
		else
		{
			// just set the default and leave this
			unitSize = this.defaultUnitSize;
			center = defCenter;
		}

		return {center: center, unitSize: unitSize}
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
			Util.bindEvent(canvas, 'canvasMouseMove', this.onCanvasMouseMove.bind(this));
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
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

		this.center = {x: 50, y: 50}; // tmp
	}

	get defaultOptions()
	{
		return {
			fit: 'fit', // also 'fit-x', 'fit-y'
			align: 'topRight', // also 'topLeft', 'bottomRight', 'bottomLeft'
			unitSize: 10, // in pixels
		};
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

	render(ifResized)
	{
		if(ifResized)
		{
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

		this.renderGridBorder();
		this.renderGridUnitLines();
		this.renderGridAxis();
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
		// todo
	}

	renderGridAxis()
	{
		this.canvas.line(this.centerHeightLeft, this.centerHeightRight);
		this.canvas.line(this.centerWidthTop, this.centerWidthBottom);
	}

	renderData()
	{
		this.points.each(function(item){
			item.render(this);
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
	 * Map data values into grid pixels
	 * @param point
	 * @param parameters
	 * @returns {{x: number, y: number}}
	 */
	data2Grid(point, parameters = {})
	{
		let unit = this.options.unitSize;
		let center = this.vars.center;

		let p = {
			x: center.x + this.paddingLeft + point.x * unit,
			y: (this.height - this.paddingBottom - center.y) - point.y * unit
		};

		return p;
	}

	/**
	 * Map grid pixels into data values
	 * @param point
	 * @param parameters
	 * @returns {{x: number, y: number}}
	 */
	grid2Data(point, parameters = {})
	{
		let unit = this.options.unitSize;

		let p = {
			x: Math.floor(point.x / unit),
			y: Math.floor(point.y / unit)
		};

		return p;
	}

	/**
	 *
	 * @param point in canvas-coordinates
	 */
	set center(point)
	{
		this.vars.center = point;
	}

	get center()
	{
		return this.vars.center || {x: 0, y: this.heightPadded + this.paddingTop};
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

	get topLeft()
	{
		return {x: this.paddingLeft, y: this.paddingTop};
	}

	get topRight()
	{
		return {x: this.paddingLeft + this.widthPadded, y: this.paddingTop};
	}

	get bottomLeft()
	{
		return {x: this.paddingLeft, y: this.paddingTop + this.heightPadded};
	}

	get bottomRight()
	{
		return {x: this.paddingLeft + this.widthPadded, y: this.paddingTop + this.heightPadded};
	}

	get centerHeightLeft()
	{
		return {x: this.paddingLeft, y: this.paddingBottom + this.heightPadded - this.center.y};
	}

	get centerHeightRight()
	{
		return {x: this.paddingLeft + this.widthPadded, y: this.paddingBottom + this.heightPadded - this.center.y};
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
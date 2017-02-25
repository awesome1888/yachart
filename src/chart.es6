import {DOMController} from '/src/util/domcontroller.es6';
import {Manager as PointManager} from '/src/chart/point/manager.es6';
import {Canvas} from '/src/chart/canvas.es6';

export class Chart extends DOMController
{
	constructor(options)
	{
		super(options);

		this.addPoints(this.option('data'));

		this.canvas.fit(this.scope);
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

	bindEvents()
	{
		window.addEventListener('resize', this.onWindowResize.bind(this));
	}

	render()
	{
		this.canvas.clear();
		this.renderGridBackground();
		this.renderGridAxis();
		this.renderData();
	}

	renderGridBackground()
	{

	}

	renderGridAxis()
	{

	}

	renderData()
	{

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

	onWindowResize()
	{
		if(this.canvas.fit(this.scope))
		{
			this.render();
		}
	}

	onCanvasMouseMove()
	{
		console.dir('cmm');
	}

	onCanvasClick()
	{
		console.dir('ccl')
	}

	get defaultCode()
	{
		return 'chart';
	}

	get canvas()
	{
		if(this.vars.canvas === undefined)
		{
			let canvas = new Canvas(this.control('canvas'));
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
}
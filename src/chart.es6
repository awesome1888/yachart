import {DOMController} from '/src/util/domcontroller.es6';
import {Grid} from '/src/chart/grid.es6';
import {Iterable} from '/src/util/iterable.es6';

export class Chart extends DOMController
{
	constructor(options)
	{
		super(options);

		this.updateStyle();
		this.addPoints(this.option('data'));

		// todo: fire ready() event
	}

	get defaultOptions()
	{
		return {
			scope: null,
			data: [],
		};
	}

	addPoints(data)
	{
		this.grid.addPoints(data);
		this.render(true);
	}

	addPoint(x, y)
	{
		this.grid.addPoint([x, y]);
		this.render();
	}

	bindEvents()
	{
		window.addEventListener('resize', this.onWindowResize.bind(this));
	}

	render(isResized)
	{
		this.grid.render(isResized);
	}

	onWindowResize()
	{
		this.grid.render(true);
	}

	/**
	 * re-read styles from the stylesheet
	 */
	updateStyle()
	{
		let grid = this.grid;

		grid.paddingTopInstant = 10;
		grid.paddingBottomInstant = 50;
		grid.paddingLeftInstant = 50;
		grid.paddingRightInstant = 10;
	}

	get last()
	{
		let last = this.grid.points.last;
		if(!last)
		{
			return {x: 0, y: 0};
		}

		return {x: last.x, y: last.y};
	}

	get gridContainer()
	{
		return this.control('grid-container') || this.scope;
	}

	get defaultCode()
	{
		return 'chart';
	}

	get grid()
	{
		if(this.vars.grid === undefined)
		{
			let grid = new Grid({
				container: this.gridContainer,

				unitSize: this.option('unitSize'),
				fit: this.option('fit'),
				align: this.option('align'),
			});

			this.vars.grid = grid;
		}

		return this.vars.grid;
	}
}

///////////////////



window.iterable = new Iterable();
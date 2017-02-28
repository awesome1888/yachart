import {DOMController} from '/src/util/domcontroller.es6';
import {Grid} from '/src/chart/grid.es6';

export class Chart extends DOMController
{
	constructor(options)
	{
		super(options);

		this.grid.addPoints(this.option('data'));
		this.updateStyle();
		this.render(true);

		// todo: fire ready() event
	}

	get defaultOptions()
	{
		return {
			scope: null,
			fit: 'fit', // also 'fit-x', 'fit-y'
			align: 'topRight', // also 'topLeft', 'bottomRight', 'bottomLeft'
			unitSize: 2, // in pixels
			minGridSpace: 30,
			data: [],
		};
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

	get gridContainer()
	{
		return this.control('grid-container') || this.scope();
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
				minGridSpace: this.option('minGridSpace')
			});
			//grid.center = {x: 10, y: 10};

			this.vars.grid = grid;
		}

		return this.vars.grid;
	}
}
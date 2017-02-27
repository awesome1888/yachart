import {Point} from '/src/chart/shape/point.es6';

export class Circle extends Point
{
	render(grid)
	{
		let location = grid.data2Grid(this.location);

		//let radius = visibleState.radius;
		let radius = this.radius;
		if(!radius)
		{
			return; // do not draw circle with zero radius
		}

		// let pointStyle = this.parent().getStyle().data.point;
		// let gp = visibleState.getPoint();

		grid.canvas.circle(
			location,
			radius,
			{color: 'red', thickness: 3}
		);
	}

	get radius()
	{
		return this.vars.radius || 10;
	}

	set radius(value)
	{
		this.vars.radius = value;
	}
}
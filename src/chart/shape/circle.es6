import {Point} from '/src/chart/shape/point.es6';

export class Circle extends Point
{
	render(parameters)
	{
		let location = this.grid.data2Pixel(this.location);

		if(parameters.right)
		{
			// draw line to the next point

			let rLocation = this.grid.data2Pixel(parameters.right.location);

			this.grid.canvas.line(
				location,
				rLocation,
				{color: '#c9302c', thickness: 2}
			);
		}

		//let radius = visibleState.radius;
		let radius = this.radius;
		if(!radius)
		{
			return; // do not draw circle with zero radius
		}

		// let pointStyle = this.parent().getStyle().data.point;
		// let gp = visibleState.getPoint();

		this.grid.canvas.circle(
			location,
			radius,
			{color: '#c9302c', thickness: 2, bgColor: '#ffffff'}
		);
	}

	get bounds()
	{
		let coordinates = this.coordinates;
		let bounds = [coordinates, coordinates];
		let radius = this.radius;

		bounds[0].x -= radius;
		bounds[0].y += radius;

		bounds[1].x += radius;
		bounds[1].y -= radius;

		return bounds;
	}

	get boundsCenter00()
	{
		let coordinates = this.coordinatesCenter00;
		let bounds = [coordinates, coordinates];
		let radius = this.radius;

		bounds[0].x -= radius;
		bounds[0].y += radius;

		bounds[1].x += radius;
		bounds[1].y -= radius;

		return bounds;
	}

	get radius()
	{
		return this.vars.radius || 5;
	}

	set radius(value)
	{
		this.vars.radius = value;
	}
}
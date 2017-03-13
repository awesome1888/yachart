import {Point} from '/src/chart/shape/point.es6';
import '/src/util.js';

export class Circle extends Point
{
	constructor(options)
	{
		super(options);

		this.animationState = {
			radius: this.defaultRadius,
		};
	}

	render(parameters)
	{
		let location = this.grid.data2Pixel(this.location);

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

	animateRadius(value)
	{
		this.radius = value;

		if(this.radius != this.radiusAnimated)
		{
			return this.grid.flow.add({
				tag: 'point_resize_'+this.id,
				duration: 100,
				//easing: '',
				start: {
					radius: this.radiusAnimated, // current value (could be any)
				},
				end: {
					radius: this.radius, // value to reach
				}
			});
		}
		else
		{
			return Util.Promise.getResolvedDumb();
		}
	}

	set radiusAnimated(value)
	{
		this.animationState.radius = value;
	}

	get radiusAnimated()
	{
		return this.animationState.radius;
	}

	get radius()
	{
		return this.vars.radius || this.defaultRadius;
	}

	set radius(value)
	{
		this.vars.radius = value;
	}

	get defaultRadius()
	{
		return 5;
	}
}
import {Point} from '/src/chart/shape/point.es6';
import '/src/util.js';

export class Circle extends Point
{
	constructor()
	{
		super();

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

	set radiusAnimated(value)
	{
		let tag = 'point_resize_'+this.getId();

		let rSt = this.getRealState();
		let vSt = this.getVisibleState();

		let flow = this.parent().getFlow();
		flow.done(tag, false); // kill previous animation, if any

		parameters = parameters || {};
		let duration = parameters.duration || 100;

		if(this.radius != this.radiusAnimated)
		{
			return flow.add({
				cb(step){
					vSt.radius = step.radius;
				},
				tag: tag,
				duration: duration,
				start: {
					radius: vSt.radius
				},
				end: {
					radius: rSt.radius
				}
			});
		}
		else
		{
			return Util.Promise.getResolvedDumb();
		}
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
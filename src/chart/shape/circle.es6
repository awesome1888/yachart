Util.namespace('YAChart.Shape');

YAChart.Shape.Circle = class {
	constructor()
	{
		this.vars = {
			x: data.x || 0,
			y: data.y || 0,
			radius: data.radius || 0,

			realState: null,
			visibleState: null,

			parent: null,
			id: _.random(10000, 99999)
		};

		Object.defineProperty(this, 'x', {
			enumerable: true,
			get: this.getX,
			set(){}
		});
		Object.defineProperty(this, 'y', {
			enumerable: true,
			get: this.getY,
			set(){}
		});

		Object.defineProperty(this, 'dataX', {
			enumerable: true,
			get: this.getDataX,
			set(){}
		});
		Object.defineProperty(this, 'dataY', {
			enumerable: true,
			get: this.getDataY,
			set(){}
		});

		this.parent(data.parent);
	}

	render()
	{
		let visibleState = this.getVisibleState();

		let radius = visibleState.radius;
		if(!radius)
		{
			return; // do not draw circle with zero radius
		}

		let pointStyle = this.parent().getStyle().data.point;
		let gp = visibleState.getPoint();

		// border, background
		this.parent().dot(
			gp,
			radius,
			pointStyle.border.height,
			pointStyle.border.color,
			pointStyle.color
		);
	}

	isVisible()
	{
		return this.getRealState().radius > 0;
	}

	isPointInside(point)
	{
		let vSt = this.getVisibleState();

		// todo: algorithm of this function depends on geometry of data point. currently it is a circle
		let gp = vSt;
		let r = vSt.radius;

		return Math.pow(point.x - gp.x, 2) + Math.pow(point.y - gp.y, 2) <= r*r;
	}

	getVisibilityPercent()
	{
		let radiusNow = this.getRealState().radius;
		let radiusShouldBe = this.getRadiusStyle();

		return (radiusNow / radiusShouldBe);
	}

	/**
	 * Function is called when point first appeared
	 * @returns {*}
	 */
	show(parameters)
	{
		let promises = [];
		if(parameters.animateAppear !== false)
		{
			promises.push(this.setRadius(
				this.getRadiusStyle(),
				{
					duration: parameters.durationAppear
				}
			));
		}
		if(parameters.animateMove !== false)
		{
			promises.push(this.animateRelocationOnShow(
				{
					duration: parameters.durationMove,
					moveStart: parameters.moveStart
				}
			));
		}

		return AW.Promise.all(promises);
	}

	hide()
	{
		return this.setRadius(0);
	}

	mouseEnter()
	{
		let style = this.parent().getStyle();
		this.setRadius(Math.floor(style.data.point.hover.height / 2));
	}

	mouseLeave()
	{
		let style = this.parent().getStyle();
		this.setRadius(Math.floor(style.data.point.height / 2));
	}

	mouseClick(e)
	{
		// todo
		console.dir('clicked at '+this.getId());
	}

	parent(parent)
	{
		if(parent)
		{
			this.vars.parent = parent;
			this.setLocation(this.parent().mapDataToGridPoint(this.getDataPoint()), true);

			return;
		}

		return this.vars.parent;
	}

	getId()
	{
		return this.vars.id;
	}

	getDataPoint()
	{
		return new AW.UI.Chart.Point(
			this.vars.x,
			this.vars.y,
			false
		)
	}

	getRealState()
	{
		if(this.vars.realState === null)
		{
			this.vars.realState = new AW.UI.Chart.DataPoint.State({
				parent: this
			});
		}

		return this.vars.realState;
	}

	setRadius(radius, parameters)
	{
		this.getRealState().radius = radius;

		return this.animateRadius(parameters);
	}

	setLocation(point, init)
	{
		let rSt = this.getRealState();

		rSt.x = point.x;
		rSt.y = point.y;

		let vInit = this.isVisibleInitialized();
		let vSt = this.getVisibleState();

		if(init || vInit)
		{
			vSt.x = point.x;
			vSt.y = point.y;

			let p = new AW.Promise();
			p.resolve();

			return p;
		}
		else
		{
			return this.animateRelocation();
		}
	}

	animateRelocationOnShow()
	{
		let p = new AW.Promise();
		p.resolve();

		return p;
	}

	animateRelocation()
	{
		let tag = 'point_relocate_'+this.getId();

		let rSt = this.getRealState();
		let vSt = this.getVisibleState();

		let flow = this.parent().getFlow();
		flow.done(tag, false); // kill previous animation, if any

		if(rSt.x != vSt.x || rSt.y != vSt.y)
		{
			return flow.add({
				cb(step){
					vSt.x = step.x;
					vSt.y = step.y;
				},
				tag: tag,
				duration: [200, 400],
				start: {
					x: vSt.x,
					y: vSt.y
				},
				end: {
					x: rSt.x,
					y: rSt.y
				}
			});
		}
		else
		{
			let p = new AW.Promise();
			p.resolve();

			return p;
		}
	}

	animateRadius(parameters)
	{
		let tag = 'point_resize_'+this.getId();

		let rSt = this.getRealState();
		let vSt = this.getVisibleState();

		let flow = this.parent().getFlow();
		flow.done(tag, false); // kill previous animation, if any

		parameters = parameters || {};
		let duration = parameters.duration || 100;

		if(rSt.radius != vSt.radius)
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
			let p = new AW.Promise();
			p.resolve();

			return p;
		}
	}

	getX()
	{
		return this.getRealState().x;
	}

	getY()
	{
		return this.getRealState().y;
	}

	getDataX()
	{
		return this.vars.x;
	}

	getDataY()
	{
		return this.vars.y;
	}

	getRadiusStyle()
	{
		return Math.floor(this.parent().getStyle().data.point.height / 2);
	}

	getVisibleState()
	{
		if(this.vars.visibleState === null)
		{
			this.vars.visibleState = new AW.UI.Chart.DataPoint.State({
				parent: this
			});
		}

		return this.vars.visibleState;
	}

	isVisibleInitialized()
	{
		return this.vars.visibleState !== null;
	}

	dump()
	{
		console.dir(this.x+', '+this.y);
	}
};

YAChart.Shape.Circle.State = class {
	constructor()
	{
		this.vars = {
			parent: null,
			point: new YAChart.Point(data.x || 0, data.y || 0),
			radius: data.radius || 0
		};

		Object.defineProperty(this, 'radius', {
			enumerable: true,
			get: this.getRadius,
			set: this.setRadius
		});
		Object.defineProperty(this, 'x', {
			enumerable: true,
			get: this.getX,
			set: this.setX
		});
		Object.defineProperty(this, 'y', {
			enumerable: true,
			get: this.getY,
			set: this.setY
		});
	}

	/**
	 * @returns {YAChart.Point}
	 */
	get point()
	{
		return this.vars.point;
	}

	getPointClone()
	{
		return this.vars.point.clone();
	}

	getRadius()
	{
		return this.vars.radius;
	}

	setRadius(value)
	{
		this.vars.radius = value;
	}

	getX()
	{
		return this.vars.point.x;
	}

	setX(value)
	{
		this.vars.point.x = value;
	}

	getY()
	{
		return this.vars.point.y;
	}

	setY(value)
	{
		this.vars.point.y = value;
	}

	dump()
	{
		console.dir(this.point.x+' '+this.point.y+' r='+this.vars.radius);
	}
};
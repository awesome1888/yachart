import '/src/util.js';

export class Canvas
{
	constructor(canvas)
	{
		this.canvas = canvas;
		this.prevSize = {w: 0, h: 0};

		this.mouse = {x: 0, y: 0};

		this.canvas.addEventListener('mousemove', Util.throttle(
			this.onMouseMove.bind(this),
			100,
			{firstCall: true}
		));
		this.canvas.addEventListener('click', this.onClick.bind(this));
	}

	get pos()
	{
		return Util.pos(this.canvas);

		// if(!this.cache.pos)
		// {
		// 	this.cache.pos = Util.pos(this.canvas);
		// }
		//
		// return this.cache.pos;
	}

	fit(node)
	{
		let pos = Util.pos(node);

		let h = pos.height;
		let w = pos.width;

		if(this.prevSize.w != w || this.prevSize.h != h)
		{
			this.canvas.setAttribute('height', h);
			this.canvas.setAttribute('width', w);

			this.prevSize.w = w;
			this.prevSize.h = h;

			return true;
		}

		return false;
	}

	clear()
	{
		this.canvas.height = this.canvas.height;
	}

	rectangle(point, size, parameters = {})
	{
		parameters = parameters || {};

		let ctx = this.context;
		let o = (parameters.thickness || 1) % 2 ? 0.5 : 0;

		ctx.beginPath();
		ctx.rect(point.x + o, point.y + o, size.w, size.h);
		ctx.closePath();
		ctx.lineWidth = 1;
		ctx.strokeStyle = parameters.color || 'transparent';
		ctx.fillStyle = parameters.bgColor || 'transparent';
		ctx.fill();
		ctx.stroke();
	}

	circle(point, radius, parameters = {})
	{
		parameters = parameters || {};

		let ctx = this.context;

		radius = radius || 2;
		if(radius <= 0)
		{
			return;
		}

		ctx.beginPath();
		ctx.arc(point.x, point.y, radius || 2, 0, Math.PI * 2, false);
		ctx.closePath();
		ctx.lineWidth = parameters.thickness || 1;
		ctx.strokeStyle = parameters.color || 'transparent';
		ctx.fillStyle = parameters.bgColor || 'transparent';
		ctx.fill();
		ctx.stroke();
	}

	nGon(points, parameters = {})
	{
		if(!points || !points.length)
		{
			return;
		}

		parameters = parameters || {};

		let ctx = this.context;
		let point = null;

		ctx.beginPath();
		for(let k = 0; k < points.length; k++)
		{
			if(k == 0)
			{
				ctx.moveTo(point.x, point.y);
			}
			else
			{
				ctx.lineTo(point.x, point.y);
			}
		}
		ctx.closePath();

		//ctx.lineWidth = thickness || 0;
		//ctx.strokeStyle = color;
		ctx.fillStyle = parameters.bgColor || 'transparent';
		ctx.fill();
	}

	line(from, to, parameters = {})
	{
		parameters = parameters || {};
		parameters.thickness = parameters.thickness || 1;

		let ctx = this.context;
		let o = parameters.thickness % 2 ? 0.5 : 0;

		ctx.beginPath();
		ctx.moveTo(from.x + o, from.y + o);
		ctx.lineWidth = parameters.thickness || 1;
		ctx.strokeStyle = parameters.color || '#000000';// 'transparent';
		ctx.lineTo(to.x + o, to.y + o);
		ctx.stroke();
	}

	onMouseMove(e)
	{
		e = e || window.event;

		let mouse = this.mouse;
		let docElement = document.documentElement;
		let docBody = document.body;

		// save last global coordinates
		mouse.x = e.pageX ?
			e.pageX :
			(e.clientX ? e.clientX + (docElement.scrollLeft || docBody.scrollLeft) - docElement.clientLeft : 0);
		mouse.y = e.pageY ?
			e.pageY :
			(e.clientY ? e.clientY + (docElement.scrollTop || docBody.scrollTop) - docElement.clientTop : 0);

		//Util.fireEvent(this, 'canvasMouseMove');
	}

	onClick()
	{
		let mouse = this.mouse;
		let pos = this.pos;

		let doc = document.body;

		let scrollTop = doc.scrollTop;
		let scrollLeft = doc.scrollLeft;

		let p = {x: mouse.x - pos.left - scrollLeft, y: mouse.y - pos.top - scrollTop};

		Util.fireEvent(this, 'canvasClick', [p]);
	}

	clearCaches()
	{
		this._height = null;
		this._width = null;
		this.cache = {};
	}

	get height()
	{
		if(this._height === null)
		{
			this._height = Util.pos(this.canvas).height;
		}

		return this._height;
	}

	get width()
	{
		if(this._width === null)
		{
			this._width = Util.pos(this.canvas).width;
		}

		return this._width;
	}

	get context()
	{
		if(this._context === undefined)
		{
			this._context = this.canvas.getContext('2d');
		}

		return this._context;
	}

	set canvas(canvas)
	{
		this._canvas = canvas || null;
	}

	get canvas()
	{
		return this._canvas;
	}
}
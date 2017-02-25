import '/src/util.js';

export class Canvas
{
	constructor(canvas)
	{
		this.canvas = canvas;
		this.prevSize = {w: 0, h: 0};

		this.canvas.addEventListener('mousemove', Util.throttle(
			this.onMouseMove.bind(this),
			100,
			{firstCall: true}
		));
		this.canvas.addEventListener('click', this.onClick.bind(this));
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

	onMouseMove()
	{
		Util.fireEvent(this, 'canvasMouseMove');
	}

	onClick()
	{
		Util.fireEvent(this, 'canvasClick');
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
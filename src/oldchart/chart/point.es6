YAChart.Point = class
{
	constructor(x, y, global)
	{
		this.vars = {x: 0, y: 0, global: !!global};
		this.x(x);
		this.y(y);
	}
	get x()
	{
		return this.vars.x;
	}
	get y()
	{
		return this.vars.y;
	}
	set x(x)
	{
		this.vars.x = x || 0;
	}
	set y(y)
	{
		this.vars.y = y || 0;
	}
	isGlobal()
	{
		return this.vars.global;
	}
};
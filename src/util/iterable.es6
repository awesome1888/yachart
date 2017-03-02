import {BaseClass} from '/src/util/baseclass.es6';

export class Iterable extends BaseClass
{
	constructor()
	{
		super();

		this.vars.values = {};
		this.vars.order = [];
	}

	push(instance, key)
	{
		if(key === undefined)
		{
			key = this.vars.order.length;
		}

		this.vars.values[key] = instance;
		this.vars.order.push(key);
	}

	count()
	{
		return this.vars.order.length;
	}

	each(cb)
	{
		let key = null;
		let value = null;
		let prevValue = null;
		let nextValue = null;
		for(let k = 0; k < this.vars.order.length; k++)
		{
			key = this.vars.order[k];
			value = this.vars.values[key];
			prevValue = k === 0 ? null : this.vars.values[this.vars.order[k - 1]];
			nextValue = k < this.vars.order.length - 1 ? this.vars.values[this.vars.order[k + 1]] : null;
			if(cb.apply(this, [value, key, {
				left: prevValue,
				right: nextValue,
				iteration: k
			}]) === true)
			{
				break;
			}
		}
	}

	nth(k)
	{
		if(k < 0 || k >= this.count())
		{
			return null;
		}

		return this.vars.values[this.vars.order[k]];
	}

	first()
	{
		return this.nth(0);
	}

	last()
	{
		return this.nth(this.count() - 1);
	}
}
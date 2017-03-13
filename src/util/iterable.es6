import {BaseClass} from '/src/util/baseclass.es6';

export class Iterable extends BaseClass
{
	constructor()
	{
		super();

		this.vars.values = {};
		this.vars.order = [];
	}

	push(order, instance)
	{
		this.vars.values[order] = instance;
		this.vars.order.push(order);
	}

	insertByOrder(order, instance)
	{
		if(this.count)
		{
			this.vars.values[order] = instance;

			let index = this.findIndex(order);
			if(index.type !== 'r')
			{
				this.vars.order.splice(index.i + 1, 0, order);
			}
		}
		else
		{
			this.push(order, instance);
		}
	}

	deleteByOrder(order)
	{
		if(this.count)
		{
			let index = this.findIndex(order);
			if(index.type === 'r')
			{
				delete(this.vars.values[order]);
				this.vars.order.splice(index.i, 1);
			}
		}
	}

	/**
	 * @access private
	 * @param order
	 * @returns {number}
	 */
	findIndex(order)
	{
		// todo: currently, fullscan, but implement binary search
		let item = null;
		let i;
		for(i = 0; i < this.vars.order.length; i++)
		{
			item = this.vars.order[i];
			if(item > order) // as soon as item becomes greater than order, we found our place
			{
				return {i: i - 1};
			}
			else if(item == order)
			{
				return {i: i, type: 'r'};
			}
		}

		return {i: i - 1};
	}

	get count()
	{
		return this.vars.order.length;
	}

	each(cb)
	{
		if(!this.count)
		{
			return;
		}

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
		if(k < 0 || k >= this.count)
		{
			return null;
		}

		return {order: this.vars.order[k], instance: this.vars.values[this.vars.order[k]]};
	}

	get first()
	{
		return this.nth(0);
	}

	get last()
	{
		return this.nth(this.count - 1);
	}
}
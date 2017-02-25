(function(){
	"use strict";

	window.Util = {};
	Util.namespace = function(ns)
	{
		if(typeof ns == 'undefined')
		{
			return;
		}

		ns = ns.toString().trim().split('.');
		var i = 0;
		var top = Util;
		ns.forEach(function(item){
			if(i == 0 && item == 'AW')
			{
				return;
			}
			if(item.length == 0 || !/^[a-zA-Z0-9]+$/.test(item))
			{
				throw new Error('Illegal namespace item found: '+item);
			}
			if(typeof top[item] == 'undefined')
			{
				top[item] = {};
			}
			top = top[item];
		});
	};

	Util.extend = function(prev, next)
	{
		var mid = Object.create(prev);
		if(next)
		{
			for (var k in next)
			{
				if(next.hasOwnProperty(k))
				{
					mid[k] = next[k];
				}
			}
		}

		return mid;
	};

	Util.Promise = function()
	{
		this.state = null;
		this.value = null;
		this.reason = null;
		this.next = null;

		this.onFulfilled = [];
		this.onRejected = [];
	};
	Util.Promise.prototype = {
		fulfill: function(value)
		{
			this.checkState();

			this.value = value;
			this.state = true;
			this.execute();
		},
		resolve: function(value)
		{
			return this.fulfill(value);
		},
		reject: function(reason)
		{
			this.checkState();

			this.reason = reason;
			this.state = false;
			this.execute();
		},
		then: function(onFulfilled, onRejected)
		{
			if(Util.Util.isFunction(onFulfilled))
			{
				this.onFulfilled.push(onFulfilled);
			}
			if(Util.Util.isFunction(onRejected))
			{
				this.onRejected.push(onRejected);
			}

			if(this.next === null) // todo: or should be array of next here?
			{
				this.next = new Util.Promise();
			}

			if(this.state !== null) // if promise is already resolved, execute immediately
			{
				this.execute();
			}

			return this.next;
		},
		/**
		 * Resolve function. This allows to put *this* promise in dependence of
		 * some other value (which could be an instance of the promise too)
		 * @param x
		 */
		resolveProc: function(x)
		{
			var this_ = this;

			if(this === x)
			{
				this.reject(new TypeError('Promise cannot fulfill or reject itself')); // avoid recursion
			}
			else if(x instanceof Util.Promise)
			{
				x.then(function(value){
					this_.fulfill(value);
				}, function(reason){
					this_.reject(reason);
				});
			}
			else if(Util.Util.isFunction(x) || Util.Util.isObject(x)) // process i.e. "thenable" - a poorly-written promises
			{
				var then = x.then;
				if(Util.Util.isFunction(then))
				{
					var executed = false;

					then.apply(x, [
						function resolvePromise(y){
							if(!executed)
							{
								executed = true;
								this_.resolveProc(y);
							}
						},
						function rejectPromise(r){
							if(!executed)
							{
								executed = true;
								this_.reject(r);
							}
						}
					]);
				}
				else // Object is not thenable
				{
					this.fulfill(x);
				}
			}
			else
			{
				this.fulfill(x);
			}
		},
		execute: function()
		{
			if(this.state === null)
			{
				//then() must not be called before promise resolveProc() happens
				return;
			}

			var value = undefined;
			var reason = undefined;
			var x = undefined;
			var k;
			if(this.state === true) // promise was fulfilled
			{
				if(this.onFulfilled.length)
				{
					try
					{
						for(k = 0; k < this.onFulfilled.length; k++)
						{
							x = this.onFulfilled[k].apply(this, [this.value]);
							if(typeof x != 'undefined')
							{
								value = x;
							}
						}
					}
					catch(e)
					{
						reason = e; // reject next
					}
				}
				else
				{
					value = this.value; // resolve next
				}
			}
			else if(this.state === false) // promise was rejected
			{
				if(this.onRejected.length)
				{
					try
					{
						for(k = 0; k < this.onRejected.length; k++)
						{
							x = this.onRejected[k].apply(this, [this.reason]);
							if(typeof x != 'undefined')
							{
								value = x;
							}
						}
					}
					catch(e)
					{
						reason = e; // reject next
					}
				}
				else
				{
					reason = this.reason; // reject next
				}
			}

			if(this.next !== null)
			{
				if(typeof reason != 'undefined')
				{
					this.next.reject(reason); // todo: or should we reject an array of next?
				}
				else if(typeof value != 'undefined')
				{
					// run this.next resolve, which eventually calls this.next.fulfill() or this.next.reject()
					this.next.resolveProc(value); // todo: or should we resolve an array of next?
				}
			}
		},
		checkState: function()
		{
			if(this.state !== null)
			{
				throw new Error('You can not do fulfill() or reject() multiple times');
			}
		}
	};
	Util.Promise.serial = function(todo)
	{
		var p = new Util.Promise();
		var fP = p;

		for(var k = 0; k < todo.length; k++)
		{
			(function(k, this_){
				p = p.then(function(){
					return todo[k].apply(this_, []);
				});
			})(k, this);
		}

		fP.resolve();

		return fP;
	};

}).call(this);
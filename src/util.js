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

}).call(this);
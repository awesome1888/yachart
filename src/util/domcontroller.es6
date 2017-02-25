import {BaseClass} from '/src/util/baseclass.es6';

export class DOMController extends BaseClass
{
	constructor(options)
	{
		super(options);
		this.ctrls = {};

		this.bindEvents();
	}

	bindEvents()
	{
	}

	control(code, instance)
	{
		if(this.ctrls[code] === undefined)
		{
			let node = this.scope.querySelector('.js-'+this.code+'-'+code);
			if(node)
			{
				this.ctrls[code] = node;
			}
			else
			{
				return null;
			}
		}

		return this.ctrls[code];
	}

	get code()
	{
		let code = this.option('code');
		if(!code)
		{
			code = this.defaultCode;
		}

		return code;
	}

	get defaultCode()
	{
		return 'domcontroller';
	}

	get scope()
	{
		return this.option('scope');
	}
}
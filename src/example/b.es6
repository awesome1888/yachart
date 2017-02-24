import A from '/src/example/a.es6';

export default class B extends A
{
	constructor()
	{
		super();
		console.dir('test there!!! test test gulp watch!');
	}
}
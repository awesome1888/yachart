import {BaseClass} from '/src/util/baseclass.es6';
import '/src/util.js';

let yachart = class YAChart extends BaseClass
{
	constructor(options)
	{
		super();

		this.sys = {
			scope: options.scope || null,
			cache: {}
		};

		this.vars = {
			data: {
				order: [],
				values: {}
			},
			unitAspectRatio: 1,
			fitSize: true,

			dataSquare: null,
			prevScopeSize: {width: 0, height:0},
			measures: null,
			styles: null,
			mouse: {x: 0, y: 0},
			collisions: {}
		};

		this.options = Util.extend({
			data: [],
			fitOnScreen: false,
			// options used if fitOnScreen === true
			aspectRatio: 0,
			// center will be auto-calculated
			// options used if fitOnScreen === false
			vAlign: 'top',
			hAlign: 'right',
			minUnitSize: 0,
			center: {x: 0, y: 0} // todo: calculate automatically
		}, options);

		this.bindEvents();
		this.fitCanvas();

		if(this.option('data').length)
		{
			let data = this.option('data');
			for(let k = 0; k < data.length; k++)
			{
				this.addPoint(data[k][0], data[k][1], {
					show: false
				});
			}

			this.showInitialData();
		}

		this.renderFrame();
	}

	get code()
	{
		return 'yachart';
	}

	fitCanvas()
	{
		let h = $(this.scope()).height();
		let w = $(this.scope()).width();

		let canvas = this.getCanvas();
		canvas.setAttribute('height', h);
		canvas.setAttribute('width', w);

		this.dropMeasures();
	}

	bindEvents()
	{
		$(window).on('resize', this.onResize.bind(this));

		// also, window resize, window scroll, any object changed at the chart
		$(this.getCanvas()).on('mousemove', this.onMouseMove.bind(this));
		$(this.getCanvas()).on('click', this.onMouseClick.bind(this));
	}

	onMouseClick(e)
	{
		e = e || window.event;

		for(let k in this.vars.collisions)
		{
			if(this.vars.collisions.hasOwnProperty(k))
			{
				this.vars.collisions[k].mouseClick(e);
			}
		}

		this.mouseClick(this.getCursorCoordinates(), e);
	}

	onMouseMove(e)
	{
		e = e || window.event;

		let mouse = this.vars.mouse;
		let docElement = document.documentElement;
		let docBody = document.body;

		// save last global coordinates
		mouse.x = e.pageX ?
			e.pageX :
			(e.clientX ? e.clientX + (docElement.scrollLeft || docBody.scrollLeft) - docElement.clientLeft : 0);
		mouse.y = e.pageY ?
			e.pageY :
			(e.clientY ? e.clientY + (docElement.scrollTop || docBody.scrollTop) - docElement.clientTop : 0);

		this.trackCollisions();
	}

	onResize()
	{
		let h = $(this.scope()).height();
		let w = $(this.scope()).width();

		if(this.vars.prevScopeSize.width != w || this.vars.prevScopeSize.height != h)
		{
			this.fitCanvas();
			this.renderFrame();

			this.vars.prevScopeSize.width = w;
			this.vars.prevScopeSize.height = h;
		}
	}

	renderFrame()
	{
		this.clearCanvas();
		this.renderGrid();
		this.renderData();
	}

	mouseClick(coords)
	{
		let point = this.mapGridToDataPoint(coords);

		this.addPoint(point.x, point.y, {
			show: true
		});
	}

	/////////////////////////////////////////
	/// Grid

	dropMeasures()
	{
		this.vars.measures = null;
	}

	getStyle()
	{
		if(this.vars.styles === null)
		{
			let gridStyle = this.getStyleByClassName('grid');
			let canvasStyle = this.getStyleByClassName('canvas');
			let hAxisStyle = this.getStyleByClassName('haxis-line');
			let vAxisStyle = this.getStyleByClassName('vaxis-line');
			let gridLineStyle = this.getStyleByClassName('grid-line');
			let dataLineStyle = this.getStyleByClassName('data-line');
			let dataPointStyle = this.getStyleByClassName('data-point');
			let dataPointHoverStyle = this.getStyleByClassName('data-point-hover');
			let dataFillStyle = this.getStyleByClassName('data-fill');

			this.vars.styles = {
				padding: {
					top: parseInt(gridStyle.paddingTop),
					right: parseInt(gridStyle.paddingRight),
					bottom: parseInt(gridStyle.paddingBottom),
					left: parseInt(gridStyle.paddingLeft)
				},
				margin: {
					top: parseInt(gridStyle.marginTop),
					right: parseInt(gridStyle.marginRight),
					bottom: parseInt(gridStyle.marginBottom),
					left: parseInt(gridStyle.marginLeft)
				},
				border: {
					color: gridStyle.borderColor,
					height: gridStyle.borderWidth
				},
				backgroundColor: gridStyle.backgroundColor,
				// todo: combine canvas and global padding\margin
				// todo: revise color and background color
				canvas: {
					backgroundColor: canvasStyle.backgroundColor
				},
				axis: {
					horizontal: {
						color: hAxisStyle.backgroundColor,
						height: parseInt(hAxisStyle.height),
						margin: {
							top: parseInt(hAxisStyle.marginTop),
							right: parseInt(hAxisStyle.marginRight),
							bottom: parseInt(hAxisStyle.marginBottom),
							left: parseInt(hAxisStyle.marginLeft)
						}
					},
					vertical: {
						color: vAxisStyle.backgroundColor,
						height: parseInt(vAxisStyle.height),
						margin: {
							top: parseInt(vAxisStyle.marginTop),
							right: parseInt(vAxisStyle.marginRight),
							bottom: parseInt(vAxisStyle.marginBottom),
							left: parseInt(vAxisStyle.marginLeft)
						}
					}
				},
				grid: {
					color: gridLineStyle.backgroundColor,
					height: parseInt(gridLineStyle.height)
				},
				data: {
					line: {
						color: dataLineStyle.backgroundColor,
						height: parseInt(dataLineStyle.height)
					},
					point: {
						color: dataPointStyle.backgroundColor,
						height: parseInt(dataPointStyle.height),
						border: {
							color: dataPointStyle.borderColor,
							height: parseInt(dataPointStyle.borderWidth)
						},
						hover: {
							height: parseInt(dataPointHoverStyle.height)
						}
					},
					fill: {
						color:dataFillStyle.backgroundColor
					}
				}
			};
		}

		return this.vars.styles;
	}

	getMeasures()
	{
		if(this.vars.measures === null)
		{
			let style = this.getStyle();

			let height = this.getCanvasHeight();
			let width = this.getCanvasWidth();

			let padTop = style.padding.top;
			let padRight = style.padding.right;
			let padBottom = style.padding.bottom;
			let padLeft = style.padding.left;

			let heightPadded = height - padTop - padBottom;
			let widthPadded = width - padLeft - padRight;

			let unitSize = 10; // pixels in unit

			let valueRangeX = [0, widthPadded/unitSize];
			let valueRangeY = [0, heightPadded/unitSize];

			//let size = this.getDataSquare();
			// let dY = size.y[1] - size.y[0];
			// let dX = size.x[1] - size.x[0];

			//console.dir(dX+'x'+dY+' at '+width+'x'+height);

			// let valueAspectY = 1; // no resize if there is only one unique Y value
			// if(dY)
			// {
			//   valueAspectY = heightPadded / dY;
			// }
			// let valueAspectX = 1; // no resize if there is only one unique X value
			// if(dX)
			// {
			//   valueAspectX = widthPadded / dX;
			// }

			// todo: preserve aspect between valueAspectX and valueAspectY?

			// let valueOffsetX = size.x[0] * valueAspectX;
			// let valueOffsetY = size.y[0] * valueAspectY;

			//console.dir('-'+valueOffsetX+' + (x * '+valueAspectX+') : -'+valueOffsetY+' + (y * '+valueAspectY+')');

			this.vars.measures = {
				height: height,
				width: width,

				heightPadded: heightPadded,
				widthPadded: widthPadded,

				padTop: padTop,
				padRight: padRight,
				padBottom: padBottom,
				padLeft: padLeft,

				unitX: unitSize,
				unitY: unitSize,

				valueRangeX: valueRangeX,
				valueRangeY: valueRangeY,

				// valueOffsetX: valueOffsetX,
				// valueOffsetY: valueOffsetY,
				// valueAspectX: valueAspectX,
				// valueAspectY: valueAspectY
			};
		}

		return this.vars.measures;
	}

	renderGrid()
	{
		this.renderBackground();

		let m = this.getMeasures();
		let st = this.getStyle();

		// grid lines
		let step = 0;
		for(let k = 0; k < 50; k++)
		{
			step += m.unitX;
			if(step > m.heightPadded)
			{
				break;
			}

			this.line(
				new AW.UI.Chart.Point(0, step),
				new AW.UI.Chart.Point(m.widthPadded, step),
				st.grid.color,
				st.grid.height
			);
		}
		step = 0;
		for(let k = 0; k < 50; k++)
		{
			step += m.unitY;
			if(step > m.widthPadded)
			{
				break;
			}

			this.line(
				new AW.UI.Chart.Point(step, 0),
				new AW.UI.Chart.Point(step, m.heightPadded),
				st.grid.color,
				st.grid.height
			);
		}

		// grid axis
		this.line(
			new AW.UI.Chart.Point(st.axis.horizontal.margin.left, 0),
			new AW.UI.Chart.Point(m.widthPadded, 0),
			st.axis.horizontal.color,
			st.axis.horizontal.height
		);
		this.line(
			new AW.UI.Chart.Point(0, st.axis.vertical.margin.bottom),
			new AW.UI.Chart.Point(0, m.heightPadded),
			st.axis.vertical.color,
			st.axis.vertical.height
		);
	}

	renderBackground()
	{
		let m = this.getMeasures();
		let style = this.getStyle();

		// draw canvas background
		if(style.canvas.backgroundColor !== 'transparent')
		{
			this.rectangle(
				new AW.UI.Chart.Point(
					0,
					0,
					true
				),
				{
					w: m.width,
					h: m.height
				},
				'transparent',
				style.canvas.backgroundColor,
				0
			);
		}

		// draw grid background
		if(style.backgroundColor !== 'transparent')
		{
			this.rectangle(
				new AW.UI.Chart.Point(
					m.padLeft,
					m.padBottom,
					true
				),
				{
					w: m.width - m.padRight - m.padLeft,
					h: m.height - m.padTop - m.padBottom
				},
				'transparent',
				style.backgroundColor,
				0
			);
		}

		if(style.border.color !== 'transparent')
		{
			// draw border rectangle
			this.rectangle(
				new AW.UI.Chart.Point(
					m.padLeft,
					m.padBottom,
					true
				),
				{
					w: m.width - m.padRight - m.padLeft,
					h: m.height - m.padTop - m.padBottom
				},
				style.border.color,
				null,
				style.border.height
			);
		}
	}

	renderData()
	{
		let style = this.getStyle();

		if(this.count() > 1)
		{
			let m = this.getMeasures();

			//draw under-line fill
			let points = [
				new AW.UI.Chart.Point(this.first().getVisibleState().x + m.padLeft, m.padBottom, true)
			];
			this.each(function(item){
				points.push(item.getVisibleState().getPoint());
			});
			points.push(new AW.UI.Chart.Point(this.last().getVisibleState().x + m.padLeft, m.padBottom, true));
			this.nGon(points, 0, null, style.data.fill.color);

			//draw lines
			let percent = 0;
			this.each(function(item, key, k){
				if(k > 0)
				{
					percent = item.getVisibilityPercent();
					if(percent > 0.3)
					{
						this.line(
							this.nth(k - 1).getVisibleState().getPoint(),
							item.getVisibleState().getPoint(),
							style.data.line.color,
							style.data.line.height
						);
					}
				}
			}.bind(this));
		}

		// draw dots
		this.each(function(item){
			item.render();
		});
	}

	getContext()
	{
		return this.getCanvas().getContext("2d");
	}

	getCanvas()
	{
		return this.control('canvas');
	}

	////////////////////////////////////
	// collision (mouse-object) trackers

	trackCollisions()
	{
		// need to get relative mouse coordinates
		let p = this.getCursorCoordinates();
		if(p !== null)
		{
			// now scan each point and check if we are inside round
			// todo: actually, there could be a better algorithm (Sweep and prune)
			let point = null;
			let pointId = null;
			let key = null;
			for(let k = 0; k < this.vars.data.order.length; k++)
			{
				key = this.vars.data.order[k];
				point = this.vars.data.values[key];
				pointId = point.getId();

				if(!point.isVisible())
				{
					continue;
				}

				if(point.isPointInside(p))
				{
					if(!this.vars.collisions[pointId])
					{
						this.vars.collisions[pointId] = point;
						point.mouseEnter();
						$(this.getCanvas()).addClass('griddy-over-point');
					}
				}
				else
				{
					if(this.vars.collisions[pointId])
					{
						delete(this.vars.collisions[pointId]);
						point.mouseLeave();
						$(this.getCanvas()).removeClass('griddy-over-point');
					}
				}
			}
		}
	}

	getCursorCoordinates()
	{
		let mouse = this.vars.mouse;
		let canvas = $(this.getCanvas());

		let p = {x: mouse.x - canvas.offset().left, y: mouse.y - canvas.offset().top};

		p = this.mapCanvasToGridPoint(p);
		p.x = Math.floor(p.x);

		return p;
	}

	addPoint(x, y, params)
	{
		this.unsetPointAt(x);

		let point = new AW.UI.Chart.DataPoint({
			x: x,
			y: y,
			parent: this
		});

		this.setPoint(point);

		this.dropMeasures();
		this.vars.dataSquare = null; // todo: remove

		params = params || {};
		if(params.show !== false)
		{
			// get startY (canvas) from neighbours
			let startY = this.getYFromNeighbourPoints(point);

			console.dir('prev y = '+startY);

			let moveStart = null;
			if(startY !== null)
			{
				moveStart = {x: point.x, y: startY};
			}

			point.show({
				animateAppear: true,
				animateMove: true,
				moveStart: moveStart
			});
		}

		return point.getId();
	}

	removePointAt(x)
	{
		// todo
	}

	getYFromNeighbourPoints(point)
	{
		if(!this.count())
		{
			return null;
		}

		if(this.count() == 1)
		{
			return this.nth(0).y; // point itself
		}
		if(this.first().dataX == point.dataX)
		{
			return this.first().y; // point itself
		}
		if(this.last().dataX == point.dataX)
		{
			return this.last().y; // point itself
		}

		for(let k = 0; k < this.count(); k++)
		{
			if(this.nth(k).dataX == point.dataX)
			{
				return this.findY(point.x, this.nth(k - 1), this.nth(k + 1));
			}
		}

		return null;
	}

	findY(x, p1, p2)
	{
		return -(((p1.x*p2.y - p2.x*p1.y) - (p1.y - p2.y)*x ) / (p2.x - p1.x));
	}

	showInitialData()
	{
		if(!this.count())
		{
			return;
		}

		let todo = [];
		if(true || _.random(0, 9) > 5)
		{
			// do parallel show
			this.each(function(item){
				todo.push(item.show({
					animateMove: false,
					animateAppear: true,
					durationMove: 0
				}));
			});

			return AW.Promise.all(todo);
		}
		else
		{
			// do serial show
			let animationTime = Math.floor(300 / this.count());

			this.each(function(item){
				todo.push(function(){
					return item.show({
						animateMove: false,
						animateAppear: true,
						durationAppear: animationTime,
						durationMove: 0
					});
				});
			});

			return AW.Promise.serial(todo);
		}
	}

	getDataSquare()
	{
		if(this.vars.dataSquare === null)
		{
			if(this.vars.data.length == 0)
			{
				this.vars.dataSquare = {x: [0, 0], y: [0, 0]};
			}

			let maxX = -Infinity;
			let minX = Infinity;
			let maxY = -Infinity;
			let minY = Infinity;
			for(let k = 0; k < this.vars.data.length; k++)
			{
				let next = this.vars.data[k];
				if(next.x > maxX)
				{
					maxX = next.x;
				}
				if(next.y > maxY)
				{
					maxY = next.y;
				}

				if(next.x < minX)
				{
					minX = next.x;
				}
				if(next.y < minY)
				{
					minY = next.y;
				}
			}

			this.vars.dataSquare = {x: [minX, maxX], y: [minY, maxY]};
		}

		return this.vars.dataSquare;
	}

	getStyleByClassName(className)
	{
		let node = $('<div class="'+this.code()+'-'+className+'">');
		this.getNodeSandBox().append(node);

		return window.getComputedStyle(node.get(0));
	}

	getNodeSandBox()
	{
		if(this.vars.nodeSandBox == null)
		{
			this.vars.nodeSandBox = $('<div style="height:0;width:0;overflow:hidden;">');
			$(this.scope()).append(this.vars.nodeSandBox);
		}

		return this.vars.nodeSandBox;
	}

	////////////////////////////////////
	// animation handlers

	getFlow()
	{
		if(!this.vars.aFlow)
		{
			this.vars.aFlow = new AW.UI.Chart.Flow();
			this.vars.aFlow.parent(this);
		}

		return this.vars.aFlow;
	}

	////////////////////////////////////
	// rendering api

	rectangle(point, size, color, bgColor, thickness)
	{
		point = this.mapGridToCanvasPoint(point);

		thickness = thickness || 1;

		let ctx = this.getContext();
		let o = thickness % 2 ? 0.5 : 0;

		ctx.beginPath();
		ctx.rect(point.x + o, point.y + o, size.w, -size.h);
		ctx.closePath();
		ctx.lineWidth = 1;
		ctx.strokeStyle = color || 'transparent';
		ctx.fillStyle = bgColor || 'transparent';
		ctx.fill();
		ctx.stroke();
	}

	dot(point, radius, thickness, borderColor, bgColor)
	{
		point = this.mapGridToCanvasPoint(point);
		let ctx = this.getContext();

		radius = radius || 2;
		if(radius <= 0)
		{
			console.log('Skip rendering dot with zero radius');
			return;
		}

		ctx.beginPath();
		ctx.arc(point.x, point.y, radius || 2, 0, Math.PI * 2, false);
		ctx.closePath();
		ctx.lineWidth = thickness || 0;
		ctx.strokeStyle = borderColor || 'transparent';
		ctx.fillStyle = bgColor || 'transparent';
		ctx.fill();
		ctx.stroke();
	}

	nGon(points, thickness, borderColor, bgColor)
	{
		let ctx = this.getContext();
		let point = null;

		ctx.beginPath();
		for(let k = 0; k < points.length; k++)
		{
			point =  this.mapGridToCanvasPoint(points[k]);

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
		ctx.fillStyle = bgColor || 'transparent';
		ctx.fill();
	}

	line(from, to, color, thickness)
	{
		from = this.mapGridToCanvasPoint(from);
		to = this.mapGridToCanvasPoint(to);

		thickness = thickness || 1;
		color = color || '#000000';

		let ctx = this.getContext();
		let o = thickness % 2 ? 0.5 : 0;

		ctx.beginPath();
		ctx.moveTo(from.x + o, from.y + o);
		ctx.lineWidth = thickness;
		ctx.strokeStyle = color;
		ctx.lineTo(to.x + o, to.y + o);
		ctx.stroke();
	}

	mapDataToGridPoint(point)
	{
		let m = this.getMeasures();

		// return new AW.UI.Chart.Point(
		//   -m.valueOffsetX +Math.floor(point.x * m.valueAspectX),
		//   -m.valueOffsetY +Math.floor(point.y * m.valueAspectY)
		// );

		return new AW.UI.Chart.Point(
			point.x * m.unitX,
			point.y * m.unitY
		);
	}
	/**
	 * Map grid pixels into data values
	 * @param point
	 */
	mapGridToDataPoint(point)
	{
		let m = this.getMeasures();

		return {
			x: Math.floor(point.x / m.unitX),
			y: Math.floor(point.y / m.unitY)
		};
	}

	mapGridToCanvasPoint(point)
	{
		if(point.isGlobal())
		{
			return this.mapGlobalGridToCanvasPoint(point);
		}
		else
		{
			return this.mapRelativeGridToCanvasPoint(point);
		}
	}

	/**
	 * Maps global (from bottom left corner) grid coordinates (GC) into the canvas coordinates
	 * @param point
	 * @param useGrid If set to false, point is treated to be relative to canvas corner and padding,
	 * otherwise point is treated as world coordinates
	 * @returns {{x: *, y: number}}
	 */
	mapGlobalGridToCanvasPoint(point)
	{
		return {
			x: point.x,
			y: this.getMeasures().height - point.y
		};
	}
	/**
	 * Maps relative (including padding and grid center) grid coordinates (GC) into the canvas coordinates
	 * @param point
	 * @returns {*|{x, y}|{x: *, y: number}}
	 */
	mapRelativeGridToCanvasPoint(point)
	{
		let m = this.getMeasures();

		return this.mapGlobalGridToCanvasPoint({
			x: point.x + this.option('center').x + m.padLeft,
			y: point.y + this.option('center').y + m.padBottom
		});
	}

	mapGlobalCanvasToGridPoint(point)
	{
		return {
			x: point.x,
			y: this.getMeasures().heightPadded - point.y
		};
	}

	mapCanvasToGridPoint(point)
	{
		let m = this.getMeasures();
		let center = this.option('center');

		return this.mapGlobalCanvasToGridPoint({
			x: point.x - center.x - m.padLeft,
			y: point.y - center.y - m.padTop
		});
	}

	getCanvasHeight()
	{
		// todo: rewrite in native clientHeight
		return $(this.control('canvas')).height();
	}

	getCanvasWidth()
	{
		// todo: rewrite in native clientWidth
		return $(this.control('canvas')).width();
	}

	clearCanvas()
	{
		this.getCanvas().width = this.getCanvas().width;
	}

	// point manager

	setPoint(point)
	{
		this.vars.data.values[point.x] = point;
		this.resetOrder();
	}

	unsetPointAt(x)
	{
		if(this.hasPointAt(x))
		{
			let y = this.vars.data.values[x].y;
			delete(this.vars.data.values[x]);
			this.resetOrder();

			return y;
		}

		return null;
	}

	hasPointAt(x)
	{
		return typeof this.vars.data.values[x] != 'undefined';
	}

	resetOrder()
	{
		this.vars.data.order = _.orderBy(this.vars.data.values, ['x'], ['asc']).map(function(item){
			return item.x;
		});
	}

	// iterator api

	count()
	{
		return this.vars.data.order.length;
	}

	each(cb)
	{
		let key = null;
		for(let k = 0; k < this.vars.data.order.length; k++)
		{
			key = this.vars.data.order[k];
			if(cb.apply(this, [this.vars.data.values[key], key, k]) === true)
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

		return this.vars.data.values[this.vars.data.order[k]];
	}

	first()
	{
		return this.nth(0);
	}

	last()
	{
		return this.nth(this.count() - 1);
	}

	////////////////////////////////////
	// todo: related later
	control(id)
	{
		if(typeof this.sys.cache[id] == 'undefined')
		{
			let node = this.scope().querySelector('.js-'+this.code()+'-'+id);
			if(node)
			{
				this.sys.cache[id] = node;
			}

			return node;
		}

		return this.sys.cache[id];
	}

	option(name)
	{
		if(typeof this.options[name] != 'undefined')
		{
			return this.options[name];
		}

		return null;
	}

	scope()
	{
		// todo: check if native or not
		return this.sys.scope.get(0);
	}
};

export default yachart;
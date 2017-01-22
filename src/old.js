(function(){
	"use strict";

	AW.namespace('AW.UI');

	if(AW.UI.Chart)
	{
		return;
	}

	/**
	 * todo options:
	 *
	 * 1) fitX: true|false
	 * 2) fitY: true|false
	 * 3) aspectRatio: 1|number
	 * 4) xAlign: left|right
	 * 5) yAlign: top|bottom
	 */

	AW.UI.Chart = function(options)
	{
		this.sys = {
			code: 'griddy',
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

		this.options = _.merge({
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
			var data = this.option('data');
			for(var k = 0; k < data.length; k++)
			{
				this.addPoint(data[k][0], data[k][1], {
					show: false
				});
			}

			this.showInitialData();
		}

		this.renderFrame();
	};
	AW.UI.Chart.prototype = {

		fitCanvas: function()
		{
			var h = $(this.scope()).height();
			var w = $(this.scope()).width();

			var canvas = this.getCanvas();
			canvas.setAttribute('height', h);
			canvas.setAttribute('width', w);

			this.dropMeasures();
		},

		bindEvents: function()
		{
			$(window).on('resize', this.onResize.bind(this));

			// also, window resize, window scroll, any object changed at the chart
			$(this.getCanvas()).on('mousemove', this.onMouseMove.bind(this));
			$(this.getCanvas()).on('click', this.onMouseClick.bind(this));
		},

		onMouseClick: function(e)
		{
			e = e || window.event;

			for(var k in this.vars.collisions)
			{
				if(this.vars.collisions.hasOwnProperty(k))
				{
					this.vars.collisions[k].mouseClick(e);
				}
			}

			this.mouseClick(this.getCursorCoordinates(), e);
		},

		onMouseMove: function(e)
		{
			e = e || window.event;

			var mouse = this.vars.mouse;
			var docElement = document.documentElement;
			var docBody = document.body;

			// save last global coordinates
			mouse.x = e.pageX ?
				e.pageX :
				(e.clientX ? e.clientX + (docElement.scrollLeft || docBody.scrollLeft) - docElement.clientLeft : 0);
			mouse.y = e.pageY ?
				e.pageY :
				(e.clientY ? e.clientY + (docElement.scrollTop || docBody.scrollTop) - docElement.clientTop : 0);

			this.trackCollisions();
		},

		onResize: function()
		{
			var h = $(this.scope()).height();
			var w = $(this.scope()).width();

			if(this.vars.prevScopeSize.width != w || this.vars.prevScopeSize.height != h)
			{
				this.fitCanvas();
				this.renderFrame();

				this.vars.prevScopeSize.width = w;
				this.vars.prevScopeSize.height = h;
			}
		},

		renderFrame: function()
		{
			this.clearCanvas();
			this.renderGrid();
			this.renderData();
		},

		mouseClick: function(coords)
		{
			var point = this.mapGridToDataPoint(coords);

			this.addPoint(point.x, point.y, {
				show: true
			});
		},

		/////////////////////////////////////////
		/// Grid

		dropMeasures: function()
		{
			this.vars.measures = null;
		},

		getStyle: function()
		{
			if(this.vars.styles === null)
			{
				var gridStyle = this.getStyleByClassName('grid');
				var canvasStyle = this.getStyleByClassName('canvas');
				var hAxisStyle = this.getStyleByClassName('haxis-line');
				var vAxisStyle = this.getStyleByClassName('vaxis-line');
				var gridLineStyle = this.getStyleByClassName('grid-line');
				var dataLineStyle = this.getStyleByClassName('data-line');
				var dataPointStyle = this.getStyleByClassName('data-point');
				var dataPointHoverStyle = this.getStyleByClassName('data-point-hover');
				var dataFillStyle = this.getStyleByClassName('data-fill');

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
		},

		getMeasures: function()
		{
			if(this.vars.measures === null)
			{
				var style = this.getStyle();

				var height = this.getCanvasHeight();
				var width = this.getCanvasWidth();

				var padTop = style.padding.top;
				var padRight = style.padding.right;
				var padBottom = style.padding.bottom;
				var padLeft = style.padding.left;

				var heightPadded = height - padTop - padBottom;
				var widthPadded = width - padLeft - padRight;

				var unitSize = 10; // pixels in unit

				var valueRangeX = [0, widthPadded/unitSize];
				var valueRangeY = [0, heightPadded/unitSize];

				//var size = this.getDataSquare();
				// var dY = size.y[1] - size.y[0];
				// var dX = size.x[1] - size.x[0];

				//console.dir(dX+'x'+dY+' at '+width+'x'+height);

				// var valueAspectY = 1; // no resize if there is only one unique Y value
				// if(dY)
				// {
				//   valueAspectY = heightPadded / dY;
				// }
				// var valueAspectX = 1; // no resize if there is only one unique X value
				// if(dX)
				// {
				//   valueAspectX = widthPadded / dX;
				// }

				// todo: preserve aspect between valueAspectX and valueAspectY?

				// var valueOffsetX = size.x[0] * valueAspectX;
				// var valueOffsetY = size.y[0] * valueAspectY;

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
		},

		renderGrid: function()
		{
			this.renderBackground();

			var m = this.getMeasures();
			var st = this.getStyle();

			// grid lines
			var step = 0;
			for(var k = 0; k < 50; k++)
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
			for(k = 0; k < 50; k++)
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
		},

		renderBackground: function()
		{
			var m = this.getMeasures();
			var style = this.getStyle();

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
		},

		renderData: function()
		{
			var style = this.getStyle();

			if(this.count() > 1)
			{
				var m = this.getMeasures();

				//draw under-line fill
				var points = [
					new AW.UI.Chart.Point(this.first().getVisibleState().x + m.padLeft, m.padBottom, true)
				];
				this.each(function(item){
					points.push(item.getVisibleState().getPoint());
				});
				points.push(new AW.UI.Chart.Point(this.last().getVisibleState().x + m.padLeft, m.padBottom, true));
				this.nGon(points, 0, null, style.data.fill.color);

				//draw lines
				var percent = 0;
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
		},

		getContext: function()
		{
			return this.getCanvas().getContext("2d");
		},

		getCanvas: function()
		{
			return this.control('canvas');
		},

		////////////////////////////////////
		// collision (mouse-object) trackers

		trackCollisions: function()
		{
			// need to get relative mouse coordinates
			var p = this.getCursorCoordinates();
			if(p !== null)
			{
				// now scan each point and check if we are inside round
				// todo: actually, there could be a better algorithm (Sweep and prune)
				var point = null;
				var pointId = null;
				var key = null;
				for(var k = 0; k < this.vars.data.order.length; k++)
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
		},

		getCursorCoordinates: function()
		{
			var mouse = this.vars.mouse;
			var canvas = $(this.getCanvas());

			var p = {x: mouse.x - canvas.offset().left, y: mouse.y - canvas.offset().top};

			p = this.mapCanvasToGridPoint(p);
			p.x = Math.floor(p.x);

			return p;
		},

		addPoint: function(x, y, params)
		{
			this.unsetPointAt(x);

			var point = new AW.UI.Chart.DataPoint({
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
				var startY = this.getYFromNeighbourPoints(point);

				console.dir('prev y = '+startY);

				var moveStart = null;
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
		},

		removePointAt: function(x)
		{
			// todo
		},

		getYFromNeighbourPoints: function(point)
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

			for(var k = 0; k < this.count(); k++)
			{
				if(this.nth(k).dataX == point.dataX)
				{
					return this.findY(point.x, this.nth(k - 1), this.nth(k + 1));
				}
			}

			return null;
		},

		findY: function(x, p1, p2)
		{
			return -(((p1.x*p2.y - p2.x*p1.y) - (p1.y - p2.y)*x ) / (p2.x - p1.x));
		},

		showInitialData: function()
		{
			if(!this.count())
			{
				return;
			}

			var todo = [];
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
				var animationTime = Math.floor(300 / this.count());

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
		},

		getDataSquare: function()
		{
			if(this.vars.dataSquare === null)
			{
				if(this.vars.data.length == 0)
				{
					this.vars.dataSquare = {x: [0, 0], y: [0, 0]};
				}

				var maxX = -Infinity;
				var minX = Infinity;
				var maxY = -Infinity;
				var minY = Infinity;
				for(var k = 0; k < this.vars.data.length; k++)
				{
					var next = this.vars.data[k];
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
		},

		getStyleByClassName: function(className)
		{
			var node = $('<div class="'+this.code()+'-'+className+'">');
			this.getNodeSandBox().append(node);

			return window.getComputedStyle(node.get(0));
		},

		getNodeSandBox: function()
		{
			if(this.vars.nodeSandBox == null)
			{
				this.vars.nodeSandBox = $('<div style="height:0;width:0;overflow:hidden;">');
				$(this.scope()).append(this.vars.nodeSandBox);
			}

			return this.vars.nodeSandBox;
		},

		////////////////////////////////////
		// animation handlers

		getFlow: function()
		{
			if(!this.vars.aFlow)
			{
				this.vars.aFlow = new AW.UI.Chart.Flow();
				this.vars.aFlow.parent(this);
			}

			return this.vars.aFlow;
		},

		////////////////////////////////////
		// rendering api

		rectangle: function(point, size, color, bgColor, thickness)
		{
			point = this.mapGridToCanvasPoint(point);

			thickness = thickness || 1;

			var ctx = this.getContext();
			var o = thickness % 2 ? 0.5 : 0;

			ctx.beginPath();
			ctx.rect(point.x + o, point.y + o, size.w, -size.h);
			ctx.closePath();
			ctx.lineWidth = 1;
			ctx.strokeStyle = color || 'transparent';
			ctx.fillStyle = bgColor || 'transparent';
			ctx.fill();
			ctx.stroke();
		},

		dot: function(point, radius, thickness, borderColor, bgColor)
		{
			point = this.mapGridToCanvasPoint(point);
			var ctx = this.getContext();

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
		},

		nGon: function(points, thickness, borderColor, bgColor)
		{
			var ctx = this.getContext();
			var point = null;

			ctx.beginPath();
			for(var k = 0; k < points.length; k++)
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
		},

		line: function(from, to, color, thickness)
		{
			from = this.mapGridToCanvasPoint(from);
			to = this.mapGridToCanvasPoint(to);

			thickness = thickness || 1;
			color = color || '#000000';

			var ctx = this.getContext();
			var o = thickness % 2 ? 0.5 : 0;

			ctx.beginPath();
			ctx.moveTo(from.x + o, from.y + o);
			ctx.lineWidth = thickness;
			ctx.strokeStyle = color;
			ctx.lineTo(to.x + o, to.y + o);
			ctx.stroke();
		},

		mapDataToGridPoint: function(point)
		{
			var m = this.getMeasures();

			// return new AW.UI.Chart.Point(
			//   -m.valueOffsetX +Math.floor(point.x * m.valueAspectX),
			//   -m.valueOffsetY +Math.floor(point.y * m.valueAspectY)
			// );

			return new AW.UI.Chart.Point(
				point.x * m.unitX,
				point.y * m.unitY
			);
		},
		/**
		 * Map grid pixels into data values
		 * @param point
		 */
		mapGridToDataPoint: function(point)
		{
			var m = this.getMeasures();

			return {
				x: Math.floor(point.x / m.unitX),
				y: Math.floor(point.y / m.unitY)
			};
		},

		mapGridToCanvasPoint: function(point)
		{
			if(point.isGlobal())
			{
				return this.mapGlobalGridToCanvasPoint(point);
			}
			else
			{
				return this.mapRelativeGridToCanvasPoint(point);
			}
		},

		/**
		 * Maps global (from bottom left corner) grid coordinates (GC) into the canvas coordinates
		 * @param point
		 * @param useGrid If set to false, point is treated to be relative to canvas corner and padding,
		 * otherwise point is treated as world coordinates
		 * @returns {{x: *, y: number}}
		 */
		mapGlobalGridToCanvasPoint: function(point)
		{
			return {
				x: point.x,
				y: this.getMeasures().height - point.y
			};
		},
		/**
		 * Maps relative (including padding and grid center) grid coordinates (GC) into the canvas coordinates
		 * @param point
		 * @returns {*|{x, y}|{x: *, y: number}}
		 */
		mapRelativeGridToCanvasPoint: function(point)
		{
			var m = this.getMeasures();

			return this.mapGlobalGridToCanvasPoint({
				x: point.x + this.option('center').x + m.padLeft,
				y: point.y + this.option('center').y + m.padBottom
			});
		},

		mapGlobalCanvasToGridPoint: function(point)
		{
			return {
				x: point.x,
				y: this.getMeasures().heightPadded - point.y
			};
		},

		mapCanvasToGridPoint: function(point)
		{
			var m = this.getMeasures();
			var center = this.option('center');

			return this.mapGlobalCanvasToGridPoint({
				x: point.x - center.x - m.padLeft,
				y: point.y - center.y - m.padTop
			});
		},

		getCanvasHeight: function()
		{
			// todo: rewrite in native clientHeight
			return $(this.control('canvas')).height();
		},

		getCanvasWidth: function()
		{
			// todo: rewrite in native clientWidth
			return $(this.control('canvas')).width();
		},

		clearCanvas: function()
		{
			this.getCanvas().width = this.getCanvas().width;
		},

		// point manager

		setPoint: function(point)
		{
			this.vars.data.values[point.x] = point;
			this.resetOrder();
		},

		unsetPointAt: function(x)
		{
			if(this.hasPointAt(x))
			{
				var y = this.vars.data.values[x].y;
				delete(this.vars.data.values[x]);
				this.resetOrder();

				return y;
			}

			return null;
		},

		hasPointAt: function(x)
		{
			return typeof this.vars.data.values[x] != 'undefined';
		},

		resetOrder: function()
		{
			this.vars.data.order = _.orderBy(this.vars.data.values, ['x'], ['asc']).map(function(item){
				return item.x;
			});
		},

		// iterator api

		count: function()
		{
			return this.vars.data.order.length;
		},

		each: function(cb)
		{
			var key = null;
			for(var k = 0; k < this.vars.data.order.length; k++)
			{
				key = this.vars.data.order[k];
				if(cb.apply(this, [this.vars.data.values[key], key, k]) === true)
				{
					break;
				}
			}
		},

		nth: function(k)
		{
			if(k < 0 || k >= this.count())
			{
				return null;
			}

			return this.vars.data.values[this.vars.data.order[k]];
		},

		first: function()
		{
			return this.nth(0);
		},

		last: function()
		{
			return this.nth(this.count() - 1);
		},

		////////////////////////////////////
		// todo: related later
		control: function(id)
		{
			if(typeof this.sys.cache[id] == 'undefined')
			{
				var node = this.scope().querySelector('.js-'+this.code()+'-'+id);
				if(node)
				{
					this.sys.cache[id] = node;
				}

				return node;
			}

			return this.sys.cache[id];
		},

		option: function(name)
		{
			if(typeof this.options[name] != 'undefined')
			{
				return this.options[name];
			}

			return null;
		},

		scope: function()
		{
			// todo: check if native or not
			return this.sys.scope.get(0);
		},

		code: function()
		{
			return this.sys.code;
		}
	};

	AW.UI.Chart.DataPoint = function(data)
	{
		this.vars = {
			x: data.x || 0,
			y: data.y || 0,
			radius: data.radius || 0,

			realState: null,
			visibleState: null,

			parent: null,
			id: _.random(10000, 99999)
		};

		Object.defineProperty(this, 'x', {
			enumerable: true,
			get: this.getX,
			set: function(){}
		});
		Object.defineProperty(this, 'y', {
			enumerable: true,
			get: this.getY,
			set: function(){}
		});

		Object.defineProperty(this, 'dataX', {
			enumerable: true,
			get: this.getDataX,
			set: function(){}
		});
		Object.defineProperty(this, 'dataY', {
			enumerable: true,
			get: this.getDataY,
			set: function(){}
		});

		this.parent(data.parent);
	};
	AW.UI.Chart.DataPoint.prototype = {

		render: function()
		{
			var visibleState = this.getVisibleState();

			var radius = visibleState.radius;
			if(!radius)
			{
				return; // do not draw circle with zero radius
			}

			var pointStyle = this.parent().getStyle().data.point;
			var gp = visibleState.getPoint();

			// border, background
			this.parent().dot(
				gp,
				radius,
				pointStyle.border.height,
				pointStyle.border.color,
				pointStyle.color
			);
		},

		isVisible: function()
		{
			return this.getRealState().radius > 0;
		},

		isPointInside: function(point)
		{
			var vSt = this.getVisibleState();

			// todo: algorithm of this function depends on geometry of data point. currently it is a circle
			var gp = vSt;
			var r = vSt.radius;

			return Math.pow(point.x - gp.x, 2) + Math.pow(point.y - gp.y, 2) <= r*r;
		},

		getVisibilityPercent: function()
		{
			var radiusNow = this.getRealState().radius;
			var radiusShouldBe = this.getRadiusStyle();

			return (radiusNow / radiusShouldBe);
		},

		/**
		 * Function is called when point first appeared
		 * @returns {*}
		 */
		show: function(parameters)
		{
			var promises = [];
			if(parameters.animateAppear !== false)
			{
				promises.push(this.setRadius(
					this.getRadiusStyle(),
					{
						duration: parameters.durationAppear
					}
				));
			}
			if(parameters.animateMove !== false)
			{
				promises.push(this.animateRelocationOnShow(
					{
						duration: parameters.durationMove,
						moveStart: parameters.moveStart
					}
				));
			}

			return AW.Promise.all(promises);
		},

		hide: function()
		{
			return this.setRadius(0);
		},

		mouseEnter: function()
		{
			var style = this.parent().getStyle();
			this.setRadius(Math.floor(style.data.point.hover.height / 2));
		},

		mouseLeave: function()
		{
			var style = this.parent().getStyle();
			this.setRadius(Math.floor(style.data.point.height / 2));
		},

		mouseClick: function(e)
		{
			// todo
			console.dir('clicked at '+this.getId());
		},

		parent: function(parent)
		{
			if(parent)
			{
				this.vars.parent = parent;
				this.setLocation(this.parent().mapDataToGridPoint(this.getDataPoint()), true);

				return;
			}

			return this.vars.parent;
		},

		getId: function()
		{
			return this.vars.id;
		},

		getDataPoint: function()
		{
			return new AW.UI.Chart.Point(
				this.vars.x,
				this.vars.y,
				false
			)
		},

		getRealState: function()
		{
			if(this.vars.realState === null)
			{
				this.vars.realState = new AW.UI.Chart.DataPoint.State({
					parent: this
				});
			}

			return this.vars.realState;
		},

		setRadius: function(radius, parameters)
		{
			this.getRealState().radius = radius;

			return this.animateRadius(parameters);
		},

		setLocation: function(point, init)
		{
			var rSt = this.getRealState();

			rSt.x = point.x;
			rSt.y = point.y;

			var vInit = this.isVisibleInitialized();
			var vSt = this.getVisibleState();

			if(init || vInit)
			{
				vSt.x = point.x;
				vSt.y = point.y;

				var p = new AW.Promise();
				p.resolve();

				return p;
			}
			else
			{
				return this.animateRelocation();
			}
		},

		animateRelocationOnShow: function()
		{
			var p = new AW.Promise();
			p.resolve();

			return p;
		},

		animateRelocation: function()
		{
			var tag = 'point_relocate_'+this.getId();

			var rSt = this.getRealState();
			var vSt = this.getVisibleState();

			var flow = this.parent().getFlow();
			flow.done(tag, false); // kill previous animation, if any

			if(rSt.x != vSt.x || rSt.y != vSt.y)
			{
				return flow.add({
					cb: function(step){
						vSt.x = step.x;
						vSt.y = step.y;
					},
					tag: tag,
					duration: [200, 400],
					start: {
						x: vSt.x,
						y: vSt.y
					},
					end: {
						x: rSt.x,
						y: rSt.y
					}
				});
			}
			else
			{
				var p = new AW.Promise();
				p.resolve();

				return p;
			}
		},

		animateRadius: function(parameters)
		{
			var tag = 'point_resize_'+this.getId();

			var rSt = this.getRealState();
			var vSt = this.getVisibleState();

			var flow = this.parent().getFlow();
			flow.done(tag, false); // kill previous animation, if any

			parameters = parameters || {};
			var duration = parameters.duration || 100;

			if(rSt.radius != vSt.radius)
			{
				return flow.add({
					cb: function(step){
						vSt.radius = step.radius;
					},
					tag: tag,
					duration: duration,
					start: {
						radius: vSt.radius
					},
					end: {
						radius: rSt.radius
					}
				});
			}
			else
			{
				var p = new AW.Promise();
				p.resolve();

				return p;
			}
		},

		getX: function()
		{
			return this.getRealState().x;
		},

		getY: function()
		{
			return this.getRealState().y;
		},

		getDataX: function()
		{
			return this.vars.x;
		},

		getDataY: function()
		{
			return this.vars.y;
		},

		getRadiusStyle: function()
		{
			return Math.floor(this.parent().getStyle().data.point.height / 2);
		},

		getVisibleState: function()
		{
			if(this.vars.visibleState === null)
			{
				this.vars.visibleState = new AW.UI.Chart.DataPoint.State({
					parent: this
				});
			}

			return this.vars.visibleState;
		},

		isVisibleInitialized: function()
		{
			return this.vars.visibleState !== null;
		},

		dump: function()
		{
			console.dir(this.x+', '+this.y);
		}
	};

	AW.UI.Chart.DataPoint.State = function(data)
	{
		this.vars = {
			parent: null,
			point: new AW.UI.Chart.Point(data.x || 0, data.y || 0),
			radius: data.radius || 0
		};

		Object.defineProperty(this, 'radius', {
			enumerable: true,
			get: this.getRadius,
			set: this.setRadius
		});
		Object.defineProperty(this, 'x', {
			enumerable: true,
			get: this.getX,
			set: this.setX
		});
		Object.defineProperty(this, 'y', {
			enumerable: true,
			get: this.getY,
			set: this.setY
		});
	};
	AW.UI.Chart.DataPoint.State.prototype = {

		getPoint: function()
		{
			return this.vars.point;
		},

		getPointClone: function()
		{
			return this.vars.point.clone();
		},

		getRadius: function()
		{
			return this.vars.radius;
		},
		setRadius: function(value)
		{
			this.vars.radius = value;
		},

		getX: function()
		{
			return this.vars.point.x;
		},
		setX: function(value)
		{
			this.vars.point.x = value;
		},
		getY: function()
		{
			return this.vars.point.y;
		},
		setY: function(value)
		{
			this.vars.point.y = value;
		},

		dump: function()
		{
			console.dir(this.vars.point.x+' '+this.vars.point.y+' r='+this.vars.radius);
		}
	};

	//////////////////////////////////////////////////////
	AW.UI.Chart.Point = function(x, y, global)
	{
		this.vars = {
			x: x,
			y: y,
			global: global || false
		};

		Object.defineProperty(this, 'x', {
			enumerable: true,
			get: this.getX,
			set: this.setX
		});
		Object.defineProperty(this, 'y', {
			enumerable: true,
			get: this.getY,
			set: this.setY
		});
	};
	AW.UI.Chart.Point.prototype = {
		isGlobal: function()
		{
			return this.vars.global;
		},
		getX: function()
		{
			return this.vars.x;
		},
		setX: function(value)
		{
			this.vars.x = value;
		},
		getY: function()
		{
			return this.vars.y;
		},
		setY: function(value)
		{
			this.vars.y = value;
		},

		clone: function()
		{
			// todo: this.constructor later
			return new AW.UI.Chart.Point(this.x, this.y, this.isGlobal());
		}
	};

	AW.UI.Chart.Flow = function()
	{
		this.vars = {
			pool: {},
			order: [],
			frameRate: 20,
			lastFrameAt: (new Date()).getSeconds(),
			tickThis: this.tick.bind(this),
			tickRequest: null,
			chart: null,
			date: new Date()
		};
	};
	AW.UI.Chart.Flow.prototype = {
		getFrameRate: function()
		{
			return this.vars.frameRate;
		},
		startTicking: function()
		{
			if(this.vars.tickRequest === null)
			{
				this.vars.tickRequest = window.requestAnimationFrame(this.vars.tickThis);
			}
		},
		stopTicking: function()
		{
			if(this.vars.tickRequest !== null)
			{
				window.cancelAnimationFrame(this.vars.tickRequest);
			}
			this.vars.tickRequest = null;
		},
		tick: function(time)
		{
			if(time - this.vars.lastFrameAt > this.vars.frameRate)
			{
				var len = this.vars.order.length;

				//console.dir('tick: dT = '+(time - this.vars.lastFrameAt)+' stack size='+len);

				var animation = null;
				var done = [];
				for(var k = 0; k < len; k++)
				{
					animation = this.vars.pool[this.vars.order[k]];
					if(animation.nextFrame() === true)
					{
						done.push(animation.getTag());
					}
				}

				for(k = 0; k < done.length; k++)
				{
					this.done(done[k], true);
				}

				this.parent().renderFrame();

				this.vars.lastFrameAt = time;
			}

			if(this.vars.tickRequest !== null) // we need to continue chaining
			{
				this.vars.tickRequest = window.requestAnimationFrame(this.vars.tickThis);
			}
		},
		add: function(params)
		{
			params.parent = this;
			var animation = new AW.UI.Chart.Flow.Task(params);
			var tag = animation.getTag();

			this.vars.pool[tag] = animation;
			this.vars.order.push(tag);

			this.startTicking();

			return animation.getPromise();
		},
		done: function(tag, how)
		{
			if(!this.vars.pool[tag])
			{
				return; // no such animation
			}

			var p = this.vars.pool[tag].getPromise();
			if(how)
			{
				p.resolve();
			}
			else
			{
				p.reject();
			}

			delete(this.vars.pool[tag]);
			_.pull(this.vars.order, tag);

			if(!this.vars.order.length)
			{
				this.stopTicking();
			}

			return this;
		},
		parent: function(parent)
		{
			if(parent)
			{
				this.vars.parent = parent;
				return;
			}

			return this.vars.parent;
		}
	};

	AW.UI.Chart.Flow.Task = function(options)
	{
		this.opts = _.merge({
			cb: function(){},
			duration: 1000,
			tag: _.random(10000, 99999),
			start: {},
			end: {}
		}, options || {});

		if(_.isArray(this.opts.duration))
		{
			this.opts.duration = _.random(this.opts.duration[0], this.opts.duration[1]);
		}
		if(!this.opts.duration)
		{
			this.opts.duration = 1000; // ensure we wont get zero step count
		}

		this.vars = {
			step: 0,
			current: _.clone(this.opts.start)
		};

		this.parent(options.parent);
		this.vars.steps = Math.ceil(this.opts.duration / this.parent().getFrameRate());
		this.vars.increments = this.calcIncrements();

		this.vars.promise = new AW.Promise();
	};
	AW.UI.Chart.Flow.Task.prototype = {

		calcIncrements: function()
		{
			var start = this.opts.start;
			var end = this.opts.end;
			var deltas = {};

			for(var k in start)
			{
				if(start.hasOwnProperty(k))
				{
					if(k in end)
					{
						deltas[k] = (end[k] - start[k]) / this.vars.steps;
					}
				}
			}

			return deltas;
		},

		applyIncrements: function()
		{
			for(var k in this.vars.increments)
			{
				if(this.vars.increments.hasOwnProperty(k))
				{
					this.vars.current[k] += this.vars.increments[k];
				}
			}
		},

		nextFrame: function()
		{
			this.vars.step++;

			var isLastFrame = this.vars.step == this.vars.steps;
			var stepData = {};
			if(isLastFrame)
			{
				stepData = this.opts.end;
			}
			else
			{
				this.applyIncrements();
				stepData = this.vars.current;
			}

			this.opts.cb.apply(this, [stepData]);

			return isLastFrame;
		},
		getTag: function()
		{
			return this.opts.tag;
		},

		parent: function(parent)
		{
			if(parent)
			{
				this.vars.parent = parent;
				return;
			}

			return this.vars.parent;
		},

		getPromise: function()
		{
			return this.vars.promise;
		}
	};

}).call(this);

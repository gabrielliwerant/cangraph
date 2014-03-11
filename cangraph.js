/**
 * Cangraph
 *
 * Graphing and function plotting for the HTML5 canvas. Main function plotting
 * engine was taken from the link below and modified.
 *
 * @link http://www.javascripter.net/faq/plotafunctiongraph.htm
 */
(function ($) {

    /**
     * Constructor and initialization
     *
     * @class Cangraph
     *
     * @param {String} canvasId The canvas element to draw on
     * @param {Object} options Allows us to change defaults upon instantiation
     */
    function Cangraph(canvasId, options) {
        var defaults = {
            axes: {
                xOffset: 0,
                yOffset: 0,
                scale: 40,
                showNegativeX: true
            }
        };
        var canvas;

        // Set canvas and context
        this.set('canvasId', canvasId);
        canvas = document.getElementById(this.canvasId);
        this.set('canvas', canvas);
        this.setContext();

        // Merge defaults with passed in options
        this.options = options || {};
        this.options = $.extend(true, {}, defaults, this.options);

        // Derive axes values from defaults/options and set on object
        this.setDerivedAxesProperties();
    }

    Cangraph.prototype.set = function (name, value) {
        if (value === null || typeof value === 'undefined') {
            console.log(name, 'is undefined or null!');

            return false;
        }

        this[name] = value;
    };

    Cangraph.prototype.setContext = function () {
        var context = this.canvas.getContext('2d');

        this.set('context', context);
    };

    Cangraph.prototype.setDerivedAxesProperties = function () {
        this.set('x0', this.options.axes.xOffset + .5 * this.canvas.width);
        this.set('y0', this.options.axes.yOffset + .5 * this.canvas.height);

        if (this.options.axes.showNegativeX) {
            this.set('xMin', 0);
        } else {
            this.set('xMin', this.x0);
        }
    };
    Cangraph.prototype.draw = function (fx) {
     var axes={};

     axes.x0 = .5 + .5*this.canvas.width;  // x0 pixels from left to x=0
     axes.y0 = .5 + .5*this.canvas.height; // y0 pixels from top to y=0
     axes.scale = 40;                 // 40 pixels from x=0 to x=1
     axes.doNegativeX = true;

     this.showAxes(this.context, axes);
     this.funGraph(this.context, fx, "rgb(11,153,11)", 1);
    };

    Cangraph.prototype.funGraph = function (ctx,func,color,thick) {
     var xx;
     var yy;
     var dx = 4;
     var scale = this.options.axes.scale;
     var iMax = Math.round((ctx.canvas.width-this.x0)/dx);
     var iMin = this.options.axes.showNegativeX ? Math.round(-this.x0/dx) : 0;
     ctx.beginPath();
     ctx.lineWidth = thick;
     ctx.strokeStyle = color;

     for (var i=iMin;i<=iMax;i++) {
      xx = dx*i; yy = scale*func(xx/scale);
      if (i==iMin) ctx.moveTo(this.x0+xx,this.y0-yy);
      else         ctx.lineTo(this.x0+xx,this.y0-yy);
     }
     ctx.stroke();
    };

    Cangraph.prototype.showAxes = function (ctx,axes) {
     var x0=axes.x0, w=ctx.canvas.width;
     var y0=axes.y0, h=ctx.canvas.height;
     var xmin = axes.doNegativeX ? 0 : x0;
     ctx.beginPath();
     ctx.strokeStyle = "rgb(128,128,128)";
     ctx.moveTo(xmin,y0); ctx.lineTo(w,y0);  // X axis
     ctx.moveTo(x0,0);    ctx.lineTo(x0,h);  // Y axis
     ctx.stroke();
    };

    // Attach object to global namespace
    this.Cangraph = Cangraph;
}).call(this, $);
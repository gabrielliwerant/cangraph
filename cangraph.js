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
                showNegativeX: true,
                strokeColor: '#000000'
            },
            graph: {
                strokeColor: '#1fcd38',
                lineWidth: '1'
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

    Cangraph.prototype.drawAxes = function (fx) {
        this.context.beginPath();
        this.context.strokeStyle = this.options.axes.strokeColor;
        this.context.moveTo(this.xMin, this.y0);
        this.context.lineTo(this.canvas.width, this.y0);
        this.context.moveTo(this.x0, 0);
        this.context.lineTo(this.x0, this.canvas.height);
        this.context.stroke();
    };

    Cangraph.prototype.drawGraph = function (fx) {
        var xx;
        var yy;
        var dx = 4;
        var scale = this.options.axes.scale;
        var iMax = Math.round((this.canvas.width - this.x0) / dx);
        var iMin;
        var i;

        if (this.options.axes.showNegativeX) {
            iMin = Math.round(-this.x0 / dx);
        } else {
            iMin = 0;
        }

        this.context.beginPath();
        this.context.lineWidth = this.options.graph.lineWidth;
        this.context.strokeStyle = this.options.graph.strokeColor;

        for (i = iMin; i <= iMax; i += 1) {
            xx = dx * i;
            yy = scale * fx(xx / scale);
            if (i === iMin) {
                this.context.moveTo(this.x0 + xx, this.y0 - yy);
            } else {
                this.context.lineTo(this.x0 + xx, this.y0 - yy);
            }
        }

        this.context.stroke();
    };

    // Attach object to global namespace
    this.Cangraph = Cangraph;
}).call(this, $);
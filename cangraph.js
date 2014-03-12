/**
 * Cangraph
 *
 * Graphing and function plotting for the HTML5 canvas. Main function plotting
 * engine was taken from the link below and modified.
 *
 * @link http://www.javascripter.net/faq/plotafunctiongraph.htm
 *
 * @todo Allow setting into nesting objects for better organization
 * @todo Make plot able to ignore negative values for y
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
                showNegativeY: true,
                strokeColor: '#000000',
                showX: true,
                showY: true,
                markings: {
                    showX: true,
                    showY: true,
                    xInterval: 10,
                    yInterval: 10,
                    xHeight: 5,
                    yWidth: 5
                }
            },
            graph: {
                strokeColor: '#1fcd38',
                lineWidth: '1',
                scale: 4
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

        this.setDerivedAxesProperties();
        this.setDerivedGraphProperties();
    }

    /**
     * Determines if a value is undefined or null and presents and error message
     *
     * @method validate
     *
     * @param {String} name Description for value
     * @param {Mixed} value To validate
     */
    Cangraph.prototype.validate = function (name, value) {
        if (value === null || typeof value === 'undefined') {
            console.log(name, 'is undefined or null!');

            return false;
        }

        return true;
    };

    /**
     * Basic setter to help provide validation and error checking
     *
     * @method set
     *
     * @param {String} name Member name to store value
     * @param {Mixed} value To store in member name
     */
    Cangraph.prototype.set = function (name, value) {
        if (this.validate(name, value)) {
            this[name] = value;
        }
    };

    /**
     * Set canvas context for later use
     *
     * @method setContext
     */
    Cangraph.prototype.setContext = function () {
        var context = this.canvas.getContext('2d');

        this.set('context', context);
    };

    /**
     * Set axes properties, that can be derived from base values, for later use
     *
     * @method setDerivedAxesProperties
     */
    Cangraph.prototype.setDerivedAxesProperties = function () {
        this.set('x0', this.options.axes.xOffset + .5 * this.canvas.width);
        this.set('y0', this.options.axes.yOffset + .5 * this.canvas.height);

        if (this.options.axes.showNegativeX) {
            this.set('xMin', 0);
        } else {
            this.set('xMin', this.x0);
        }
    };

    /**
     * Set graph properties, that can be derived from base values, for later
     * use.
     *
     * @method setDerivedGraphProperties
     */
    Cangraph.prototype.setDerivedGraphProperties = function () {
        this.set('graphPlottingMax', Math.round((this.canvas.width - this.x0) / this.options.graph.scale));

        if (this.options.axes.showNegativeX) {
            this.set('graphPlottingMin', Math.round(-this.x0 / this.options.graph.scale));
        } else {
            this.set('graphPlottingMin', 0);
        }
    };

    /**
     * Allows us to draw the axes of the graph
     *
     * @method drawAxes
     *
     * @todo Keep axes markings separate from axes lines?
     */
    Cangraph.prototype.drawAxes = function () {
        this.context.beginPath();
        this.context.strokeStyle = this.options.axes.strokeColor;

        if (this.options.axes.showX) {
            this.context.moveTo(this.xMin, this.y0);
            this.context.lineTo(this.canvas.width, this.y0);
        }
        if (this.options.axes.showY) {
            if (this.options.axes.showNegativeY) {
                this.context.moveTo(this.x0, 0);
                this.context.lineTo(this.x0, this.canvas.height);
            } else {
                this.context.moveTo(this.x0, -this.y0);
                this.context.lineTo(this.x0, Math.ceil(this.canvas.height / 2));
            }
        }

        if (this.options.axes.markings.showX) {
            this.drawXAxisMarkings();
        }
        if (this.options.axes.markings.showY) {
            this.drawYAxisMarkings();
        }

        this.context.stroke();
    };

    /**
     * Draws markings for x-axis
     *
     * @method drawXAxisMarkings
     */
    Cangraph.prototype.drawXAxisMarkings = function () {
        var iX;
        var iXMax;
        var iXMaxScale = Math.ceil((this.canvas.width - this.xMin) / this.options.axes.markings.xInterval);

        if (this.options.axes.showNegativeX) {
            iX = 0;
            iXMax = Math.ceil(this.canvas.width - this.xMin);
        } else {
            iX = Math.ceil(this.canvas.width / 2);
            iXMax = this.canvas.width;
        }

        for (iX; iX <= iXMax; iX += 1) {
            if (iX % iXMaxScale === 0) {
                this.context.moveTo(iX, this.y0 + this.options.axes.markings.xHeight);
                this.context.lineTo(iX, this.y0 - this.options.axes.markings.xHeight);
                this.context.strokeStyle = this.options.axes.strokeColor;
            }
        }
    };

    /**
     * Draws markings for y-axis
     *
     * @method drawYAxisMarkings
     */
    Cangraph.prototype.drawYAxisMarkings = function () {
        var iY;
        var iYMax;
        var iYMaxScale = Math.ceil(this.canvas.height / this.options.axes.markings.yInterval);
        var halfCanvasHeight = Math.ceil(this.canvas.height / 2);

        if (this.options.axes.showNegativeY) {
            iY = 0;
            iYMax = Math.ceil(this.canvas.width - this.xMin);
        } else {
            iY = halfCanvasHeight;
            iYMax = this.canvas.height;
        }

        if (this.options.axes.markings.showY) {
            for (iY; iY <= iYMax; iY += 1) {
                if (iY % iYMaxScale === 0) {
                    this.context.moveTo(this.options.axes.markings.yWidth + halfCanvasHeight, iY);
                    this.context.lineTo(-this.options.axes.markings.yWidth + halfCanvasHeight, iY);
                    this.context.strokeStyle = this.options.axes.strokeColor;
                }
            }
        }
    };

    /**
     * Plots an arbitrary number of functions and draws them as graphs
     *
     * @method drawGraph
     *
     * @param {Object}
     *      @param {Function} fx Function to plot
     *      @param {String} strokeColor Optional color value to override default
     */
    Cangraph.prototype.drawGraph = function () {
        var x;
        var y;
        var i;
        var j;
        var fx;

        // Outer loop for function arguments
        for (i = 0; i < arguments.length; i += 1) {
            if ( ! this.validate('fx', arguments[i].fx)) {
                continue;
            }

            fx = arguments[i].fx;

            this.context.beginPath();

            // Set up line options
            this.context.lineWidth = this.options.graph.lineWidth;
            if (typeof arguments[i].strokeColor !== 'undefined') {
                this.context.strokeStyle = arguments[i].strokeColor;
            } else {
                this.context.strokeStyle = this.options.graph.strokeColor;
            }

            // Inner loop for function plotting
            for (j = this.graphPlottingMin; j <= this.graphPlottingMax; j += 1) {
                x = this.options.graph.scale * j;
                y = this.options.axes.scale * fx(x / this.options.axes.scale);

                if (j === this.graphPlottingMin) {
                    // Run only for the first iteration
                    this.context.moveTo(this.x0 + x, this.y0 - y);
                } else {
                    this.context.lineTo(this.x0 + x, this.y0 - y);
                }
            }

            this.context.stroke();
            this.context.closePath();
        }
    };

    // Attach object to global namespace
    this.Cangraph = Cangraph;
}).call(this, $);
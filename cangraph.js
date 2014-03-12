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
 * @todo Write standalone merge function to eliminate need for jquery
 */
(function ($) {

    /**
     * Constructor and initialization
     *
     * @class Cangraph
     *
     * @param {String} canvasId The canvas element to draw on
     * @param {Object} options Allows us to override defaults upon instantiation
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
                lineWidth: 3,
                smoothnessScale: 4
            },
            point: {
                strokeColor: '#e61a3f',
                lineWidth: 11,
                radius: 3,
                fillColor: '#000000',
                doPercent: true
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
        this.set('graphPlottingMax', Math.round((this.canvas.width - this.x0) / this.options.graph.smoothnessScale));

        if (this.options.axes.showNegativeX) {
            this.set('graphPlottingMin', Math.round(-this.x0 / this.options.graph.smoothnessScale));
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
     * Plots a function and draws it as a graph
     *
     * @method drawGraph
     *
     * @param {Function} fx Function to plot
     * @param {String} color Optional color value to override default
     */
    Cangraph.prototype.drawGraph = function (fx, color) {
        var x;
        var y;
        var i;

        this.context.beginPath();

        // Set up line options
        this.context.lineWidth = this.options.graph.lineWidth;
        if (typeof color !== 'undefined') {
            this.context.strokeStyle = color;
        } else {
            this.context.strokeStyle = this.options.graph.strokeColor;
        }

        // Loop for function plotting
        for (i = this.graphPlottingMin; i <= this.graphPlottingMax; i += 1) {
            x = this.options.graph.smoothnessScale * i;
            y = this.options.axes.scale * fx(x / this.options.axes.scale);

            if (i === this.graphPlottingMin) {
                // Run only for the first iteration
                this.context.moveTo(this.x0 + x, this.y0 - y);
            } else {
                this.context.lineTo(this.x0 + x, this.y0 - y);
            }
        }

        this.context.stroke();
        this.context.closePath();
    };

    /**
     * Based on our graph boundaries, find the equivalent x value as a percent
     * of possible x values.
     *
     * @method getXValueEquivalentForPercent
     *
     * @param {Integer} percent To determine proper x value for function
     */
    Cangraph.prototype.getXValueEquivalentFromPercent = function (percent) {
        var plottingWidth = this.graphPlottingMax * 2;
        var xValueEquivalentForPercent;
        var halfAxisPercent;

        if (percent >= 0 && percent <= 50) {
            halfAxisPercent = 50 - percent;
            xValueEquivalentForPercent = -Math.floor(plottingWidth * (halfAxisPercent / 100));
        } else if (percent > 50 && percent <= 100) {
            halfAxisPercent = percent - 50;
            xValueEquivalentForPercent = Math.floor(plottingWidth * (halfAxisPercent / 100));
        } else {
            console.log(percent, 'is not a valid percentage to use with graph. Please use a value from 0 to 100');

            return false;
        }

        return xValueEquivalentForPercent;
    };

    /**
     * Finds a single point on a function and plots it
     *
     * @method drawPlottedValue
     *
     * @param {Function} fx Function to plot point for
     * @param {Integer} value X value point to plot
     */
    Cangraph.prototype.drawPlottedValue = function (fx, value) {
        var x;
        var y;
        var j;
        var convertedPercent;

        this.context.beginPath();
        this.context.moveTo(this.x0 + x, this.y0 - y);

        if (this.options.point.doPercent) {
            convertedPercent = this.getXValueEquivalentFromPercent(value);

            if (convertedPercent) {
                x = this.options.graph.smoothnessScale * convertedPercent;
                y = this.options.axes.scale * fx(x / this.options.axes.scale);
            }
        } else {
            x = this.options.graph.smoothnessScale * value;
            y = this.options.axes.scale * fx(x / this.options.axes.scale);
        }

        this.context.arc(this.x0 + x, this.y0 - y, this.options.point.radius, 0, Math.PI * 2, false);
        this.context.strokeStyle = this.options.point.strokeColor;
        this.context.lineWidth = this.options.point.lineWidth;
        this.context.stroke();
        this.context.fillStyle = this.options.point.fillColor;
        this.context.fill();
        this.context.closePath();
    };

    // Attach object to global namespace
    this.Cangraph = Cangraph;
}).call(this, $);
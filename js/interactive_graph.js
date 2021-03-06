function InteractiveGraph(options) {
    this.plotOptions      = options.plotOptions;
    this.graph            = functionPlot(this.plotOptions);
    this.graphValues      = options.defaultValues;
    this.inputs           = $(options.inputSelector);
    this.fnFormat         = options.fn;
    this.initialDrawCb    = options.initialDrawCb;
    this.postDrawCb       = options.postDrawCb;
    this.coordinateSystem = undefined;

    this.htmlOverlay   = document.createElement('div');
    this.htmlOverlay.classList.add('graph-html-overlay');
    this.htmlOverlay.style.height     = this.plotOptions.height - this.graph.meta.margin.top  - this.graph.meta.margin.bottom  + 'px';
    this.htmlOverlay.style.width      = this.plotOptions.width  - this.graph.meta.margin.left - this.graph.meta.margin.right   + 'px';
    this.htmlOverlay.style.marginLeft = -this.plotOptions.width + this.graph.meta.margin.left + 'px';
    this.htmlOverlay.style.marginTop  = this.graph.meta.margin.top + 'px';
    $(this.plotOptions.target)[0].appendChild(this.htmlOverlay);

    var self = this;

    if (options.coordinateSystemSelector != undefined) {
        var coordinateSystemSelectors = $(options.coordinateSystemSelector);
        [].forEach.call(coordinateSystemSelectors, function(radio) {
            radio.addEventListener('change', function() {
                self.coordinateSystem = this.value;
                handleGraphInput();
            });
        });
        this.coordinateSystem = coordinateSystemSelectors[0].value;

        var linearFormat = this.graph.meta.yAxis.tickFormat();
        var semiLogFormat = function(d) {
            if (d < 3)
                return Math.pow(10, d).toString();
            else
                return '1E' + d;
        };

        setCoordinateSystem();
    }

    function setCoordinateSystem() {
        var format = null;
        if (self.coordinateSystem === 'linear')
            format = linearFormat;
        else if (self.coordinateSystem === 'semilog')
            format = semiLogFormat;
        
        if (format !== null)
            self.graph.meta.yAxis.tickFormat(format);

        self.graph.draw();
    }




    activateInitialDrawCb();

    activatePostDrawCb();

    [].forEach.call(this.inputs, function(input) {
        var name  = input.dataset.name;
        var value = input.dataset.value = self.graphValues[name];
        var min = input.dataset.min;
        if (min === undefined)
            min = 0;
        var max = input.dataset.max;
        if (max === undefined)
            max = 10;

        var typeInput  = input.querySelector(':scope > span > input');
        var rangeInput = input.querySelector(':scope > input');

        [typeInput, rangeInput].forEach(function(userInput) {
            userInput.value = value;
            userInput.min   = min;
            userInput.max   = max;
        });

        rangeInput.step = '.01';

        typeInput.addEventListener ('input', handleGraphTypeInput);
        rangeInput.addEventListener('input', handleGraphRangeInput);
    });

    function handleGraphTypeInput(e) {
        var parent = this.parentNode.parentNode;
        var rangeInput = parent.querySelector(':scope > input');
        var value = parseFloat(this.value, 10);

        rangeInput.value = this.value;

        handleGraphInput(parent, value);
    }

    function handleGraphRangeInput(e) {
        var parent = this.parentNode;
        var typeInput = parent.querySelector(':scope > span > input');
        var value = parseFloat(this.value, 10);

        typeInput.value = this.value;

        handleGraphInput(parent, value);
    }

    function handleGraphInput(input, value) {
        if (input !== undefined) {
            var name = input.dataset.name;
            self.graphValues[name] = value;
        }

        var fn = self.fnFormat;

        for (variable in self.graphValues) {
            fn = fn.replace(new RegExp('%' + variable, 'g'), self.graphValues[variable]);
        }

        if (self.coordinateSystem === 'semilog')
            fn = 'log10(' + fn + ')';

        self.plotOptions.data[0].fn = fn;

        self.graph = functionPlot(self.plotOptions);
        setCoordinateSystem();

        activatePostDrawCb();
    }

    function activateInitialDrawCb() {
        if(typeof self.initialDrawCb === 'function') {
            var coords = {
                x: function(x) { return self.graph.meta.xScale(x) },
                y: function(y) {
                    if (self.coordinateSystem === 'linear')
                        return self.graph.meta.yScale(y);
                    else if (self.coordinateSystem === 'semilog')
                        return self.graph.meta.yScale(Math.log10(y));
                }
            };

            var line = d3.svg.line()
                .x(function(d) { return coords.x(d[0]) })
                .y(function(d) { return coords.y(d[1]) });

            var size = {
                w: function(w) { return Math.abs((coords.x(2) - coords.x(1)) * w) },
                h: function(h, b) {
                    if (self.coordinateSystem === 'linear')
                        return Math.abs((coords.y(2) - coords.y(1)) * h);
                    else if (self.coordinateSystem === 'semilog')
                        return Math.abs(coords.y(b) - coords.y(b + h));
                }
            };

            var canvas = self.graph.canvas[0][0].querySelector('.content');

            self.initialDrawCb(self.graph, canvas, self.htmlOverlay, self.graphValues, line, coords, size, self.coordinateSystem);
        }
    }

    function activatePostDrawCb() {
        if (typeof self.postDrawCb === 'function') {
            var coords = {
                x: function(x) { return self.graph.meta.xScale(x) },
                y: function(y) {
                    if (self.coordinateSystem === 'linear')
                        return self.graph.meta.yScale(y);
                    else if (self.coordinateSystem === 'semilog')
                        return self.graph.meta.yScale(Math.log10(y));
                }
            };

            var line = d3.svg.line()
                .x(function(d) { return coords.x(d[0]) })
                .y(function(d) { return coords.y(d[1]) });

            var size = {
                w: function(w) { return Math.abs((coords.x(2) - coords.x(1)) * w) },
                h: function(h, b) {
                    if (self.coordinateSystem === 'linear')
                        return Math.abs((coords.y(2) - coords.y(1)) * h);
                    else if (self.coordinateSystem === 'semilog')
                        return Math.abs(coords.y(b) - coords.y(b + h));
                }
            };

            var canvas = self.graph.canvas[0][0].querySelector('.content');

            self.postDrawCb(self.graph, canvas, self.htmlOverlay, self.graphValues, line, coords, size, self.coordinateSystem);
        }
    }
}

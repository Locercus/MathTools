function InteractiveGraph(options) {
    this.plotOptions   = options.plotOptions;
    this.graph         = functionPlot(this.plotOptions);
    this.graphValues   = options.defaultValues;
    this.inputs        = $(options.inputSelector);
    this.fnFormat      = options.fn;
    this.initialDrawCb = options.initialDrawCb;
    this.postDrawCb    = options.postDrawCb;

    this.htmlOverlay   = document.createElement('div');
    this.htmlOverlay.classList.add('graph-html-overlay');
    this.htmlOverlay.style.height     = this.plotOptions.height - this.graph.meta.margin.top  - this.graph.meta.margin.bottom  + 'px';
    this.htmlOverlay.style.width      = this.plotOptions.width  - this.graph.meta.margin.left - this.graph.meta.margin.right   + 'px';
    this.htmlOverlay.style.marginLeft = -this.plotOptions.width + this.graph.meta.margin.left + 'px';
    this.htmlOverlay.style.marginTop  = this.graph.meta.margin.top + 'px';
    $(this.plotOptions.target)[0].appendChild(this.htmlOverlay);

    var self = this;


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
        var name = input.dataset.name;

        self.graphValues[name] = value;

        var fn = self.fnFormat;

        for (variable in self.graphValues) {
            fn = fn.replace(new RegExp('%' + variable, 'g'), self.graphValues[variable]);
        }

        self.plotOptions.data = [{ fn: fn }];

        self.graph = functionPlot(self.plotOptions);

        activatePostDrawCb();
    }

    function activateInitialDrawCb() {
        if(typeof self.initialDrawCb === 'function') {
            var coords = {
                x: function(x) { return self.graph.meta.xScale(x) },
                y: function(y) { return self.graph.meta.yScale(y) }
            };

            var line = d3.svg.line()
                .x(function(d) { return self.graph.meta.xScale(d[0]) })
                .y(function(d) { return self.graph.meta.yScale(d[1]) });

            var size = {
                w: function(w) { return Math.abs((coords.x(1) - coords.x(0)) * w) },
                h: function(h) { return Math.abs((coords.y(1) - coords.y(0)) * h) }
            };

            var canvas = self.graph.canvas[0][0].querySelector('.content');

            self.initialDrawCb(self.graph, canvas, self.htmlOverlay, self.graphValues, line, coords, size);
        }
    }

    function activatePostDrawCb() {
        if (typeof self.postDrawCb === 'function') {
            var coords = {
                x: function(x) { return self.graph.meta.xScale(x) },
                y: function(y) { return self.graph.meta.yScale(y) }
            };

            var line = d3.svg.line()
                .x(function(d) { return self.graph.meta.xScale(d[0]) })
                .y(function(d) { return self.graph.meta.yScale(d[1]) });

            var size = {
                w: function(w) { return Math.abs((coords.x(1) - coords.x(0)) * w) },
                h: function(h) { return Math.abs((coords.y(1) - coords.y(0)) * h) }
            };

            var canvas = self.graph.canvas[0][0].querySelector('.content');

            self.postDrawCb(self.graph, canvas, self.htmlOverlay, self.graphValues, line, coords, size);
        }
    }
}

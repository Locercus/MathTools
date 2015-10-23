function InteractiveGraph(options) {
    this.plotOptions   = options.plotOptions;
    this.graph         = functionPlot(this.plotOptions);
    this.graphValues   = options.defaultValues;
    this.inputs        = $(options.inputSelector);
    this.fnFormat      = options.fn;
    this.initialDrawCb = options.initialDrawCb;
    this.postDrawCb    = options.postDrawCb;

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
                x: function(x) { return self.graph.meta.xScale(x) + self.graph.meta.margin.left },
                y: function(y) { return self.graph.meta.yScale(y) + self.graph.meta.margin.top  }
            };

            var line = d3.svg.line()
                .x(function(d) { return self.graph.meta.xScale(d[0]) })
                .y(function(d) { return self.graph.meta.yScale(d[1]) });

            var size = {
                w: function(w) { return Math.abs(coords.x(1) - coords.x(0)) * w },
                h: function(h) { return Math.abs(coords.y(1) - coords.y(0)) * h }
            };

            self.initialDrawCb(self.graph, self.graphValues, line, coords, size);
        }
    }

    function activatePostDrawCb() {
        if (typeof self.postDrawCb === 'function') {
            var coords = {
                x: function(x) { return self.graph.meta.xScale(x) + self.graph.meta.margin.left },
                y: function(y) { return self.graph.meta.yScale(y) + self.graph.meta.margin.top  }
            };

            var line = d3.svg.line()
                .x(function(d) { return self.graph.meta.xScale(d[0]) })
                .y(function(d) { return self.graph.meta.yScale(d[1]) });

            var size = {
                w: function(w) { return Math.abs(coords.x(1) - coords.x(0)) * w },
                h: function(h) { return Math.abs(coords.y(1) - coords.y(0)) * h }
            };

            self.postDrawCb(self.graph, self.graphValues, line, coords, size);
        }
    }
}

function InteractiveGraph(options) {
    this.plotOptions = options.plotOptions;
    this.graph       = functionPlot(this.plotOptions);
    this.graphValues = options.defaultValues;
    this.inputs      = $(options.inputSelector);
    this.fnFormat    = options.fn;

    var self = this;

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
        var value = this.value;

        rangeInput.value = this.value;

        handleGraphInput(parent, value);
    }

    function handleGraphRangeInput(e) {
        var parent = this.parentNode;
        var typeInput = parent.querySelector(':scope > span > input');
        var value = this.value;

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
    }
}

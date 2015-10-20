(function() {
    $('#searchbar')[0].addEventListener('click', function() {
        this.querySelectorAll(':scope > input')[0].focus();
    });
})();

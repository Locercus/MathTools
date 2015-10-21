var loadPage;
var showPage;
var getPages;
var getLanguage;
var root;

function show(el) {
    el.classList.add('show');
    el.classList.remove('hide');
}

function hide(el) {
    el.classList.add('hide');
    el.classList.remove('show');
}

function toggleDisplay(el) {
    if(el.classList.contains('hide'))
        show(el);
    else
        hide(el);
}

(function ui() {
    getPages = function getPages() {
        return pages;
    }

    getLanguage = function getLanguage() {
        return language;
    }

    loadPage = function loadPage(page) {
        // Check if the page lists have been loaded
        if(!(language in pages && 'en-GB' in pages)) {
            document.addEventListener('pagesReady', function() {
                loadPage(page);
            });
            return;
        }

        // Check if the page even exists
        if(page in pages[language])
            var data = pages[language][page];
        else if(page in pages['en-GB'])
            var data = pages['en-GB'][page];
        else
            return;

        // Show the loading spinner
        show($('#page-spinner')[0]);

        // Hide the page content
        hide($('#page-content')[0]);

        // Get the page HTML
        var request = new XMLHttpRequest();
        request.open('GET', root + 'pages/' + language + '/' + page + '.html');
        request.onload = function() {
            if(this.status >= 200 && this.status < 400) {
                // Set data-page
                $('#content')[0].dataset.page = page;

                var pageEl = $('#page-content')[0];
                pageEl.innerHTML = this.response;
                execBodyScripts(pageEl);
                handleAnchors(pageEl);
            }
            else
                alert('Something went wrong. Please try again later (Error: ' + this.status + ')');

            // Hide the loading spinner
            hide($('#page-spinner')[0]);
            
        };
        request.send();
    };

    showPage = function showPage() {
        show($('#page-content')[0]);

        // Set body class
        var page = $('#content')[0].dataset.page;
        var body = document.body;
        if(page === 'home') {
            body.classList.add('home');
            body.classList.remove('page');
        }
        else {
            body.classList.add('page');
            body.classList.remove('home');
        }
    };

    function handleAnchors(el) {
        var anchors = el.querySelectorAll(':scope a');

        [].forEach.call(anchors, function(a) {
            a.addEventListener('click', anchorCallback);
        });
    }

    function anchorCallback(e) {
        e.preventDefault();

        if(e.metaKey || e.ctrlKey || e.button === 1)
            window.open(this.href);
        else {
            var uri = parseUri(parseUri(this.href).path.substr(1)).path.substr(1);
            loadPage(uri);
            history.replaceState({}, '', uri);
        }
    }



    var language = 'en-GB';
    root = parseUri(document.currentScript.src).directory + '../';
    var pages = {};



    // Obtain the list of pages for the current language and en-GB
    (function loadPageList() {
        var e = new CustomEvent('pagesReady');

        if(language != 'en-GB') {
            var english = new XMLHttpRequest();
            english.open('GET', root + 'data/lang/en-GB/pages.json', true);
            english.onload = function() {
                if(this.status >= 200 && this.status < 400) {
                    var data = JSON.parse(this.response);
                    pages['en-GB'] = data;

                    if(language in pages)
                        document.dispatchEvent(e);
                }
                else
                    alert('Something went wrong. Please try again later (Error: ' + this.status + ')');
            };
            english.send();
        }

        var langPages = new XMLHttpRequest();
        langPages.open('GET', root + 'data/lang/' + language + '/pages.json', true);
        langPages.onload = function() {
            if(this.status >= 200 && this.status < 400) {
                var data = JSON.parse(this.response);
                pages[language] = data;

                if('en-GB' in pages || language === 'en-GB')
                    document.dispatchEvent(e);
            }
            else
                alert('Something went wrong. Please try again later (Error: ' + this.status + ')');
        };
        langPages.send();
    })();

    // Load page
    var page = parseUri(window.location.pathname.substr(1)).directory.substr(1);
    if(page === '')
        page = 'home';
    loadPage(page);

    // Global listeners

    $('#searchbar')[0].addEventListener('click', function() {
        this.querySelectorAll(':scope > input')[0].focus();
    });
})();

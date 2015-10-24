vex.defaultOptions.className = 'vex-theme-os';

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
    if (el.classList.contains('hide'))
        show(el);
    else
        hide(el);
}

function showHard(el) {
    el.classList.add('show-hard');
    el.classList.remove('hide-hard');
}

function hideHard(el) {
    el.classList.add('hide-hard');
    el.classList.remove('show-hard');
}

function toggleDisplayHard(el) {
    if (el.classList.contains('hide-hard'))
        showHard(el);
    else
        hideHard(el);
}

(function ui() {
    getPages = function getPages() {
        return pages;
    }

    getLanguage = function getLanguage() {
        return language;
    }

    var pageHideTime = 0;

    loadPage = function loadPage(page, instant) {
        var language = getLanguage();

        // Check if the page lists have been loaded
        if (!(language in pages && 'en-GB' in pages)) {
            document.addEventListener('pagesReady', function() {
                loadPage(page, instant);
            });
            return;
        }

        // Check if the page even exists
        if (page in pages[language]) 
            var data = pages[language][page];
        else if(page in pages['en-GB']) {
            var language = 'en-GB';
            var data = pages['en-GB'][page];
        }
        else
            return;

        // Show the loading spinner
        show($('#page-spinner')[0]);

        // Hide the page content
        hide($('#page-content')[0]);

        pageHideTime = new Date().getTime();

        // Get the page HTML
        var request = new XMLHttpRequest();
        request.open('GET', root + 'pages/' + language + '/' + page + '.html');
        request.onload = function() {
            if (this.status >= 200 && this.status < 400) {
                var delay = Math.max(new Date().getTime() - pageHideTime + 400, 0);

                if (instant)
                    delay = 0;

                var response = this.response;

                setTimeout(function() {
                    // Set data-page
                    $('#content')[0].dataset.page = page;

                    var pageEl = $('#page-content')[0];
                    pageEl.innerHTML = response;
                    execBodyScripts(pageEl);
                    renderMathInElement(pageEl, {
                        delimiters: [
                            { left: "$",  right: "$",  display: false },
                            { left: "\\[", right: "\\]", display: true  }
                        ]
                    });
                    handleToC(pageEl);
                    handleFormulaBox(pageEl);
                    handleAnchors(pageEl);
                    showPage();
                }, delay);

                // Set title
                $('title')[0].textContent = data.name + " – Jon's Math Tools";

                // Add to history
                if (page === 'home')
                    history.pushState({page: "home"}, '', '.');
                else
                    history.pushState({page: page}, '', page);
            }
            else
                vex.dialog.alert({
                    message: 'Something went wrong. Please try again later<br/>Error: ' + this.status
                });

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
        if (page === 'home') {
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

        if (e.metaKey || e.ctrlKey || e.button === 1)
            window.open(this.href);
        else {
            var uri = parseUri(parseUri(this.href).path.substr(1)).path.substr(1);
            var hash = this.href.split('#')[1];

            if (hash === undefined) {
                loadPage(uri);
            }
            else {
                if(hash !== '')
                    history.pushState({page: uri}, '', '#' + hash);

                var el = document.getElementById(hash);
                if (el === null)
                    el = document.body;
                    
                el.scrollIntoView();
            }
        }
    }

    function handleToC(el) {
        var toc = el.querySelector(':scope .toc');
        if (toc == null)
            return;

        var headlines = el.querySelectorAll(':scope h2');

        var div = document.createElement('div');

        var tocHeader = document.createElement('h3');
        tocHeader.innerHTML = 'Table of Contents';
        div.appendChild(tocHeader);

        var ul = document.createElement('ul');
        div.appendChild(ul);

        var li = document.createElement('li');
        li.classList.add('active');
        li.innerHTML = '<a href="#">Introduction</a>';
        ul.appendChild(li);

        [].forEach.call(headlines, function(headline) {
            var name = headline.id;
            if (name === '') {
                name = headline.textContent.replace(/\s+/g, '_').replace(/[^\w]/g, '');
                headline.id = name;
            }

            var li = document.createElement('li');
            var a  = document.createElement('a');
            a.textContent = headline.textContent;
            a.href = '#' + name;
            li.appendChild(a);
            ul.appendChild(li);
        });

        toc.appendChild(div);

        var width = toc.offsetWidth + 'px';

        toc.style.width = width;
        div.style.position = 'fixed';
    }

    function handleFormulaBox(el) {
        var formulaBoxes = el.querySelectorAll(':scope .formulae');

        var QEDString = katex.renderToString('\\blacksquare');

        [].forEach.call(formulaBoxes, function(formulaBox) {
            var formulae = formulaBox.querySelectorAll(':scope > div');

            [].forEach.call(formulae, function(formula) {
                var proof = formula.querySelector(':scope > .proof');
                proof.classList.add('hide-hard');

                var QED = document.createElement('div');
                QED.classList.add('qed');
                QED.innerHTML = QEDString;
                proof.appendChild(QED);

                var description = formula.querySelector(':scope > .description');

                var descriptionContainer = document.createElement('div');

                while (description.childNodes.length > 0)
                    descriptionContainer.appendChild(description.firstChild);

                description.appendChild(descriptionContainer);

                var proofButton = document.createElement('div');
                proofButton.classList.add('proof-button');
                description.appendChild(proofButton);

                var proofButtonIcon = document.createElement('span');
                proofButtonIcon.classList.add('proof-button-icon');
                proofButton.appendChild(proofButtonIcon);

                proofButton.appendChild(new Text("Proof"));

                proofButton.addEventListener('click', function() {
                    if (this.classList.contains('toggled')) {
                        this.parentNode.parentNode.classList.remove('proof-shown');
                        this.classList.remove('toggled');
                    }
                    else {
                        this.parentNode.parentNode.classList.add('proof-shown');
                        this.classList.add('toggled');
                    }

                    toggleDisplayHard(this.parentNode.parentNode.querySelector(':scope > .proof'));
                });
            });
        });
    }



    var language = localStorage.language || 'en-GB';
    root = parseUri(document.currentScript.src).directory + '../';
    var pages = {};

    // Set the current page
    var pageName = page;
    if(page === '')
        pageName = 'home';
    history.replaceState({page: pageName}, '', page);


    function loadPageListLanguage(lang) {
        return new Promise(function(resolve, reject) {
            var request = new XMLHttpRequest();
            request.open('GET', root + 'data/lang/' + lang + '/pages.json', true);
            request.onload = function() {
                if (this.status >= 200 && this.status < 400) {
                    resolve(JSON.parse(this.response));
                }
                else {
                    vex.dialog.alert({
                        message: 'Something went wrong. Please try again later<br/>Error: ' + this.status
                    });
                    reject();
                }
            };
            request.send();
        });
    }



    // Obtain the list of pages for the current language and en-GB
    (function loadPageList() {
        var e = new CustomEvent('pagesReady');

        if (language != 'en-GB') {
            loadPageListLanguage('en-GB').then(function(data) {
                pages['en-GB'] = data;

                if ('en-GB' in pages || language === 'en-GB')
                    document.dispatchEvent(e);
            });
        }

        loadPageListLanguage(language).then(function(data) {
            pages[language] = data;

            if ('en-GB' in pages || language === 'en-GB')
                document.dispatchEvent(e);
        });
    })();

    // Load page
    if (page === '')
        page = 'home';
    loadPage(page, true);


    // Global listeners

    $('#searchbar')[0].addEventListener('click', function searchbarclick() {
        this.querySelector(':scope > input').focus();
    });

    window.onpopstate = function onpopstate(event) {
        if (event.state !== null)
            loadPage(event.state.page);
    }


    var languageSelectContainer = '';
    var languages = null;
    var languageRequest = new XMLHttpRequest();
    languageRequest.open('GET', root + '/data/languages.json', true);
    languageRequest.onload = function() {
        if (this.status >= 200 && this.status < 400) {
            languages = JSON.parse(this.response);

            var languageSelect = document.createElement('select');
            languageSelect.name = 'language';

            Object.keys(languages).forEach(function(langId, index) {
                var option = document.createElement('option');
                option.value = langId;
                option.innerHTML = languages[langId];

                languageSelect.appendChild(option)

                if (langId === getLanguage())
                    languageSelect.selectedIndex = index;
            });

            languageSelectContainer = document.createElement('div');
            languageSelectContainer.classList.add('select-style');
            languageSelectContainer.appendChild(languageSelect);
        }
        else
            vex.dialog.alert({
                message: 'Something went wrong. Please try again later<br/>Error: ' + this.status
            });
    }
    languageRequest.send();


    $('#language-button')[0].addEventListener('click', function languagebuttonclick() {
        vex.dialog.open({
            message: 'Change language',
            input: languageSelectContainer,
            buttons: [
                jQuery.extend({}, vex.dialog.buttons.YES, {
                    text: 'Change language'
                }),
                jQuery.extend({}, vex.dialog.buttons.NO, {
                    text: 'Cancel'
                })
            ],
            callback: function(data) {
                if (data === false)
                    return;

                localStorage.language = data.language;

                if (!(data.language in getPages())) {
                    loadPageListLanguage(data.language).then(function(newPages) {
                        pages[data.language] = newPages;

                        language = data.language;
                        loadPage($('#content')[0].dataset.page);
                    });
                }
                else {
                    language = data.language;
                    loadPage($('#content')[0].dataset.page);
                }
            }
        });
    });


    $('#home-button')[0].addEventListener('click', function homebuttonclick() {
        loadPage('home');
    });
})();

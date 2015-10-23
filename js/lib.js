var $ = function() {
    return document.querySelectorAll.apply(document, arguments);
};

document.createSVGElement = function(name) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
};

document.createHTMLInSVG = function(html, x, y, width, height) {
  var foreignobject = document.createSVGElement('foreignObject');
  if (x !== undefined)
      foreignobject.setAttribute('x', x);
  if (y !== undefined)
      foreignobject.setAttribute('y', y);
  if (width !== undefined)
      foreignobject.setAttribute('width', width);
  if (height !== undefined)
      foreignobject.setAttribute('height', height);

  var body = document.createElement('body');
  body.classList.add('svg-body');
  if (html instanceof HTMLElement)
      body.appendChild(html);
  else if (typeof html === 'string')
      body.innerHTML = html;
  else if (html instanceof Array)
    html.forEach(function(el) {
        body.appendChild(el);
    });

  foreignobject.appendChild(body);

  return foreignobject;
};

// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri (str) {
    var o   = parseUri.options,
        m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i   = 14;

    while (i--) uri[o.key[i]] = m[i] || "";

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) uri[o.q.name][$1] = $2;
    });

    return uri;
};

parseUri.options = {
    strictMode: false,
    key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
    q:   {
        name:   "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
};


// https://stackoverflow.com/a/3250386
function execBodyScripts(body_el) {
    // Finds and executes scripts in a newly added element's body.
    // Needed since innerHTML does not run scripts.
    //
    // Argument body_el is an element in the dom.

    function nodeName(elem, name) {
    return elem.nodeName && elem.nodeName.toUpperCase() ===
              name.toUpperCase();
    };

    function evalScript(elem) {
    var data = (elem.text || elem.textContent || elem.innerHTML || "" ),
        head = document.getElementsByTagName("head")[0] ||
                  document.documentElement,
        script = document.createElement("script");

    script.type = "text/javascript";
    try {
      // doesn't work on ie...
      script.appendChild(document.createTextNode(data));      
    } catch(e) {
      // IE has funky script nodes
      script.text = data;
    }

    head.insertBefore(script, head.firstChild);
    head.removeChild(script);
    };

    // main section of function
    var scripts = [],
      script,
      children_nodes = body_el.childNodes,
      child,
      i;

    for (i = 0; children_nodes[i]; i++) {
    child = children_nodes[i];
    if (nodeName(child, "script" ) &&
      (!child.type || child.type.toLowerCase() === "text/javascript")) {
          scripts.push(child);
      }
    }

    for (i = 0; scripts[i]; i++) {
    script = scripts[i];
    if (script.parentNode) {script.parentNode.removeChild(script);}
    evalScript(scripts[i]);
    }
};
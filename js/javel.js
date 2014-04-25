var routes = {};
var $el = null;

var Route = {
    get: function ($uri, $callback) {
        routes[$uri] = $callback;
    },
    // at the moment, the exact same as 'get'. Eventually responding to a POST request
    post: function ($uri, $callback) {
        routes[$uri] = $callback;
    }
};

var View = {
    make: function ($view, app) {
        this.html($view, function (err, content) {
            if (err) return app(err);
            return app(null, content);
        });

    },
    // Load the view from the views folder
    html: function ($view, $callback) {
        var ViewClient = new XMLHttpRequest();
        ViewClient.open('GET', '/views/' + $view + '.html', true);

        // After loading, add it to the callback
        ViewClient.onreadystatechange = function () {
            if (ViewClient.readyState == 4 && ViewClient.status >= 200 && ViewClient.status < 400) {
                $callback(null, ViewClient.response);
            } else {
                $callback('The error');
            }
        };
        ViewClient.send();
    }
};

var Router = function () {
    $el = $el || document.getElementById('view');

    // Get the URI after the hash (#). default to root
    var $uri = location.hash.slice(1) || '/';

    // Pull the route out of the routes array
    var $route = routes[$uri];

    // Make sure route is a callback
    if (typeof $route == 'function') {
        // If the callback returns a string, just print it out
        if (typeof $route() == 'string') {
            $el.innerHTML = $route();
        } else {
            // If callback is a callback (a view), get the contents of the view and print it.
            $route(function (err, content) {
                $el.innerHTML = content;
            });
        }
    } else {
        // If route isn't a callback, it's either a 404 or eventually, maybe, call a controller
        if (typeof $route == 'undefined') {
            View.make('404', function (err, content) {
                $el.innerHTML = content;
            });
        } else {
            // Just print out the route
            $el.innerHTML = $route;
        }
    }


}

window.addEventListener('hashchange', Router);
window.addEventListener('load', Router);

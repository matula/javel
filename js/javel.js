// Store routes with their HTTP methods
const routes = {
    GET: {},
    POST: {},
    PUT: {},
    DELETE: {}
};

// Element where views will be rendered
let $el = null;

/**
 * Route class for defining routes
 */
const Route = {
    /**
     * Register a GET route
     * @param {string} uri - The route URI, can include parameters like :id
     * @param {Function} callback - The callback function to execute when route is matched
     */
    get: function(uri, callback) {
        routes.GET[uri] = callback;
    },

    /**
     * Register a POST route
     * @param {string} uri - The route URI, can include parameters like :id
     * @param {Function} callback - The callback function to execute when route is matched
     */
    post: function(uri, callback) {
        routes.POST[uri] = callback;
    },

    /**
     * Register a PUT route
     * @param {string} uri - The route URI, can include parameters like :id
     * @param {Function} callback - The callback function to execute when route is matched
     */
    put: function(uri, callback) {
        routes.PUT[uri] = callback;
    },

    /**
     * Register a DELETE route
     * @param {string} uri - The route URI, can include parameters like :id
     * @param {Function} callback - The callback function to execute when route is matched
     */
    delete: function(uri, callback) {
        routes.DELETE[uri] = callback;
    }
};

/**
 * View class for rendering views
 */
const View = {
    /**
     * Make a view with the given name
     * @param {string} view - The name of the view to render
     * @param {Function} app - The callback function to execute with the rendered view
     * @returns {Promise} - A promise that resolves with the rendered view
     */
    make: function(view, app) {
        return this.html(view)
            .then(content => {
                if (typeof app === 'function') {
                    return app(null, content);
                }
                return content;
            })
            .catch(err => {
                if (typeof app === 'function') {
                    return app(err);
                }
                throw err;
            });
    },

    /**
     * Load the view from the views folder
     * @param {string} view - The name of the view to load
     * @returns {Promise} - A promise that resolves with the view content
     */
    html: function(view) {
        return new Promise((resolve, reject) => {
            const ViewClient = new XMLHttpRequest();
            ViewClient.open('GET', `views/${view}.html`, true);

            ViewClient.onreadystatechange = function() {
                if (ViewClient.readyState === 4) {
                    if (ViewClient.status >= 200 && ViewClient.status < 400) {
                        resolve(ViewClient.response);
                    } else {
                        reject(new Error(`Failed to load view: ${view}`));
                    }
                }
            };

            ViewClient.onerror = function() {
                reject(new Error(`Network error loading view: ${view}`));
            };

            ViewClient.send();
        });
    }
};

/**
 * Parse route parameters from URI
 * @param {string} routePattern - The route pattern with parameter placeholders
 * @param {string} uri - The actual URI to match against
 * @returns {Object|null} - Parameters object or null if no match
 */
const parseRouteParams = (routePattern, uri) => {
    // Convert route pattern to regex
    const paramNames = [];
    const regexPattern = routePattern
        .replace(/:[a-zA-Z0-9_]+/g, (match) => {
            paramNames.push(match.substring(1));
            return '([^/]+)';
        })
        .replace(/\//g, '\\/');

    const regex = new RegExp(`^${regexPattern}$`);
    const match = uri.match(regex);

    if (!match) return null;

    // Extract parameters
    const params = {};
    match.slice(1).forEach((value, index) => {
        params[paramNames[index]] = value;
    });

    return params;
};

/**
 * Find a matching route for the given URI and method
 * @param {string} uri - The URI to match
 * @param {string} method - The HTTP method
 * @returns {Object|null} - Route object or null if no match
 */
const findRoute = (uri, method = 'GET') => {
    // First try exact match
    if (routes[method][uri]) {
        return {
            callback: routes[method][uri],
            params: {}
        };
    }

    // Try to match routes with parameters
    for (const routePattern in routes[method]) {
        const params = parseRouteParams(routePattern, uri);
        if (params) {
            return {
                callback: routes[method][routePattern],
                params
            };
        }
    }

    return null;
};

/**
 * Extract form data and query parameters
 * @returns {Object} - Object containing form and query data
 */
const getRequestData = () => {
    const data = {
        query: {},
        form: {}
    };

    // Parse query string
    const queryString = window.location.search.substring(1);
    if (queryString) {
        queryString.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            data.query[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });
    }

    // Get form data if a form was submitted
    // For the special case of "#post", we need to handle form data differently
    // since the form might not be in the DOM anymore
    if (location.hash === '#post') {
        // Try to get form data from sessionStorage if available
        const storedFormData = sessionStorage.getItem('formData');
        if (storedFormData) {
            try {
                const parsedData = JSON.parse(storedFormData);
                data.form = parsedData;
                // Clear the stored form data to prevent reuse
                sessionStorage.removeItem('formData');
            } catch (e) {
                console.error('Error parsing stored form data:', e);
            }
        }
    }

    // Also check for forms in the current DOM
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        // Check if the form's action matches the current hash
        if (form.getAttribute('action') === location.hash) {
            const formData = new FormData(form);
            // Store form data in sessionStorage before submission
            const formDataObj = {};
            for (const [key, value] of formData.entries()) {
                data.form[key] = value;
                formDataObj[key] = value;
            }
            sessionStorage.setItem('formData', JSON.stringify(formDataObj));
        }
    });

    return data;
};

/**
 * Router function to handle route changes
 */
const Router = () => {
    $el = $el || document.getElementById('view');
    if (!$el) {
        console.error('No element with id "view" found');
        return;
    }

    // Get the URI after the hash (#), default to root
    let uri = location.hash.slice(1) || '/';

    // Determine HTTP method (default to GET)
    let method = 'GET';

    // Special case for form submissions
    // If the hash is "#post", treat it as a POST request to the "post" route
    if (location.hash === '#post') {
        method = 'POST';
        uri = 'post';
    } else {
        // Check if there's a form with action matching the current hash
        const formWithMatchingAction = document.querySelector(`form[action="${location.hash}"]`);
        if (formWithMatchingAction) {
            const formMethod = formWithMatchingAction.getAttribute('method')?.toUpperCase();
            if (formMethod && ['GET', 'POST', 'PUT', 'DELETE'].includes(formMethod)) {
                method = formMethod;

                // Extract the URI from the form's action attribute
                const formAction = formWithMatchingAction.getAttribute('action');
                if (formAction && formAction.startsWith('#')) {
                    uri = formAction.slice(1);
                }
            }
        }
    }

    // Find matching route
    const route = findRoute(uri, method);

    // Get request data (query params and form data)
    const requestData = getRequestData();

    if (route) {
        const { callback, params } = route;

        try {
            // If the callback returns a string, just print it out
            const result = callback(params, requestData);

            if (typeof result === 'string') {
                $el.innerHTML = result;
            } else if (result instanceof Promise) {
                // Handle promise returned from callback
                result.then(content => {
                    $el.innerHTML = content;
                }).catch(err => {
                    console.error('Error rendering view:', err);
                    View.make('404', (err, content) => {
                        $el.innerHTML = content || 'Page not found';
                    });
                });
            } else {
                // Handle callback with app parameter (legacy support)
                callback(function(err, content) {
                    if (err) {
                        console.error('Error rendering view:', err);
                        View.make('404', (err, content) => {
                            $el.innerHTML = content || 'Page not found';
                        });
                    } else {
                        $el.innerHTML = content;
                    }
                }, params, requestData);
            }
        } catch (err) {
            console.error('Error executing route callback:', err);
            View.make('404', (err, content) => {
                $el.innerHTML = content || 'Page not found';
            });
        }
    } else {
        // Route not found, show 404
        View.make('404', (err, content) => {
            $el.innerHTML = content || 'Page not found';
        });
    }
};

// For backward compatibility with existing routes
// Map old routes to new format
Object.keys(routes).forEach(method => {
    const methodRoutes = { ...routes[method] };
    routes[method] = {};

    Object.keys(methodRoutes).forEach(uri => {
        routes[method][uri] = methodRoutes[uri];
    });
});

// Listen for hash changes and page load
window.addEventListener('hashchange', Router);
window.addEventListener('load', Router);

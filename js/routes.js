// Home route
Route.get('/', (app) => {
    return View.make('index', app);
});

// About route
Route.get('about', (app) => {
    return View.make('about', app);
});

// Contact route
Route.get('contact', (app) => {
    return View.make('contact', app);
});

// Example of a route that returns plain text/HTML
Route.get('noview', () => {
    return '<div class="container">Just sending in some text</div>';
});

// Example of a route with parameters
Route.get('user/:id', (params, requestData) => {
    return View.make('user-profile', (err, content) => {
        if (err) return err;
        // Return the content first, then set the user ID after the content is added to the DOM
        setTimeout(() => {
            document.getElementById('user-id').textContent = params.id;
        }, 0);
        return content;
    });
});

// Example of a POST route for form handling
Route.post('post', (params, requestData) => {
    // Access form data from requestData.form
    const formData = requestData.form;

    return View.make('form-response', (err, content) => {
        if (err) return err;
        // Return the content first, then set the form data after the content is added to the DOM
        setTimeout(() => {
            document.getElementById('submitted-name').textContent = formData.yourname || 'Not provided';
            document.getElementById('submitted-email').textContent = formData.email || 'Not provided';
            document.getElementById('submitted-comment').textContent = formData.comment || 'Not provided';
        }, 0);
        return content;
    });
});

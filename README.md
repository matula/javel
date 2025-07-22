# Javel

A modern JavaScript router with syntax similar to the Laravel PHP framework.

## Installation

Include the javel.js and routes.js files in your HTML:

```html
<script src="js/javel.js"></script>
<script src="js/routes.js"></script>
```

Make sure you have a div with the id of 'view' in your HTML, as that's where the content is loaded:

```html
<div id="view"></div>
```

## Features

- Simple, Laravel-like syntax for defining routes
- Support for GET, POST, PUT, and DELETE HTTP methods
- Route parameters (e.g., `/user/:id`)
- Form handling
- Promise-based view loading
- Error handling

## Basic Usage

### Simple Route

```javascript
Route.get('myroute', () => {
    return 'This will simply be echoed in the browser';
});
```

### Route with a View

```javascript
Route.get('myview', (app) => {
    return View.make('myview', app);
});
```

### Route with Parameters

```javascript
Route.get('user/:id', (params, requestData) => {
    return `<div class="container">
        <h1>User Profile</h1>
        <p>User ID: ${params.id}</p>
    </div>`;
});
```

### POST Route for Form Handling

```javascript
Route.post('post', (params, requestData) => {
    const formData = requestData.form;

    return `<div class="container">
        <h1>Form Submitted</h1>
        <p>Thank you for your submission!</p>
        <p>Name: ${formData.yourname || 'Not provided'}</p>
        <p>Email: ${formData.email || 'Not provided'}</p>
    </div>`;
});
```

HTML form:

```html
<form role="form" method="post" action="#post">
    <div class="form-group">
        <label for="yourname">Your Name</label>
        <input type="text" class="form-control" id="yourname" name="yourname">
    </div>
    <div class="form-group">
        <label for="email">Email address</label>
        <input type="email" class="form-control" id="email" name="email">
    </div>
    <button type="submit" class="btn btn-default">Submit</button>
</form>
```

## Advanced Usage

### Using Promises

You can return a Promise from your route handler:

```javascript
Route.get('async', () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('<div class="container">This content was loaded asynchronously</div>');
        }, 1000);
    });
});
```

### Multiple Route Parameters

```javascript
Route.get('blog/:year/:month/:slug', (params) => {
    return `<div class="container">
        <h1>Blog Post</h1>
        <p>Year: ${params.year}</p>
        <p>Month: ${params.month}</p>
        <p>Slug: ${params.slug}</p>
    </div>`;
});
```

## View the Example

Check out the [live example](http://matula.github.io/javel/) to see Javel in action.

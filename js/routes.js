Route.get('/', function (app) {
    return View.make('index', app);
});

Route.get('about', function (app) {
    return View.make('about', app);
});

Route.get('contact', function (app) {
    return View.make('contact', app);
});

Route.get('noview', function () {
    return '<div class="container">Just sending in some text</div>';
});

Route.post('post', function(app) {
    return View.make('404', app);
});

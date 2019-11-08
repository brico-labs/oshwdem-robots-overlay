angular.module('app.routes', ['ngRoute'])
.config(function($routeProvider, $locationProvider) {
	$routeProvider
	// home page route
	.when('/', {
		templateUrl: 'app/views/pages/home.html',
		controller: 'mainController',
		controllerAs: 'main',
		categorySlug: '',
		categoryName: 'All Robots'
	})
	.when('/:categoryName', {
		templateUrl: 'app/views/pages/home.html',
		controller: 'mainController',
		controllerAs: 'main',
	})
	.when('/overlay/:categoryName', {
		templateUrl: 'app/views/pages/overlay.html',
		controller: 'mainController',
		controllerAs: 'main',
	})
	// get rid of the hash in the URL
	$locationProvider.html5Mode(true);
})
.filter('capitalize', function() {
    return function(input) {
      return (angular.isString(input) && input.length > 0) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : input;
    }
});

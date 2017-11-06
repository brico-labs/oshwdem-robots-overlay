angular.module('app.routes', ['ngRoute'])
.config(function($routeProvider, $locationProvider) {
	$routeProvider
	// home page route
	.when('/', {
		templateUrl: 'app/views/pages/home.html',
		controller: 'mainController',
		controllerAs: 'main'
	})
	.when('/about', {
		templateUrl: 'app/views/pages/about.html',
		controller: 'aboutController',
		controllerAs: 'about'
	})
	// get rid of the hash in the URL
	$locationProvider.html5Mode(true);
});

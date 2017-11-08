angular.module('app.routes', ['ngRoute'])
.config(function($routeProvider, $locationProvider) {
	$routeProvider
	// home page route
	.when('/', {
		templateUrl: 'app/views/pages/home.html',
		controller: 'mainController',
		controllerAs: 'main',
		categoryId: 0,
		categoryName: 'All Robots'
	})
	.when('/:categoryName', {
		templateUrl: 'app/views/pages/home.html',
		controller: 'mainController',
		controllerAs: 'main',
	})
	.when('/:categoryName/overlay', {
		templateUrl: 'app/views/pages/overlay.html',
		controller: 'overlayController',
		controllerAs: 'over'
	})
	// get rid of the hash in the URL
	$locationProvider.html5Mode(true);
});

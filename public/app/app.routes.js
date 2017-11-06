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
	.when('/laberinto', {
		templateUrl: 'app/views/pages/home.html',
		controller: 'mainController',
		controllerAs: 'main',
		categoryId: 1,
		categoryName: 'Robots Laberinto'
	})
	.when('/siguelineas', {
		templateUrl: 'app/views/pages/home.html',
		controller: 'mainController',
		controllerAs: 'main',
		categoryId: 2,
		categoryName: 'Robots Siguelineas'
	})
	.when('/velocistas', {
		templateUrl: 'app/views/pages/home.html',
		controller: 'mainController',
		controllerAs: 'main',
		categoryId: 3,
		categoryName: 'Robots Velocistas'
	})
	.when('/:categoryName/overlay', {
		templateUrl: 'app/views/pages/overlay.html',
		controller: 'overlayController',
		controllerAs: 'over'
	})
	// get rid of the hash in the URL
	$locationProvider.html5Mode(true);
});

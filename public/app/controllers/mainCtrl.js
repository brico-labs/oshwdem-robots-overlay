angular.module('mainCtrl', [])
.controller('mainController', function($route, $rootScope, $location, Robot) {
	var vm = this;

	vm.routePath = $route.current.originalPath;
	vm.categoryName = $route.current.$$route.categoryName;
  vm.categoryId = $route.current.$$route.categoryId;

	function pad(n, width, z) {
	  z = z || '0';
	  n = n + '';
	  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}

	vm.prettyTime = function(robotTime){
		return robotTime.minutes + ":" + pad(robotTime.seconds, 2, '0') + '.' + pad(robotTime.miliseconds, 3, '0');
	}

	vm.prettyCategory = function(categoryId){
		switch(categoryId){
			case 1:
				return "Laberinto";
			case 2:
				return "Siguelineas";
			case 3:
				return "Velocistas";
		}
	}

	if ( vm.categoryId != 0 ){
		Robot.getByCategory(vm.categoryId)
			.then(function(ret) {
				// when all the robots come back, remove the processing variable
				vm.processing = false;
				// bind the robots that come back to vm.robots
				vm.robots = ret.data;
			});
	} else {
		Robot.all()
			.then(function(ret) {
				// when all the robots come back, remove the processing variable
				vm.processing = false;
				// bind the robots that come back to vm.robots
				vm.robots = ret.data;
			});
	}
});

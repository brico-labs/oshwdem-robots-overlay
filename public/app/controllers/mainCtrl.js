angular.module('mainCtrl', [])
.controller('mainController', function($route, $routeParams, $rootScope, $location, Robot, ngDialog) {
	var vm = this;

	function pad(n, width, z) {
	  z = z || '0';
	  n = n + '';
	  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}

	vm.prettyTime = function(robotTime){
		return robotTime.minutes + ":" + pad(robotTime.seconds, 2, '0') + '.' + pad(robotTime.miliseconds, 3, '0');
	}

	vm.prettyCategory = function(categorySlug){
		switch(categorySlug){
			case "laberinto":
				return "de Laberinto";
			case "siguelineas":
				return "Siguelineas";
			case "velocistas":
				return "Velocistas";
			default:
				return "All";
		}
	}

	vm.getCategoryId = function(categorySlug){
		switch(categorySlug){
			case "laberinto":
				return 1;
			case "siguelineas":
				return 2;
			case "velocistas":
				return 3;
			default:
				return 0;
		}
	}

	vm.categorySlug = $routeParams.categoryName;
	vm.categoryTitle = vm.prettyCategory(vm.categorySlug);
	vm.categoryId = vm.getCategoryId(vm.categorySlug);
	vm.routePath = "/"+vm.categorySlug;


	vm.openDialog = function () {
		console.log('Open Dialog');
    ngDialog.open({ template: 'app/views/modals/popupTmpl.html', className: 'ngdialog-theme-default' });
  };

	if ( vm.categoryId != 0 ){
		Robot.getByCategory(vm.categoryId)
			.then(function(ret) {
				// when all the robots come back, remove the processing variable
				vm.processing = false;
				// bind the robots that come back to vm.robots
				vm.robots = ret.data.message;
			});
	} else {
		Robot.all()
			.then(function(ret) {
				// when all the robots come back, remove the processing variable
				vm.processing = false;
				// bind the robots that come back to vm.robots
				vm.robots = ret.data.message;
			});
	}
});

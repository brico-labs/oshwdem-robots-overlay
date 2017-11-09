angular.module('mainCtrl', [])
.controller('mainController', function($route, $routeParams, $rootScope, $location, $scope, Robot, ngDialog) {
	var vm = this;

	$scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };

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

	vm.prettyCategoryId = function(categoryId){
		switch(categoryId){
			case 1:
				return "Laberinto";
			case 2:
				return "Siguelineas";
			case 3:
				return "Velocistas";
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

	var refreshRobotList = function(categoryId){
		if (categoryId != 0 ){
			Robot.getByCategory(categoryId)
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
	}

	refreshRobotList(vm.categoryId);

	vm.newRobotDialog = function($event) {
		var dialog = ngDialog.open({
      template: 'app/views/modals/new.html',
			scope: $scope,
			controller: 'robotController',
			controllerAs: 'rob',
			preCloseCallback: function(value){
				refreshRobotList(vm.categoryId);
			}
    });
	};

	vm.editRobotDialog = function(robot, $event) {
		var dialog = ngDialog.open({
      template: 'app/views/modals/edit.html'
    });
	};

	vm.deleteRobotDialog = function (robot, $event) {
		var dialog = ngDialog.open({
      template: 'app/views/modals/delete.html',
			scope: $scope,
			controller: 'robotController',
			controllerAs: 'rob',
			data: {
				robot: robot
			},
			preCloseCallback: function(value){
				refreshRobotList(vm.categoryId);
			}
    });
	};

});

angular.module('robotCtrl', [])
.controller('robotController', function($route, $routeParams, $rootScope, $location, $scope, Robot, ngDialog) {
		var r = this;

		r.robotCategories = [
			{id: 1, slug: "laberinto", name: "Laberinto"},
			{id: 2, slug: "siguelineas", name: "Siguelineas"},
			{id: 3, slug: "velocistas", name: "Velocistas"},
		]

		r.newRobot = {
			name: "",
			category: 0
		}

	  r.deleteRobot = function(robot){
	    Robot.delete(robot._id);
	  }

		r.createRobot = function(name, categoryId){
			var robotData = {
				"name": name,
				"category": categoryId
			}

			if(name != "" && categoryId != 0){
				Robot.create(robotData)
					.then(function(ret){
						if(!ret.data.success){
							alert("Error creating robot. " + ret.data.message);
						}
					});
			} else {
				alert("Invalid Name and/or Category");
			}

		}
});

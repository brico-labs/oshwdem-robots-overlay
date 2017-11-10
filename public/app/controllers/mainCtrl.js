angular.module('mainCtrl', [])
.controller('mainController', function($route, $routeParams, $rootScope, $location, $scope, $timeout, $filter, Robot, ngDialog) {
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
		if(robotTime){
			if (timeToMiliseconds(robotTime) != 0) {
				return robotTime.minutes + ":" + pad(robotTime.seconds, 2, '0') + '.' + pad(robotTime.miliseconds, 3, '0');
			}
		}
		return "--:--.---"
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

	isValidTime = function(time){
		return (time.minutes + time.seconds + time.miliseconds) != 0;
	}

	timeToMiliseconds = function(time){
		return (time.minutes*60*1000+time.seconds*1000+time.miliseconds);
	}

	compareTimes = function(time1, time2){
		time1ms = timeToMiliseconds(time1);
		time2ms = timeToMiliseconds(time2);
		if (time1ms > time2ms){
			return 1;
		}
		if (time1ms < time2ms){
			return -1;
		}
		return 0;
	}

	function findWithAttr(array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
    return -1;
	}

	vm.categorySlug = $routeParams.categoryName;
	vm.categoryTitle = vm.prettyCategory(vm.categorySlug);
	vm.categoryId = vm.getCategoryId(vm.categorySlug);
	vm.routePath = "/"+vm.categorySlug;
	vm.categoryRankingSize = 16;
	if (vm.categoryId == 2){
		vm.categoryRankingSize = 12;
	}

	var refreshRobotList = function(categoryId){
		if (categoryId != 0 ){
			Robot.getByCategory(categoryId)
				.then(function(ret) {
					// when all the robots come back, remove the processing variable
					vm.processing = false;
					// bind the robots that come back to vm.robots
					vm.robots = ret.data.message;
					vm.ranking = getRanking(vm.robots, vm.categoryRankingSize);
				});
		} else {
			Robot.all()
				.then(function(ret) {
					// when all the robots come back, remove the processing variable
					vm.processing = false;
					// bind the robots that come back to vm.robots
					vm.robots = ret.data.message;
					vm.ranking = getRanking(vm.robots, vm.categoryRankingSize);
				});
		}

	}

	vm.bestTimeIndex = function(robot){
		var times = robot.times;
		var best = 999999999;
		var bestIdx = -1;
		for (i = 0; i < times.length; i++) {
		    if (timeToMiliseconds(times[i]) < best && timeToMiliseconds(times[i]) != 0){
					best = timeToMiliseconds(times[i]);
					bestIdx = i;
				}
		}
		return bestIdx;
	}

	vm.bestTime = function(robot){
		var times = robot.times;
		var best = 999999999;
		for (i = 0; i < times.length; i++) {
		    if (timeToMiliseconds(times[i]) < best && timeToMiliseconds(times[i]) != 0){
					best = timeToMiliseconds(times[i]);
				}
		}
		return best;
	}

	vm.isTwitterBest = function(robot){
		robotsSort = $filter('orderBy')(vm.robots, '-extra.retweetCount');
		bestRetweets = robotsSort[0].extra.retweetCount;
		return (robot.extra.retweetCount == bestRetweets && robot.extra.retweetCount != 0);
	}

	vm.calculateScore = function(robot){
		var score = 0;
		score += (isValidTime(robot.times[0]) ? 2 : 0);
		score += (isValidTime(robot.times[1]) ? 2 : 0);
		score += (isValidTime(robot.times[2]) ? 2 : 0);
		score += (robot.extra.recycled ? 5 : 0);
		score += (robot.extra.original ? 5 : 0);
		score += (robot.extra.onlineDocs ? 6 : 0);

		// Sort Robots by Time, find index of robot inside list and add points
		score += (vm.isTwitterBest(robot) ? 3 : 0);
		timeSorted = vm.robots.slice(0);
		timeSorted = timeSorted.sort(function(a, b) {
			if(vm.bestTime(a) < vm.bestTime(b)) return -1;
			if(vm.bestTime(b) < vm.bestTime(a)) return 1;
			return 0;
		});
		score += (timeSorted[0]._id == robot._id ? 4 : 0);
		score += (timeSorted[1]._id == robot._id ? 3 : 0);
		score += (timeSorted[2]._id == robot._id ? 2 : 0);

		return score;
	}

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
      template: 'app/views/modals/edit.html',
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

	getRanking = function(robots, size){
		if (vm.categoryId != 2){
			sortedRobots = vm.robots.slice(0);
			sortedRobots = sortedRobots.sort(function(a, b) {
				if(vm.bestTime(a) < vm.bestTime(b)) return -1;
				if(vm.bestTime(b) < vm.bestTime(a)) return 1;
				return 0;
			});
		} else {
			sortedRobots = vm.robots.slice(0);
			sortedRobots = sortedRobots.sort(function(a, b) {
				if(vm.calculateScore(a) < vm.calculateScore(b)) return 1;
				if(vm.calculateScore(b) < vm.calculateScore(a)) return -1;
				return 0;
			});
		}
		return sortedRobots.slice(0,size-1);
	}

	vm.rankingDialog = function($event){
		refreshRobotList(vm.categoryId);
		vm.ranking = getRanking(vm.robots, vm.categoryRankingSize);
		var dialog = ngDialog.open({
      template: 'app/views/modals/ranking.html',
			scope: $scope,
			controller: 'mainController',
			controllerAs: 'main',
			width: 560,
			data: {
				robots: vm.ranking
			}
    });
	}

	vm.toggleExtra = function(robot, field){
		var robotData = robot;
		if (robotData.extra[field]){
			robotData.extra[field] = false;
		} else {
			robotData.extra[field] = true;
		}
		Robot.update(robot._id, robotData)
			.then(function(ret){
				refreshRobotList(vm.categoryId);
			});
	}

	vm.modRetweet = function(robot, value){
		var robotData = robot;
		robotData.extra.retweetCount = robotData.extra.retweetCount + value;
		Robot.update(robot._id, robotData)
			.then(function(ret){
				refreshRobotList(vm.categoryId);
			});
	}


	refreshRobotList(vm.categoryId);

	overlayRefresh = function(){
    $timeout(function() {
			refreshRobotList(vm.categoryId);
      vm.ranking = getRanking(vm.robots, vm.categoryRankingSize);
      overlayRefresh();
    }, 500)
  };

	if ($route.current.$$route.overlay){
		overlayRefresh();
	}
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

		r.updateRobot = function(robot){
			robot.category = robot.category.id;

			if(robot.name != "" && robot.categoryId != 0){
				Robot.update(robot._id, robot)
					.then(function(ret){
						if(!ret.data.success){
							alert("Error updating robot. " + ret.data.message);
							console.log(ret.data);
						}
					});
			} else {
				alert("Invalid Name and/or Category");
			}
		}
});

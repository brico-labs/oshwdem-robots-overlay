angular.module('mainCtrl', [])
.controller('mainController', function($route, $routeParams, $rootScope,
	$location, $scope, $timeout, $filter, Robot, Tourney, ngDialog) {
	var vm = this;

	$scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };

	$scope.getCategoryTemplate = function(){
		baseUrl = "/app/views/partial/";
		switch($location.path()){
			case "/laberinto":
				baseUrl += "timetable.html";
				break;
			case "/siguelineas":
				baseUrl += "timetable_plus.html";
				break;
			case "/velocistas":
				baseUrl += "timetable.html";
				break;
			case "/sumo":
				baseUrl += "tourney.html";
				break;
			case "/hebocon":
				baseUrl += "tourney.html";
				break;
			case "/combate":
				baseUrl += "tourney.html";
				break;
			default:
				baseUrl += "general.html";
				break;
		}
		return baseUrl;
	}

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
		return "--"
	}

	vm.prettyCategory = function(categorySlug){
		switch(categorySlug){
			case "laberinto":
				return "de Laberinto";
			case "siguelineas":
				return "Siguelineas";
			case "velocistas":
				return "Velocistas";
			case "sumo":
				return "de Sumo";
			case "hebocon":
				return "HEBOCON";
			case "combate":
				return "de Combate";
			default:
				return "en General";
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
			case 4:
				return "Sumo";
			case 5:
				return "HEBOCON";
			case 6:
				return "Combate";
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
			case "sumo":
				return 4;
			case "hebocon":
				return 5;
			case "combate":
				return 6;
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
		vm.categoryRankingSize = 10;
	}

	$scope.categoryId = vm.getCategoryId(vm.categorySlug);



	var refreshRobotList = function(categoryId){
		if (categoryId != 0 ){
			Robot.getByCategory(vm.categoryId)
				.then(function(ret) {
					// when all the robots come back, remove the processing variable
					vm.processing = false;
					// bind the robots that come back to vm.robots
					vm.robots = ret.data.message;
					vm.ranking = getRanking(vm.robots, vm.categoryRankingSize+1);
				});
		} else {
			Robot.all()
				.then(function(ret) {
					// when all the robots come back, remove the processing variable
					vm.processing = false;
					// bind the robots that come back to vm.robots
					vm.robots = ret.data.message;
					vm.ranking = getRanking(vm.robots, vm.categoryRankingSize+1);
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
		console.log(robot.name, bestIdx, times[bestIdx]);
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

		if(timeSorted.length > 0){
			score += (timeSorted[0]._id == robot._id ? 4 : 0);
		}
		if (timeSorted.length > 1) {
			score += (timeSorted[1]._id == robot._id ? 3 : 0);
		}
		if (timeSorted.length > 2) {
			score += (timeSorted[2]._id == robot._id ? 2 : 0);
		}
		return score;
	}

	vm.newRobotDialog = function($event) {
		var dialog = ngDialog.open({
      template: 'app/views/modals/new.html',
			scope: $scope,
			controller: 'RobotController',
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
			controller: 'RobotController',
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
			controller: 'RobotController',
			controllerAs: 'rob',
			data: {
				robot: robot
			},
			preCloseCallback: function(value){
				refreshRobotList(vm.categoryId);
			}
    });
	};

	vm.dropRobotDialog = function(robot, $event){
		r = confirm("Are you sure you want to drop " + robot.name + " out of the tourney?")
		if (r){
			robot.combatInfo.dropOut = !robot.combatInfo.dropOut;
			Robot.update(robot._id, robot);
		}
	}

	getRanking = function(robots, size){
		if (vm.categoryId != 2 && vm.categoryId < 4 ){
			sortedRobots = robots.slice(0);
			sortedRobots = sortedRobots.sort(function(a, b) {
				if(vm.bestTime(a) < vm.bestTime(b)) return -1;
				if(vm.bestTime(b) < vm.bestTime(a)) return 1;
				return 0;
			});
		}
		if (vm.categoryId == 2) {
			sortedRobots = robots.slice(0);
			sortedRobots = sortedRobots.sort(function(a, b) {
				if(vm.calculateScore(a) < vm.calculateScore(b)) return 1;
				if(vm.calculateScore(b) < vm.calculateScore(a)) return -1;
				return 0;
			});
		}
		if (vm.categoryId >= 4) {
			sortedRobots = robots.slice(0);
			sortedRobots = sortedRobots.sort(function(a, b) {
				if(vm.calculateCombatScore(a) < vm.calculateCombatScore(b)) return 1;
				if(vm.calculateCombatScore(a) > vm.calculateCombatScore(b)) return -1;
				if(vm.calculateCombatScore(a) == vm.calculateCombatScore(b)
						&& a.combatInfo.played > b.combatInfo.played) return -1;
				if(vm.calculateCombatScore(a) == vm.calculateCombatScore(b)
						&& a.combatInfo.played < b.combatInfo.played) return 1;
				if(vm.calculateCombatScore(a) == vm.calculateCombatScore(b)
						&& vm.defeated(a, b)) return -1;
				if(vm.calculateCombatScore(a) == vm.calculateCombatScore(b)
						&& vm.defeated(b, a)) return 1;
				return 0;
			});
		}


		return sortedRobots.slice(0,size-1);
	}

	vm.rankingDialog = function($event){
		console.log("ROBOTS", vm.robots);
		vm.ranking = getRanking(vm.robots, vm.categoryRankingSize);
		console.log("RANKING", vm.ranking);
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

	vm.calculateCombatScore = function(robot){
		var ci = robot.combatInfo;
		score = (ci.won * 2) + ci.draw;
		return score;
	}

	vm.calculateCombatStatus = function(robot){
		var ci = robot.combatInfo;
		status = "Alive";
		if (ci.eliminated) status = "Eliminated";
		if (ci.dropOut) status = "Dropped";
		return status;
	}

	vm.altaRobot = function(robotName, robotCategory){
		var robotData = {
			"name": robotName,
			"category": robotCategory
		}

		var tourneyData = {
			"name": "Torneo Categoria " + robotCategory,
			"category" : robotCategory,
			"modality" : "single"
		}


		if(robotName != "" && robotCategory != 0){
			Robot.create(robotData)
				.then(function(ret){
					if(!ret.data.success){
						alert("Error creating robot. " + ret.data.message);
					}
					// Check if robot belongs to a tourney
					if (robotCategory >= 4){
						Tourney.getByCategory(robotCategory)
							.then(function (tret) {
								// Tourney doesn't exist in this category
								if (tret.data.message.length == 0){
									Tourney.create(tourneyData)
										.then(function(tcret){
											if(!tcret.data.success){
												alert("Error creating tourney for robot " + tcret.data.error)
											}
											Tourney.addRobot(tcret.data.message._id, ret.data.message._id)
											.then(function (aret){
												if(!aret.data.success){
													alert("Error adding robot. " + aret.data.message);
												}
											});
										});
								} else {
									Tourney.addRobot(tret.data.message[0]._id, ret.data.message._id)
									.then(function (aret){
										if(!aret.data.success){
											alert("Error adding robot. " + aret.data.message);
										}
									});
								}
							});
						}
				});
		} else {
			alert("Invalid Name and/or Category");
		}
	}

	vm.bajaRobot = function(robot){
		if (robot.category >= 4){
			// Find the robot's category tournament
			Tourney.getByCategory(robot.category)
				.then(function (tret){
					if(!tret.data.success){
						alert("Error finding corresponding tourney: " + aret.data.message);
					}
					downTourney = tret.data.message[0];
					Tourney.removeRobot(downTourney._id, robot._id)
						.then(function (dret){
							if(!dret.data.success){
								alert("Error removing robot from corresponding tourney: " + dret.data.message);
							} else {
								Robot.delete(robot._id)
							}
						})
				});
		} else {
			Robot.delete(robot._id)
		}
	}

	vm.defeated = function(robotA, robotB){
		Tourney.getByCategory(robotA.category)
			.then(function(ret0){
				if (ret0.data.message.length == 0){
					return false;
				} else {
					tourney = ret0.data.message[0];
					Tourney.allMatches(tourney._id)
						.then(function(ret1){
							matches = ret1.data.message.all;
							winners = matches.filter(m => (m.participant_a == robotA._id && m.participant_b == robotB._id)
								|| (m.participant_a == robotB._id && m.participant_b == robotA._id))
								.map(m => m.winner);
							var win_a = 0;
							var win_b = 0;
							winners.forEach(function(w){
								if (w == robotA._id) win_a += 1;
								if (w == robotB._id) win_b += 1;
							});
							if (win_a > win_b){
								return true;
							} else {
								return false;
							}
						});
				}
			});
	}


	refreshRobotList(vm.categoryId);

	overlayRefresh = function(){
    $timeout(function() {
			refreshRobotList(vm.categoryId);
      vm.ranking = getRanking(vm.robots, vm.categoryRankingSize);
      overlayRefresh();
    }, 1000)
  };

	overlayRefresh();
});

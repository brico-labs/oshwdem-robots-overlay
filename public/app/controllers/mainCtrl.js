angular.module('mainCtrl', [])
.controller('mainController', function($route, $routeParams, $rootScope, $timeout,
	$location, $scope, Robot, Race, Tourney, ngDialog) {
	var vm = this;

	$scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };

	$scope.getCategoryTemplate = function(){
		baseUrl = "/app/views/partial/";
		switch($location.path()){
			case "/siguelineas":
				baseUrl += "race_plus.html";
				break;
			case "/laberinto":
				baseUrl += "race.html";
				break;
			case "/velocistas":
				baseUrl += "mixed.html";
				break;
			case "/sumo":
				baseUrl += "tourney.html";
				break;
			case "/combate":
				baseUrl += "tourney.html";
				break;
			case "/hebocon":
				baseUrl += "tourney.html";
				break;
			default:
				baseUrl += "general.html";
				break;
		}
		return baseUrl;
	}

	vm.prettyCategory = function(categorySlug){
		switch(categorySlug){
			case "laberinto":
				return "de Laberinto";
			case "siguelineas":
				return "Siguelineas";
			case "velocistas":
				return "Velocistas de Persecución";
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

	vm.categorySlug = $location.path().split('/').slice(-1)[0];
	vm.isOverlay = $location.path().split('/').indexOf('overlay') >= 0;
	vm.categoryTitle = vm.prettyCategory(vm.categorySlug);
	vm.routePath = "/"+vm.categorySlug;
	vm.categoryRankingSize = 10;

	vm.raceStarted = false;
	vm.tourneyStarted = false;

	var refreshRobotList = function(categorySlug){
		if (categorySlug != '' ){
			Robot.getByCategory(vm.categorySlug)
				.then(function(ret) {
					vm.robots = ret.data.message;
				});
		} else {
			Robot.getAll()
				.then(function(ret) {
					vm.robots = ret.data.message;
				});
		}
	}

	vm.newRobotDialog = function($event) {
		var dialog = ngDialog.open({
      		template: 'app/views/modals/new.html',
			scope: $scope,
			controller: 'RobotController',
			controllerAs: 'rob'
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
			}
    });
	};

	vm.createRaceDialog = function($event) {
		var dialog = ngDialog.open({
			template: 'app/views/modals/create_race.html',
			scope : $scope,
			controller: 'RaceController',
			controllerAs: 'rac'
		})
	}

	vm.deleteRaceDialog = function($event) {
		var dialog = ngDialog.open({
			template: 'app/views/modals/delete_race.html',
			scope : $scope,
			controller: 'RaceController',
			controllerAs: 'rac',
			data :{
				categoryTitle: vm.categoryTitle,
				categorySlug: vm.categorySlug
			}
		})
	}

	vm.createTourneyDialog = function(topCut, sortFeature, $event){
		var dialog = ngDialog.open({
			template: 'app/views/modals/create_tourney.html',
			scope : $scope,
			controller: 'TourneyController',
			controllerAs: 'trn',
			data : {
				robotCount : vm.robots.length,
				selectTopCut : topCut,
				sortFeature : sortFeature
			}
		})
	}

	vm.deleteTourneyDialog = function($event){
		var dialog = ngDialog.open({
			template: 'app/views/modals/delete_tourney.html',
			scope : $scope,
			controller: 'TourneyController',
			controllerAs: 'trn',
			data : {
				categoryTitle: vm.categoryTitle,
				categorySlug: vm.categorySlug
			}
		})
	}

	vm.isRaceCategory = function(category){
		return (['laberinto', 'siguelineas', 'velocistas'].indexOf(category) >= 0)
	}

	vm.isTourneyCategory = function(category){
		return (['sumo', 'combate', 'hebocon', 'velocistas'].indexOf(category) >= 0)
	}

	vm.isRacePlus = function(category){
		return (['siguelineas'].indexOf(category) >= 0)
	}

	pad = function(n, width, z) {
		z = z || '0';
		n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}

	fillArray = function(arr, width, elem) {
		while (arr.length < width) {
		  arr.push(elem);
		}
		return arr;
	}

	vm.prettyTime = function(time){
		if(time == undefined){
			return '00:00.000';
		} else {
			return pad(time.minutes, 2) + ":" + pad(time.seconds, 2) + "." + pad(time.miliseconds, 3);
		}
	}

	timeToMiliseconds = function(time){
		if (time == undefined) return 9999999999999999;
		return (time.minutes*60*1000 + time.seconds*1000 + time.miliseconds)
	}

	vm.bestRobotTimes = function(robot){
		var robotRaceTimes = robot.times.filter(time => time.race == vm.raceID);
		sortedTimes = robotRaceTimes.sort(function(a, b) {
			if(timeToMiliseconds(a) < timeToMiliseconds(b)) return -1;
			if(timeToMiliseconds(b) < timeToMiliseconds(a)) return 1;
			return 0;
		});
		return fillArray(sortedTimes.slice(0,3), 3, undefined);
	}

	robotBestTimeMili = function(robot){
		bt = vm.bestRobotTimes(robot);
		ms = timeToMiliseconds(bt[0]);
		return ms;
	}

	bestTourneyScore = function(a, b){
		if (vm.tourneyScore(a) && vm.tourneyScore(b)){
			// Check current score
			if (vm.tourneyScore(a).currentScore > vm.tourneyScore(b).currentScore) return -1;
			if (vm.tourneyScore(b).currentScore > vm.tourneyScore(a).currentScore) return 1;
			// In case of draw
			if (vm.tourneyScore(a).currentScore == vm.tourneyScore(b).currentScore){
				// Check direct enconunter
				if (vm.tourneyScore(a).defeated.indexOf(b._id) != -1) return -1;
				if (vm.tourneyScore(b).defeated.indexOf(a._id) != -1) return 1;
				// Check wins number
				if (vm.tourneyScore(a).won > vm.tourneyScore(b).won) return -1;
				if (vm.tourneyScore(b).won > vm.tourneyScore(a).won) return 1;
				// Check trajectory
				if (vm.tourneyScore(a).trajectory > vm.tourneyScore(b).trajectory) return -1;
				if (vm.tourneyScore(b).trajectory > vm.tourneyScore(a).trajectory) return 1;
				// If everything fails, check clasification times
				if(robotBestTimeMili(a) && robotBestTimeMili(b)){
					if (robotBestTimeMili(a) < robotBestTimeMili(b)) return -1;
					if (robotBestTimeMili(b) < robotBestTimeMili(a)) return 1;
				}
			}
		}
		return 0;
	}

	$scope.rankingSort = function(robots, feature){
		if (robots){
			sortedRobots = [];
			if (feature == 'time') {
				sortedRobots = robots.sort(function(a, b) {
					if (robotBestTimeMili(a) < robotBestTimeMili(b)) return -1;
					if (robotBestTimeMili(b) < robotBestTimeMili(a)) return 1;
					return 0;
				});
			}
			if (feature == 'score') {
				sortedRobots = robots.sort(function(a,b){
					if (vm.racePlusScore(a) < vm.racePlusScore(b)) return 1;
					if (vm.racePlusScore(b) < vm.racePlusScore(a)) return -1;
					return 0;
				});
			}
			if (feature == 'tourneyScore'){
				sortedRobots = robots.sort(bestTourneyScore);
			}
			return sortedRobots;
		}
	}

	vm.manageRobotTimesDialog = function(robot, $event) {
		var dialog = ngDialog.open({
			template: 'app/views/modals/manage_robot_times.html',
			scope : $scope,
			controller: 'RobotController',
			controllerAs: 'rob',
			data: {
				robot: robot,
				raceID: vm.raceID
			}
		})
	}

	vm.addRobotTimeDialog = function(robot, $event){
		newTime = { 'race':vm.raceID, 'minutes':0, 'seconds':0, 'miliseconds':0 };
		var dialog = ngDialog.open({
			template: 'app/views/modals/add_time.html',
			scope : $scope,
			controller: 'RobotController',
			controllerAs: 'rob',
			data: {
				robot: robot,
				newTime: newTime
			}
		})
	}

	vm.pairTourneyRoundDialog = function($event){
		var dialog = ngDialog.open({
			template: 'app/views/modals/new_tourney_round.html',
			scope : $scope,
			controller: 'TourneyController',
			controllerAs: 'trn',
			data : {
				categoryTitle: vm.categoryTitle,
				categorySlug: vm.categorySlug
			}
		})
	}

	vm.timeIndex = function(robot) {
		timeSorted = $scope.rankingSort(vm.robots, 'time');
		return timeSorted.indexOf(robot);
	}

	vm.racePlusScore = function(robot){
		score = 0;
		if (robot.extra.bestRecycled) score = score+5;
		if (robot.extra.bestOriginal) score = score+5;
		if (robot.extra.bestOnlineDocs) score = score+6;
		score += robot.times.length * 2;

		if (robot.times.length > 0){
			idx = vm.timeIndex(robot);
			if (idx == 0) score += 4;
			if (idx == 1) score += 3;
			if (idx == 2) score += 2;
		}

		return score;
	}

	vm.tourneyScore = function(robot){
		robot.scores.filter(rs => rs.tourney == vm.tourneyID);
		score = robot.scores[0];
		if (!score){
			return null;
		}
		return score
	}

	$scope.setScores = function() {
		matches = vm.roundMatches();
		matches.forEach( ma => {
			if (ma.resultA > ma.resultB) ma.winner = ma.robotA;
			if (ma.resultB > ma.resultA) ma.winner = ma.robotB;
			if (ma.resultB == ma.resultA){
				ma.winner = null;
				ma.isDraw = true;
			} else {
				ma.isDraw = false;
			}
		})
		Tourney.updateRounds(vm.tourney._id, vm.tourney.rounds);
	}

	vm.toggleBest = function(robot, feature){
		switch(feature){
			case 'recycled':
				bf = 'bestRecycled';
				break;
			case 'original':
				bf = 'bestOriginal';
				break;
			case 'documentation':
				bf = 'bestOnlineDocs';
				break;
			default:
				return;
		}

		robot.extra[bf] = !robot.extra[bf];
		// If marking a robot as new best, unmark the rest
		if(robot.extra[bf]){
			vm.robots.forEach(rob => {
				if (rob._id != robot._id && rob.extra[bf]){
					rob.extra[bf] = false;
					Robot.updateRobotExtra(rob._id, rob.extra);
				}
			});
		}
		Robot.updateRobotExtra(robot._id, robot.extra);
	};

	vm.isBest = function(robot, feature){
		switch(feature){
			case 'recycled':
				bf = 'bestRecycled';
				break;
			case 'original':
				bf = 'bestOriginal';
				break;
			case 'documentation':
				bf = 'bestOnlineDocs';
				break;
			default:
				return;
		}

		return (robot.extra[bf])
	}

	vm.robotDropped = function(robot){
		robot.scores.filter(rs => rs.tourney == vm.tourneyID);
		score = robot.scores[0];
		return score.dropped;
	}

	vm.pendingMatches = function(){
		tourney = vm.tourney;
		currentRound = tourney.rounds[tourney.rounds.length-1];
		if (!currentRound){
			return [];
		} else {
			matches = currentRound.matches.filter(ma => (ma.winner == undefined && !ma.isDraw));
		}
		return matches;
	}

	vm.roundMatches = function(){
		tourney = vm.tourney;
		currentRound = tourney.rounds[tourney.rounds.length-1];
		if (!currentRound){
			return [];
		} 
		return currentRound.matches;	
	}

	vm.dropRobot = function(robot){
		if (confirm("Quitar a " + robot.name + " de la competición?") == true){
			robot.scores[0].dropped = true;
			Robot.updateScores(robot._id, robot.scores);
		}
	}

	vm.aliveRobots = function(robots){
		if (robots && vm.tourneyStarted){
			return robots.filter(rb => !vm.tourneyScore(rb).dropped);
		} else {
			return robots;
		}
	}

	$scope.refreshEverything = function(){
		refreshRobotList(vm.categorySlug);

		if (vm.isRaceCategory(vm.categorySlug)){
			if (vm.isRacePlus(vm.categorySlug)){
				vm.categoryRankingSize = 5;
			} else {
				vm.categoryRankingSize = 10;
			}
			Race.getByCategory(vm.categorySlug)
			.then(function(ret){
				vm.raceStarted = (ret.data.message.length > 0 );
				if (vm.raceStarted) vm.raceID = ret.data.message[0]._id;
			});
		}

		if (vm.isTourneyCategory(vm.categorySlug)){
			vm.categoryRankingSize = 10;
			Tourney.getByCategory(vm.categorySlug)
			.then(function(ret){
				vm.tourneyStarted = (ret.data.message.length > 0 );
				if (vm.tourneyStarted){
					vm.tourney = ret.data.message[0];
					vm.tourneyID = vm.tourney._id;
				}
			});
		}


	}

	$scope.refreshEverything();

	overlayRefresh = function(){
		$timeout(function() {
			$scope.refreshEverything();
			overlayRefresh();
		}, 1000)
	}

	if (vm.isOverlay){
		overlayRefresh();
	}
});

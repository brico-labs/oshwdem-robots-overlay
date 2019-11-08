angular.module('overCtrl', [])
.controller('overlayController', function(Race, Tourney, Robot, ngDialog, $scope, $location) {
    var vm = this;

	vm.categorySlug = $location.path().split('/')[2];
	vm.routePath = "/"+vm.categorySlug;
	vm.categoryRankingSize = 10;

	vm.isRaceCategory = function(category){
		return (['laberinto', 'siguelineas', 'velocistas'].indexOf(category) >= 0)
	}

	vm.isTourneyCategory = function(category){
		return (['sumo', 'combate', 'hebocon', 'velocistas'].indexOf(category) >= 0)
	}

	vm.isRacePlusCategory = function(category){
		return (['siguelineas'].indexOf(category) >= 0)
	}


	refreshEverything = function(){
		$scope.rankingSort([], 'time');

		if (vm.isRaceCategory(vm.categorySlug)){
			Race.getByCategory(vm.categorySlug)
			.then(function(ret){
				vm.raceStarted = (ret.data.message.length > 0 );
				if (vm.raceStarted) vm.raceID = ret.data.message[0]._id;
			});
		}

		if (vm.isTourneyCategory(vm.categorySlug)){
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

	refreshEverything();

});

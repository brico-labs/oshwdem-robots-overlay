angular.module('raceCtrl', [])
.controller('RaceController', function(Race, Robot, ngDialog, $scope) {
    var ra = this;
    
    ra.newRace = {
		category: "",
		robots : []
    }
    
    ra.createRace = function(categoryName, robots){
        var robotIDs = robots.map( rob => rob._id);
        if(categoryName != "" && robots != []){
			Race.create(categoryName, robotIDs)
				.then(function(ret){
					if(!ret.data.success){
						alert("Error creating race. " + ret.data.message);
					}
					$scope.refreshEverything();
				});
		} else {
			alert("Invalid Category or Robot List");
		}
	}

	ra.deleteRace = function(raceID, robots){
        if(raceID != "" && robots != []){
			robots.forEach(rob => {
				times = rob.times.filter(time => time.race != raceID);
				Robot.updateTimes(rob._id, times)
			});
			Race.delete(raceID)
				.then(function(ret){
					$scope.refreshEverything();
				})
		}
	}

});

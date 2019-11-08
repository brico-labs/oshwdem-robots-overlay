angular.module('robotCtrl', [])
.controller('RobotController', function(Robot, ngDialog, $scope) {
	var r = this;

	r.robotCategories = [
		{slug: "laberinto", name: "Laberinto"},
		{slug: "siguelineas", name: "Siguelineas"},
		{slug: "velocistas", name: "Velocistas"},
		{slug: "sumo", name: "Sumo"},
		{slug: "hebocon", name: "HEBOCON"},
		{slug: "combate", name: "Combate"},
	]

	r.newRobot = {
		name: "",
		category: 0
	}

	r.deleteRobot = function(robot){
		Robot.delete(robot._id)
			.then(function(ret){
				$scope.refreshEverything();
			})
	}

	r.createRobot = function(name, categoryName, hasExtra=false){
		if(name != "" && categoryName != ''){
			Robot.create(name, categoryName, hasExtra = hasExtra)
				.then(function(ret){
					if(!ret.data.success){
						alert("Error creating robot. " + ret.data.message);
					}
					$scope.refreshEverything();
				});
		} else {
			alert("Invalid Name and/or Category");
		}
	}

	r.addTime = function(robot, newTime){
		if ((robot && newTime.minutes != undefined 
			&& newTime.seconds != undefined && newTime.miliseconds != undefined)
			|| (newTime.minutes || newTime.seconds || newTime.miliseconds)){
			robot.times.push(newTime);
			Robot.updateTimes(robot._id, robot.times)
				.then(function(ret){
					if(!ret.data.success){
						alert("Error adding time to robot. " + ret.data.message);
					}
				});
		} else {
			alert('Invalid Time!')
		}
	}

	r.confirmDeleteTime = function(robot, timeIndex){
		if (confirm("Remove time "+ (timeIndex+1) +"?") == true) {
			robot.times.splice(timeIndex, 1)
			Robot.updateTimes(robot._id, robot.times)
			.then(function(ret){
				if(!ret.data.success){
					alert("Error updating robot's times. " + ret.data.message);
				}
			});
		}
	}

	r.updateRobot = function(robot){
		if(robot.name != "" && robot.category != ''){
			Robot.updateRobot(robot._id, robot.name, robot.hasDocumentation)
				.then(function(ret){
					if(!ret.data.success){
						alert("Error updating robot's name. " + ret.data.message);
					}
				});
		} else {
			alert("Invalid Name and/or Category");
		}
	}
});

angular.module('robotCtrl', [])
.controller('RobotController', function($route, $routeParams, $rootScope, $location, $scope, Robot, Tourney, ngDialog) {
		var r = this;

		r.robotCategories = [
			{id: 1, slug: "laberinto", name: "Laberinto"},
			{id: 2, slug: "siguelineas", name: "Siguelineas"},
			{id: 3, slug: "velocistas", name: "Velocistas"},
			{id: 4, slug: "sumo", name: "Sumo"},
			{id: 5, slug: "hebocon", name: "HEBOCON"},
			{id: 6, slug: "combate", name: "Combate"},
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
						}
					});
			} else {
				alert("Invalid Name and/or Category");
			}
		}
});

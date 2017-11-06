angular.module('mainCtrl', [])
.controller('mainController', function($rootScope, $location, Robot) {
	var vm = this;
	vm.message = 'HI THERE!';

	Robot.all()
		.then(function(ret) {
			// when all the robots come back, remove the processing variable
			vm.processing = false;
			// bind the robots that come back to vm.robots
			vm.robots = ret.data;
		});
});

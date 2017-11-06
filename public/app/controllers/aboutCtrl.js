angular.module('aboutCtrl', [])
.controller('aboutController', function($rootScope, $location) { 
	var vm = this;
	vm.message = 'About message!';
});
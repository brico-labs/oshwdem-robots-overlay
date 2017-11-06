angular.module('robotService', [])
  .factory('Robot', function($http) {
    // create a new object
    var robotFactory = {};

    // get a single robot
    robotFactory.get = function(id) {
      return $http.get('/api/robots/' + id);
    };

    // get all robots
    robotFactory.all = function() {
      return $http.get('/api/robots/');
    };

    robotFactory.getByCategory = function(id) {
      return $http.get('/api/robots/category/' + id);
    };

    // create a robot
    robotFactory.create = function(robotData) {
      return $http.post('/api/robots/', robotData);
    };

    // update a robot
    robotFactory.update = function(id, robotData) {
      return $http.put('/api/robots/' + id, robotData);
    };

    // delete a robot
    robotFactory.delete = function(id) {
      return $http.delete('/api/robots/' + id);
    };

    // return our entire robotFactory object
    return robotFactory;
});

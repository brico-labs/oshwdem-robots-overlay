angular.module('robotService', [])
  .factory('Robot', function($http) {
    // create a new object
    var robotFactory = {};

    // get a single robot
    robotFactory.get = function(id) {
      return $http.get('/api/robots/' + id);
    };

    robotFactory.getByNameAndCategory = function(name, category) {
      return $http.get('/api/robots/' + name + '?category=' + category);
    };

    // get all robots
    robotFactory.getAll = function() {
      return $http.get('/api/robots/');
    };

    robotFactory.getByCategory = function(categoryName) {
      return $http.get('/api/category/' + categoryName + '/robots');
    };

    // create a robot
    robotFactory.create = function(name, category, hasExtra=false) {
      if (!hasExtra) {
        var robotData = {'name' : name, 'category' : category, 'hasDocumentation' : false }
      } else {
        extra = { 'bestRecycled': false, 'bestOriginal': false, 'bestOnlineDocs': false }
        var robotData = {'name' : name, 'category' : category, 'hasDocumentation' : false, 'extra' : extra }
      }
      return $http.post('/api/robots/', robotData);
    };

    // update a robot's name
    robotFactory.updateRobot = function(robotId, robotName, robotHasDocumentation) {
      var robotData = {'name' : robotName, 'hasDocumentation' : robotHasDocumentation }
      return $http.put('/api/robots/' + robotId, robotData);
    };

    robotFactory.updateTimes = function(robotId, times){
      var robotData = {'times' : times};
      return $http.put('/api/robots/' + robotId, robotData);
    }

    robotFactory.updateScores = function(robotId, scores){
      var robotData = {'scores' : scores};
      return $http.put('/api/robots/' + robotId, robotData);
    }

    robotFactory.updateRobotExtra = function(robotId, robotExtra){
      var robotData = { 'extra' : robotExtra }
      return $http.put('/api/robots/' + robotId, robotData);
    };

    // delete a robot
    robotFactory.delete = function(id) {
      return $http.delete('/api/robots/' + id);
    };

    // return our entire robotFactory object
    return robotFactory;
});

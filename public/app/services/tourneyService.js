angular.module('tourneyService', [])
  .factory('Tourney', function($http) {
    // create a new object
    var tourneyFactory = {};

    // get a single tourney
    tourneyFactory.get = function(id) {
      return $http.get('/api/tourney/' + id);
    };

    // get all tourneys
    tourneyFactory.all = function() {
      return $http.get('/api/tourney/');
    };

    tourneyFactory.getByCategory = function(id) {
      return $http.get('/api/tourney/category/' + id);
    };

    // create a tourney
    tourneyFactory.create = function(tourneyData) {
      return $http.post('/api/tourney/', tourneyData);
    };

    // update a tourney
    tourneyFactory.update = function(tourneyId, tourneyData) {
      return $http.put('/api/tourney/' + tourneyId, tourneyData);
    };

    // delete a tourney
    tourneyFactory.delete = function(id) {
      return $http.delete('/api/tourney/' + id);
    };

    tourneyFactory.allRobots = function(tourneyId) {
      return $http.get('/api/tourney/' + tourneyId + '/robots/');
    };

    // add a robot to a tourney
    tourneyFactory.addRobot = function(tourneyId, robotId) {
      return $http.post('/api/tourney/' + tourneyId + '/robots/', {"robot_id": robotId});
    };

    tourneyFactory.removeRobot = function(tourneyId, robotId) {
      return $http.delete('/api/tourney/' + tourneyId + '/robots/' + robotId);
    };

    tourneyFactory.allMatches = function(tourneyId) {
      return $http.get('/api/tourney/' + tourneyId + '/matches/');
    };

    tourneyFactory.getMatch = function(tourneyId, matchId) {
      return $http.get('/api/tourney/' + tourneyId + '/matches/' + matchId);
    };

    tourneyFactory.removeMatch = function(tourneyId, matchId) {
      return $http.delete('/api/tourney/' + tourneyId + '/matches/' + matchId );
    };

    tourneyFactory.setMatch = function(tourneyId, matchData) {
      return $http.put('/api/tourney/' + tourneyId + '/matches/', { "matchData": matchData } );
    };

    tourneyFactory.addMatch = function(tourneyId, matchData) {
      return $http.post('/api/tourney/' + tourneyId + '/matches/', matchData);
    };

    tourneyFactory.updateCurrentMatches = function(tourneyId, matches) {
      return $http.put('/api/tourney/' + tourneyId + '/matches/', matches);
    };

    tourneyFactory.removeAllMatches = function(tourneyId) {
      return $http.delete('/api/tourney/' + tourneyId + '/matches/',);
    };

    // return our entire tourneyFactory object
    return tourneyFactory;
});

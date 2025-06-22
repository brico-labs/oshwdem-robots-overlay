angular.module('tourneyService', [])
  .factory('Tourney', function($http) {
    // create a new object
    var tourneyFactory = {};

    tourneyFactory.get = function(id) {
      return $http.get('/api/tourneys/' + id);
    };

    tourneyFactory.getByCategory = function(category_id) {
        return $http.get('/api/category/'+category_id+'/tourneys')
    };

    tourneyFactory.create = function(category, system, robots, seeded) {
      var tourneyData = {'category' : category, 'robots' : robots, 'system' : system, 'seeded' : seeded }
      return $http.post('/api/tourneys/', tourneyData);
    };

    tourneyFactory.delete = function(tourneyID) {
        return $http.delete('/api/tourneys/' + tourneyID);
    };

    tourneyFactory.updateRounds = function(tourneyID, rounds){
      var tourneyData = { 'rounds' : rounds};
      return $http.put('/api/tourneys/' + tourneyID, tourneyData)
    }


    // return our entire raceFactory object
    return tourneyFactory;
});

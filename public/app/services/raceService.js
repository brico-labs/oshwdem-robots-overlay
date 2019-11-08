angular.module('raceService', [])
  .factory('Race', function($http) {
    // create a new object
    var raceFactory = {};

    // get a single race
    raceFactory.get = function(id) {
        return $http.get('/api/races/' + id);
    };

    raceFactory.getByCategory = function(category_id) {
        return $http.get('/api/category/'+category_id+'/races')
    };

    raceFactory.create = function(category, robots) {
        var raceData = {'category' : category, 'robots' : robots }
        return $http.post('/api/races/', raceData);
    };

    raceFactory.delete = function(raceID) {
        return $http.delete('/api/races/' + raceID);
    };

    // return our entire raceFactory object
    return raceFactory;
});

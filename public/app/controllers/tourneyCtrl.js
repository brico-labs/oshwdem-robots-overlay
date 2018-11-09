angular.module('tourneyCtrl', [])
.controller('TourneyController', function($route, $routeParams, $rootScope,
  $location, $scope, $timeout, Robot, Tourney, ngDialog) {
  var tn = this;

  tn.msg = "tourneytable goes here"

  var shuffle = function (arra1) {
    var ctr = arra1.length, temp, index;
      while (ctr > 0) {
          index = Math.floor(Math.random() * ctr);
          ctr--;
          temp = arra1[ctr];
          arra1[ctr] = arra1[index];
          arra1[index] = temp;
      }
      return arra1;
  }

  tn.getMatches = function(tourney_category){
    Tourney.getByCategory(tourney_category)
      .then(function(ret){
        if (ret.data.message.length == 0 ){
					tn.all_match_list = []
          tn.current_match_list = []
				} else {
          Tourney.allMatches(ret.data.message[0]._id)
            .then(function (mret){
              tn.all_match_list = mret.data.message.all;
              tn.current_match_list = mret.data.message.current;
            });
        }
      })
  }

  tn.getCurrentTourney = function(tourney_category){
    Tourney.getByCategory(tourney_category)
      .then(function(ret){
        if (ret.data.message.length == 0 ){
          tn.currentTourney = null;
        } else {
          tn.currentTourney = ret.data.message[0];
        }
      })
  }

  tn.beginTourneyDialog = function($event){
		Tourney.getByCategory($scope.categoryId)
			.then(function(ret){
				if (ret.data.message.length == 0 ){
					alert("Tourney doesn't exist, add some robots first.")
				} else {
					league_tourney = ret.data.message[0]
					if (league_tourney.robots.length < 2){
						alert("Not enough robots to create the tourney.")
					} else {
						var dialog = ngDialog.open({
							template: 'app/views/modals/tourney_confirmation.html',
							scope: $scope,
							controller: 'TourneyController',
							controllerAs: 'trny',
							data: {
								tourney: league_tourney
							},
        			preCloseCallback: function(value){
                tn.getCurrentTourney($scope.categoryId);
                tn.getMatches($scope.categoryId);
        			}
						});
					}
				}
			});
	}

	tn.resetTourneyDialog = function($event){
		Tourney.getByCategory($scope.categoryId)
			.then(function(ret){
				if (ret.data.message.length == 0 ){
					alert("Tourney doesn't exist, add some robots first.")
				} else {
					league_tourney = ret.data.message[0]
					if (league_tourney.robots.length < 2){
						alert("Not enough robots to create the league.")
					} else {
						var dialog = ngDialog.open({
							template: 'app/views/modals/reset_tourney_confirmation.html',
							scope: $scope,
							controller: 'TourneyController',
							controllerAs: 'trny',
							data: {
								tourney: league_tourney
							},
        			preCloseCallback: function(value){
                tn.getCurrentTourney($scope.categoryId);
                tn.getMatches($scope.categoryId);
        			}
						});
					}
				}
			});
	}

  tn.createLeagueMatches = function(league_tourney){
    league_tourney.modality = "league";
    Tourney.update(league_tourney._id, league_tourney);

    league_robots = league_tourney.robots;
    shuffled_robots = shuffle(league_robots);

    var matchData;
    var participants = shuffled_robots.length;
    var matchesA = [];
    var matchesB = [];

    var count = 0;
    for (i = 0; i < shuffled_robots.length; i++){
      for (j = i; j < shuffled_robots.length; j++){
        if (i != j){
          matchData = {
            "stage": 0,
            "result_a": 0,
            "result_b": 0,
            "participant_a": shuffled_robots[i],
            "participant_b": shuffled_robots[j],
            "winner": null
          }

          if (count%2 == 0){
            matchesA.push(matchData);
          } else {
            matchesB.push(matchData);
          }

          count += 1;
        }
      }
    }

    var matchesA = matchesA.reverse();
    var matches = [];
    for (i = 0; i < count; i++){
      if ((i%2)==0){
        matches.push(matchesA.pop())
      } else {
        matches.push(matchesB.pop())
      }
    }

    matches.forEach(function (matchData){
      Tourney.addMatch(league_tourney._id, matchData)
    });

    tn.getCurrentTourney($scope.categoryId);
  }

  tn.hasByed = function(robot){
    var v = 0;
    v += robot.combatInfo.won;
    v += robot.combatInfo.lost;
    v += robot.combatInfo.draw;

    if (v != robot.combatInfo.played){
      return true;
    } else {
      return false;
    }
  }

  tn.createSingleTourneyMatches = function(tourney){
    tn.getCurrentTourney($scope.categoryId);
    tn.getMatches($scope.categoryId);

    robots = tourney.robots;
    var participants = tourney.robots.length;
    var matchData;

    console.log("Creating new matches");

    if (tourney.allMatches.length == 0){
      console.log("Empty tourney, create from scratch");
      tourney.modality = "single";
      Tourney.update(tourney._id, tourney);

      shuffled_robots = shuffle(robots);
      for(i=1; i < participants; i+=2){

        robotA = shuffled_robots[i-1];
        robotB = shuffled_robots[i];

        matchData = {
          "stage": 0,
          "result_a": 0,
          "result_b": 0,
          "participant_a": robotA._id,
          "participant_b": robotB._id,
          "winner": null
        }
        Tourney.addMatch(tourney._id, matchData);
      }

      if ((participants % 2) == 1){
        // Left out robot of initial shuffle has a BYE if odd number of bots
        robotA = shuffled_robots[participants-1];

        matchData = {
          "stage": 0,
          "result_a": 1,
          "result_b": 0,
          "participant_a": robotA._id,
          "winner": robotA._id
        }

        Tourney.addMatch(tourney._id, matchData)
          .then(function(ret){
              trny = ret.data.message;
              tmatch = trny.currentMatches[trny.currentMatches.length-1]
              tmatch.winner = robotA._id;
              tmatch.result_a = 1;
              tmatch.result_b = 0;
              trueRobotData = {
                "combatInfo" : {
                  "won" : robotA.combatInfo.won +1
                }
              };
              Tourney.setMatch(trny._id, tmatch)
                .then(function(ret0){
                  Tourney.removeMatch(trny._id, tmatch._id)
                    .then(function(ret1){
                      Robot.update(robotA._id, trueRobotData)
                        .then(function(ret2){
                          tn.getCurrentTourney($scope.categoryId);
                          tn.getMatches($scope.categoryId);
                        });
                    });
                });
            });


      }
    } else {
      currentStage = tourney.allMatches[tourney.allMatches.length-1].stage + 1;
      previousStage = currentStage-1;
      previousWinners = tourney.allMatches.filter(m => m.stage == previousStage).map(m => m.winner);
      previousWinners = previousWinners.filter(w => !w.combatInfo.dropOut);

      if (previousWinners.length == 1){
        alert('Cannot create more rounds, the winner has been already decided');
        return null;
      }

      byeMatchPos = -1;
      if (previousWinners.length % 2 == 1){
        r = Math.floor(Math.random() * previousWinners.length);
        while(tn.hasByed(previousWinners[r])) {
          r = ((r+1)%previousWinners.length);
        }
        byeMatchPos = Math.floor((r+1)/2);
        byedWinner = previousWinners.splice(r, 1);
      }

      matches = []
      for(i=1; i < previousWinners.length; i+=2){

        robotA = previousWinners[i-1]._id;
        robotB = previousWinners[i]._id;

        matchData = {
          "stage": currentStage,
          "result_a": 0,
          "result_b": 0,
          "winner": null,
          "participant_a": robotA,
          "participant_b": robotB
        }

        matches.push(matchData);
      }

      if (byeMatchPos >= 0){
        matchData = {
          "stage": currentStage,
          "result_a": 1,
          "result_b": 0,
          "winner": byedWinner[0]._id,
          "participant_a": byedWinner[0]._id
        }
        matches.splice(byeMatchPos, 0, matchData);
      }

      tourney.currentMatches = matches;
      Tourney.update(tourney._id, tourney)
        .then(function(ret0){
          if (byeMatchPos >= 0){
            trny = ret0.data.message;
            byedMatch = trny.currentMatches[byeMatchPos]
            Tourney.setMatch(trny._id, byedMatch)
              .then(function(ret1){
                Tourney.removeMatch(trny._id, byedMatch._id)
                  .then(function(ret2){
                    byedWinner[0].combatInfo.won = byedWinner[0].combatInfo.won+1;
                    Robot.update(byedWinner[0]._id, byedWinner[0])
                      .then(function(ret3){
                        tn.getCurrentTourney($scope.categoryId);
                        tn.getMatches($scope.categoryId);
                      })
                  })
              })
          }
        })
    }
  }

  tn.newTourneyRoundDialog = function($event){
    tourney = tn.currentTourney;
    if (tourney.currentMatches.length > 0){
      alert("There are still some matches pending");
    } else {
      tn.createSingleTourneyMatches(tn.currentTourney);
    }
  }

  tn.deleteTourneyMatches = function(tourney){
    Tourney.removeAllMatches(tourney._id);
    defaultCombatInfo = {
        played: 0,
        won: 0,
        lost: 0,
        draw: 0,
        eliminated: false,
        dropOut: false
    }
    Robot.getByCategory(tourney.category)
      .then(function(ret){
        participants = ret.data.message;
        participants.forEach(function (rob){
          rob.combatInfo = defaultCombatInfo;
          Robot.update(rob._id, rob);
        });
      })
  }

  tn.setTourneyResult = function(match, $event){
    tn.getMatches($scope.categoryId);
    tn.getCurrentTourney($scope.categoryId);

    if(confirm("Set result " + match.participant_a.name + ": "
    + match.result_a + " // " + match.participant_b.name  + ": "
    + match.result_b + "?")){
      tn.currentTourney;
      robotAData = match.participant_a;
      robotBData = match.participant_b;

      var matchData = {
          "result_a": match.result_a,
          "result_b": match.result_b,
          "winner": ""
        }

      if (match.result_a > match.result_b){
        matchData.winner = match.participant_a._id;
        robotAData.combatInfo.won += 1;
        robotAData.combatInfo.played += 1;
        robotBData.combatInfo.lost += 1;
        robotBData.combatInfo.played += 1;
        if (tn.currentTourney.modality == "single"){
          robotBData.combatInfo.eliminated = true;
        }
      }
      if (match.result_a < match.result_b){
        matchData.winner = match.participant_b._id;
        robotAData.combatInfo.lost += 1;
        robotAData.combatInfo.played += 1;
        robotBData.combatInfo.won += 1;
        robotBData.combatInfo.played += 1;
        if (tn.currentTourney.modality == "single"){
          robotAData.combatInfo.eliminated = true;
        }
      }
      if (match.result_a == match.result_b){
        robotAData.combatInfo.draw += 1;
        robotAData.combatInfo.played += 1;
        robotBData.combatInfo.draw += 1;
        robotBData.combatInfo.played += 1;
      }

      tn.currentTourney.currentMatches.some(function(cmatch){
        if(cmatch._id == match._id){
          cmatch.result_a = matchData.result_a;
          cmatch.result_b = matchData.result_b;
          cmatch.winner = matchData.winner;
          Tourney.setMatch(tn.currentTourney._id, cmatch)
            .then(function(ret0){
              Tourney.removeMatch(tn.currentTourney._id, cmatch._id)
                .then(function(ret1){
                  Robot.update(robotAData._id, robotAData);
                  Robot.update(robotBData._id, robotBData);
                  tn.getMatches($scope.categoryId);
                  tn.getCurrentTourney($scope.categoryId);
                });
            });
        }
      });
    }
  }

  tn.getMatches($scope.categoryId);
  tn.getCurrentTourney($scope.categoryId);
});

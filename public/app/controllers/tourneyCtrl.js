angular.module('tourneyCtrl', [])
.controller('TourneyController', function(Tourney, Robot, ngDialog, $scope) {
	var trn = this;
	
	trn.tourneySystem = [
		{slug: "elim-single", name: "Elim. Simple", recom: 16 },
		{slug: "elim-double", name: "Elim. Doble", recom: 8 },
		{slug: "league", name: "Liga", recom: 4 }
	]

	trn.defaultCutOptions = [
		{number : -1, name: "Todos Compiten"},
		{number : 2, name: "2 mejores"},
		{number : 4, name: "4 mejores"},
		{number : 8, name: "8 mejores"},
		{number : 16, name: "16 mejores"}
	]

	trn.recomSystem = function(robotCount, cut) {
		console.log(robotCount, cut);
		if (cut == -1) {
			count = robotCount;
		} else {
			count = Math.min(robotCount, cut);
		}
		retStr = "Para " + count + " participantes se recomienda ";
		choice = "";
		trn.tourneySystem.forEach(sys => {
			if (count <= sys.recom ){
				choice = sys;
			}
		});
		retStr += choice.name;
		matchCount = 0;
		switch(choice.slug){
			case 'league':
				matchCount = (Math.pow(count, 2) - count)/2
				break;
			case 'elim-double':
				matchCount = (2*count - 1)
				break;
			case 'elim-single':
				matchCount = count - 1
				break;
			default:
				matchCount = 0
				break;
		}
		retStr += " (" + matchCount + " cruces)"
		return retStr;

	}

	trn.newTourney = {
		system: "",
		category: "",
		cut: -1
	}

	function shuffle(a) {
		var j, x, i;
		for (i = a.length - 1; i > 0; i--) {
			j = Math.floor(Math.random() * (i + 1));
			x = a[i];
			a[i] = a[j];
			a[j] = x;
		}
		return a;
	}

	trn.createTourney = function(category, system, robots, cut){
		if (cut == undefined || cut == -1) cut = { 'number' : robots.length };
		cut = cut.number;
		var aliveRobots = robots.slice(0, Math.min(cut, robots.length));
		var droppedRobots = robots.slice(cut, robots.length);
		var robotIDs = aliveRobots.map( rob => rob._id).slice(0, cut);
        if(system != "" && category != "" && robotIDs != []){
			Tourney.create(category, system.slug, robotIDs)
				.then(function(ret){
					if(!ret.data.success){
						alert("Error creating tourney. " + ret.data.message);
                    } else {
						allUpdate = []
						aliveScore = {
							tourney: ret.data.message._id,
							currentScore: 0,
							trajectory: 0,
							buccholz: 0,
							dropped: false,
							won : 0,
							lost : 0,
							draw : 0,
							defeated: []
						}
						dropScore = {
							tourney: ret.data.message._id,
							currentScore: 0,
							trajectory: 0,
							buccholz: 0,
							dropped: true,
							won : 0,
							lost : 0,
							draw : 0,
							defeated: []
						}
						aliveRobots.forEach( arb => {
							arb.scores.push(aliveScore);
							allUpdate.push(Robot.updateScores(arb._id, arb.scores));
						});
						droppedRobots.forEach( drb => {
							drb.scores.push(dropScore);
							allUpdate.push(Robot.updateScores(drb._id, drb.scores));
						});
						Promise.all(allUpdate).then(() => $scope.refreshEverything());
					}
				});
		} else {
			alert("Invalid Tourney parameters");
		}
	}

	calculateNewRobotScores = function(tourney, robots){
		lastRound = tourney.rounds[tourney.rounds.length-1];
		robots.forEach(rob => {
			lastRound.matches.forEach(ma => {
				if (ma.robotA && rob._id == ma.robotA._id || ma.robotB && rob._id == ma.robotB._id){
					if (!ma.winner){
						rob.scores[0].currentScore += 1;
						rob.scores[0].draw += 1;
					} else {
						if(ma.winner._id == rob._id){
							rob.scores[0].currentScore += 3;
							rob.scores[0].won += 1;
							if (ma.robotA && ma.robotA._id == ma.winner._id){
								if (ma.robotB){
									rob.scores[0].defeated.push(ma.robotB._id);
								}
							} else {
								if (ma.robotA){
									rob.scores[0].defeated.push(ma.robotA._id);
								}
							}
						} else {
							if (rob){
								rob.scores[0].lost += 1;
							}
						}
					}
				}
			});
			rob.scores[0].trajectory += rob.scores[0].currentScore;
			Robot.updateScores(rob._id, rob.scores);
		});
	}

	trn.pairRound = function(tourney, robots){
		$scope.setScores();
		if (tourney.rounds.length > 0){
			calculateNewRobotScores(tourney, robots);
		}
		newRound = {
			tourney: tourney._id,
			roundNumber: tourney.rounds.length+1,
			matches: []
		}
		newRoundFlat = {
			tourney: tourney._id,
			roundNumber: tourney.rounds.length+1,
			matches: []
		}
		// When finished push an empty round and fuck it
		var aliveRobots = robots.filter(rob => !rob.scores[0].dropped);
		var robots = aliveRobots;
		if (tourney.system == 'league'){
			if (tourney.rounds.length < 1){
				aliveRobots.forEach( robA => {
					aliveRobots.forEach( robB => {
						if (robA._id < robB._id) {
							match = {
								robotA: robA._id,
								robotB: robB._id,
								winner: undefined,
								resultA: 0,
								resultB: 0,
								bracket: "W",
								isDraw: false
							}
							newRound.matches.push(match);
						}
					})
				})
			}
		}
		if (tourney.system == 'elim-single'){
			// No loser matches
			if (tourney.rounds.length < Math.ceil(Math.log2(robots.length))){
				if (tourney.rounds.length > 0){
					// Subsequent rounds look at the previous matches
					// These should be normal
					previousRound = tourney.rounds[tourney.rounds.length-1]
					roundRobots = [];
					previousRound.matches.forEach( ma => {
						roundRobots.push(ma.winner)
					})
				} else {
					// Determine number of byes of first round
					byes = Math.pow(2, Math.ceil(Math.log2(robots.length))) - robots.length;
					// If 0 byes, proceed with a beautiful normal bracket
					// If some byes, use first round to normalize bracket
					roundRobots = shuffle(robots);
					for (let index = 0; index < byes; index++) {
						byeBot = {
							_id : "bye" + index,
							bye : true,
							name: "bye" + index
						}
						roundRobots.splice((index*2)+1, 0, byeBot);
					}
				}
				for (let index = 1; index < roundRobots.length; index+=2) {
					match = {
						robotA: roundRobots[index-1],
						robotB: roundRobots[index],
						winner: undefined,
						resultA: 0,
						resultB: 0,
						bracket: "W",
						isDraw : false
					}
					if (roundRobots[index].bye){
						match.winner = match.robotA;
						match.resultA = 2;
						match.robotB = undefined;
					}
					if (roundRobots[index-1].bye){
						match.winner = match.robotB;
						match.resultB = 2;
						match.robotA = undefined;
					}
					newRound.matches.push(match);
				}
			}
		}
		if (tourney.system == 'elim-double'){
			// Check special case bracket reset
			// This also accounts for loser matches
			winnersFinalRound = Math.ceil(Math.log2(robots.length));
			// Super final
			if (tourney.rounds.length == Math.ceil(Math.log2(robots.length)+2)){
				final = tourney.rounds[winnersFinalRound-1].matches.filter(ma => ma.bracket == "W")[0];
				finalWinner = final.winner;
				lastRound = tourney.rounds[tourney.rounds.length-1];
				loserWinner = lastRound.matches[0].winner;

				match = {
					robotA: finalWinner,
					robotB: loserWinner,
					winner: undefined,
					resultA: 0,
					resultB: 0,
					bracket: "W",
					isDraw : false
				}

				newRound.matches.push(match);
			}
			if (tourney.rounds.length == Math.ceil(Math.log2(robots.length)+3)){
				final = tourney.rounds[winnersFinalRound-1].matches.filter(ma => ma.bracket == "W")[0];
				finalWinner = final.winner;
				lastRound = tourney.rounds[tourney.rounds.length-1];
				lastWinner = lastRound.matches[0].winner;

				if (finalWinner._id != lastWinner._id){
					match = {
						robotA: lastWinner,
						robotB: finalWinner,
						winner: undefined,
						resultA: 0,
						resultB: 0,
						bracket: "W",
						isDraw: false
					}
					newRound.matches.push(match);
				}
			}
			if (tourney.rounds.length < Math.ceil(Math.log2(robots.length)+2)){
				if (tourney.rounds.length == 0){
					// First round we even the bracket with byes
					byes = Math.pow(2, Math.ceil(Math.log2(robots.length))) - robots.length;
					roundRobots = shuffle(robots);
					for (let index = 0; index < byes; index++) {
						byeBot = {
							_id : "bye" + index,
							bye : true,
							name: "bye" + index
						}
						roundRobots.splice((index*2)+1, 0, byeBot);
					}
					for (let index = 1; index < roundRobots.length; index+=2) {
						match = {
							robotA: roundRobots[index-1],
							robotB: roundRobots[index],
							winner: undefined,
							resultA: 0,
							resultB: 0,
							bracket: "W",
							isDraw: false
						}
						if (roundRobots[index].bye){
							match.winner = match.robotA;
							match.resultA = 2;
							match.robotB = undefined;
						}
						if (roundRobots[index-1].bye){
							match.winner = match.robotB;
							match.resultB = 2;
							match.robotA = undefined;
						}
						newRound.matches.push(match);
					}
				} else {
					// Second round on, we have winners and losers
					previousRound = tourney.rounds[tourney.rounds.length-1]
					winnerMatches = previousRound.matches.filter(ma => ma.bracket == "W");
					loserMatches = previousRound.matches.filter(ma => ma.bracket == "L");
					contWinners = [];
					newLosers = [];
					contLosers = [];
					byeIdx = 0;
					winnerMatches.forEach(ma => {
						byeIdx += 1;
						contWinners.push(ma.winner);
						if (ma.winner._id != ma.robotA._id){
							loser = ma.robotA;
						} else {
							loser = ma.robotB;
						}
						if (loser == undefined){
							loser = {
								_id : "bye" + byeIdx,
								bye : true,
								name: "bye" + byeIdx
							}
						}
						newLosers.push(loser);
					});
					loserMatches.forEach(ma => {
						contLosers.push(ma.winner);
					});

					if ((tourney.rounds.length+1)%2 == 1) {
						newLosers.reverse();
					}

					for (let index = 1; index < contWinners.length; index+=2) {
						match = {
							robotA: contWinners[index-1],
							robotB: contWinners[index],
							winner: undefined,
							resultA: 0,
							resultB: 0,
							bracket: "W",
							isDraw : false
						}
						newRound.matches.push(match);
					}

					if (winnersFinalRound + 1 != tourney.rounds.length+1){
						for (let index = 0; index < newLosers.length; index++) {
							newLoser = newLosers[index];
							contLosers.splice((index*2)+1, 0, newLoser);
						}
					} else {
						for (let index = 0; index < newLosers.length; index++) {
							newLoser = newLosers[index];
							contLosers.splice((index*2)+2, 0, newLoser);
						}
					}
					
					for (let index = 1; index < contLosers.length; index+=2) {
						match = {
							robotA: contLosers[index-1],
							robotB: contLosers[index],
							winner: undefined,
							resultA: 0,
							resultB: 0,
							bracket: "L",
							isDraw : false
						}
						if (contLosers[index-1].bye){
							match.robotA = undefined;
							winner = contLosers[index];
							resultB = 2;
						}
						if (contLosers[index].bye){
							match.robotB = undefined;
							winner = contLosers[index-1];
							resultA = 2;
						}
						if (!contLosers[index-1].bye || !contLosers[index].bye){
							newRound.matches.push(match);
						}
					}

					if (contLosers.length % 2 == 1){
						match = {
							robotA: contLosers[contLosers.length-1],
							robotB: undefined,
							winner: contLosers[contLosers.length-1],
							resultA: 2,
							resultB: 0,
							bracket: "L",
							isDraw : false
						}
						newRound.matches.push(match);
					}
				}
			}
		}
		tourney.rounds.push(newRound);
		Tourney.updateRounds(tourney._id, tourney.rounds)
		.then(function(ret){
			if(!ret.data.success){
				alert("Error adding rounds to tourney. " + ret.data.message);
			}
			$scope.refreshEverything();
		});
	}

	trn.deleteTourney = function(tourneyID, robots){
        if(tourneyID != "" && robots != []){
			robots.forEach(rob => {
				scores = rob.scores.filter(score => score.tourney != tourneyID);
				Robot.updateScores(rob._id, scores);
			});
			Tourney.delete(tourneyID)
				.then(function(ret){
					$scope.refreshEverything();
				})
		}
	}
});

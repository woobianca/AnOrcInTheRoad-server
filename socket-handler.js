var db = require('./db/db-controller');

var socketHandler = function(socket, io) {

  socket.on('super', function(data) {
  	//this is for testing
		io.emit('super', { message: 'Got it' })
	});

	socket.on('create quest', function(quest) {
		db.addQuest(quest).then(function(allQuests) { 
			io.emit('update quests', allQuests);
		})
	});

	socket.on('create character', function(character) {
		db.createCharacter(character).then(function() {
			db.getCharacter(character.characterId).then(function(newCharacter) {
				socket.emit('update character', newCharacter);
			});
		});
	});

	socket.on('get quests', function(characterId) {
		db.getAllQuests(characterId).then(function(allQuests) {
			socket.emit('update quests', allQuests);
		});
	});

	socket.on('get character', function(id) {
		db.getCharacter(id).then(function(character) {
			socket.emit('update character', character);
		});
	});

	socket.on('complete quest', function(characterId, questId) {
		db.completeQuest(characterId, questId).then(function() {
			db.getQuest(questId).then(function(quest) {
				db.getCharacter(characterId).then(function(character) {
					character.experience = character.experience + quest.experience;
					if (character.experience >= 100) {
						character.level = character.level + 1;
						character.experience = character.experience - 100;
						db.updateCharacter(character).then(function() {
							db.getAllQuests().then(function(allQuests) {
								db.getCharacter(character.id).then(function(updatedCharacter) {
									socket.emit('update character', updatedCharacter);
									io.emit('update quests', allQuests);
								});
							});
						});
					} else {
						db.updateCharacter(character).then(function() {
							db.getAllQuests().then(function(allQuests) {
								db.getCharacter(character.id).then(function(updatedCharacter) {
									socket.emit('update character', updatedCharacter);
									io.emit('update quests', allQuests);
								});
							});
						});
					}
				});
			});
		});
	});

	socket.on('activate quest', function(characterId, questId) {
		db.activateQuest(characterId, questId).then(function() {
			db.getAllQuests(characterId).then(function(allQuests) {
				socket.emit('update quests', allQuests);
			});
		});
	});

	socket.on('deactivate quest', function() {
		db.deactivateQuest(characterId, questId).then(function() {
			db.getAllQuests(characterId).then(function(allQuests) {
				socket.emit('update quests', allQuests);
			});
		});
	});
}

module.exports = socketHandler
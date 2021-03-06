var Promise = require('bluebird');
var mysql = require('mysql');
var redis = require('redis');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
var redisClient = redis.createClient();

var connection = mysql.createConnection({
  host: "localhost",
  database: "Orc",
  user: "root",
  password: ""
});

connection = Promise.promisifyAll(connection);

connection.connect();

var addQuest = function(quest) {
	var that = this;
	return new Promise((resolve, reject) => {
		return that[quest.type](quest).then(resolve);
	});
} 

var addFetchQuest = function(quest) {
	return new Promise(function(resolve, reject) {
		var bufferQuest = { name: quest.name, creator_id: quest.creator_id, experience: quest.experience, lat: quest.lat, lng: quest.lng}
		return connection.queryAsync('INSERT INTO Quests SET ?', bufferQuest).then(function(result) {
			return getAllQuests().then(resolve)
		});
	});
}

var getAllQuests = function() {
	return new Promise(function(resolve, reject) {
		return connection.queryAsync('SELECT * FROM Quests').then(function(result) {
			return resolve(result);
		});
	});
}

var getCharacter = function(id) {
	return new Promise(function(resolve, reject) {
		return connection.queryAsync('SELECT * FROM Characters WHERE id = ' + id).then(function(result) {
			return resolve(result);
		}); 
	});
}

var completeQuest = function(userId, questId) {
	return new Promise(function(resolve, reject) {
		return connection.queryAsync('UPDATE Quests SET complete = ' + userId + ' WHERE id = ' + questId);
	});
}



exports.addFetchQuest = addFetchQuest;
exports.addQuest = addQuest;
exports.getAllQuests = getAllQuests;
exports.getCharacter = getCharacter;
exports.completeQuest = completeQuest;
'use strict';

var _ = require('lodash');
var Note = require('./note.model');
var config = require('../../config/environment');
var q = require('q');
var csv = require('fast-csv');

function loadNotes(csvPath) {
  var defer = q.defer();
  var notes = [];
  csv
    .fromPath(csvPath)
    .on("data", function(data){
      var note = new Note(data[0], data[1]);
      note.extractZip();
      notes.push(note);
    })
    .on("end", function(){
      defer.resolve(notes);
    });

  return defer.promise;
}

var cachedNotes = undefined;
var notes = [];

loadNotes(config.csv).then(function(ns) {
  if (!cachedNotes) {
    cachedNotes = {};
    ns.forEach(function(note) {
      cachedNotes[note.fileDescriptor] = note;
    });
  }
  notes = ns;
});
// Get list of notes
exports.index = function(req, res) {
  loadNotes(config.csv).then(function(ns) {
    if (!cachedNotes) {
      cachedNotes = {};
      ns.forEach(function(note) {
        cachedNotes[note.fileDescriptor] = note;
      });
    }
    notes = ns;
    return res.json(200, notes);
  });
};

// Get a single thing
exports.show = function(req, res) {
  if (!cachedNotes) {
    cachedNotes = {};
    notes.forEach(function(note) {
      cachedNotes[note.fileDescriptor] = note;
    });
  }
  var note = cachedNotes[req.params.id];
  note.extractTitleAndImg().then(function(fNote) {
    return res.json(200, fNote);
  })
};

function handleError(res, err) {
  return res.send(500, err);
}

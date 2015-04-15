'use strict';

var _ = require('lodash');
var Note = require('./note.model');
var config = require('../../config/environment');
var q = require('q');
var csv = require('fast-csv');
var fs = require('fs');


function loadNotes(csvPath) {
  var defer = q.defer();
  var notes = [];
  csv
    .fromPath(csvPath)
    .on("data", function (data) {
      var note = {
        fileDescriptor : data[0],
        title : data[1]
      };
      notes.push(note);
    })
    .on("end", function () {
      defer.resolve(notes);
    });

  return defer.promise;
}

var cachedNotes = undefined;
var notes = [];

loadNotes(config.csv).then(function (ns) {
  if (!cachedNotes) {
    cachedNotes = {};
    ns.forEach(function (note) {
      cachedNotes[note.fileDescriptor] = note;
    });
  }
  notes = ns;
});
// Get list of notes
exports.index = function (req, res) {
  loadNotes(config.csv).then(function (ns) {
    if (!cachedNotes) {
      cachedNotes = {};
      ns.forEach(function (note) {
        cachedNotes[note.fileDescriptor] = note;
      });
    }
    notes = ns;
    return res.json(200, notes);
  });
};

// Get a single thing
exports.show = function (req, res) {
  if (!cachedNotes) {
    cachedNotes = {};
    notes.forEach(function (note) {
      cachedNotes[note.fileDescriptor] = note;
    });
  }
  var note = new Note(cachedNotes[req.params.id].fileDescriptor, cachedNotes[req.params.id].title);
  note.extractTitleAndImg().then(function (fNote) {
    return res.json(200, fNote);
  })
};

function handleError(res, err) {
  return res.send(500, err);
}

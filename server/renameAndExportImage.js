/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';



var _ = require('lodash');
var Note = require('./api/note/note.model');
var config = require('./config/environment');
var q = require('q');
var csv = require('fast-csv');
var path = require('path');
var fs = require('fs');
var async = require('async');


function loadNotes(csvPath) {
  var defer = q.defer();
  var notes = [];
  csv
    .fromPath(csvPath)
    .on("data", function (data) {
      var note = new Note(data[0], data[1]);
      note.extractZip();
      notes.push(note);
    })
    .on("end", function () {
      defer.resolve(notes);
    });

  return defer.promise;
}

loadNotes(config.csv).then(function(notes) {
  var imgCount = 0;
  async.eachSeries(notes, function (note, cb) {
    note.extractTitleAndImg().then(function (fNote) {
      var date1 = fNote.date;
      async.eachSeries(fNote.images, function (img, icb) {
          imgCount++;
          fs.renameSync(img, path.join(config.outBase, '' + date1.getFullYear() + '-' + (date1.getMonth() + 1) + '-' + date1.getDate() + ' ' + fNote.text));
          icb();
        },
        function (err) {
          HandleError(err);
          console.log('there are ' + imgCount + 'images');
          cb();
        }
      );
    })
  }, function (err) {
    HandleError(err);
    console.log('done');
  });
});

function HandleError(err) {
  if (err) {
    console.log(err);
    throw err;
  }
}


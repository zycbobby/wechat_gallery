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



var writeStream = fs.createWriteStream('someText.txt', {flags : 'w'});
writeStream.on('open', function(){
  loadNotes(config.csv).then(function(notes){
    async.eachSeries(notes, function(note, cb) {
      note.extractTitleAndImg().then(function(fNote) {
        console.log(fNote.date + ' : ' + fNote.text);
        var date1 = fNote.date;
        writeStream.write(date1.getFullYear() + '-' + (date1.getMonth() + 1) + '-' + date1.getDate() + '\n');
        writeStream.write(fNote.text + '\n');
        cb();
      })
    }, function(err) {
      writeStream.end(function() {
        console.log('end called');
      });
      if (err) {
        console.log(err);
        throw err;
      }
      console.log('done');
    });

  });

});


//writeStream.on('open', function(){
//  writeStream.write('a', function(){
//    writeStream.end(function() {
//      console.log('called');
//      writeStream.end();
//    });
//  });
//});

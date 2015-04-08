'use strict';

angular.module('wechatGalleryClientApp')
  .controller('MainCtrl', function ($scope, $http, pdfService) {
    $scope.awesomeThings = [];



    $http.get('/api/notes').success(function(notes) {
      // pdfService.makePdf(null);
      $scope.notes = notes;
      //$scope.async.eachLimit(notes, 8, function(note, cb) {
      //  $http.get('/api/notes/' + note.fileDescriptor).success(function(fNote) {
      //    var doc = new $scope.jsPDF('landscape');
      //    pdfService.makePdf(doc, fNote);
      //    doc.save(note.fileDescriptor + '.pdf');
      //    cb();
      //  })
      //}, function(err) {
      //  if (err) {
      //    console.log(err);
      //  }
      //});
    });

    $scope.downloadPdf = function(note) {
      $http.get('/api/notes/' + note.fileDescriptor).success(function (fNote) {
        var doc = new $scope.jsPDF('landscape');
        pdfService.makePdf(doc, fNote);
        doc.save(note.fileDescriptor + '.pdf');
      });
    }
  });

'use strict';

angular.module('wechatGalleryClientApp')
  .controller('MainCtrl', function ($scope, $http, pdfService) {
    $scope.awesomeThings = [];



    $http.get('/api/notes').success(function(notes) {
      // pdfService.makePdf(null);
      $scope.notes = notes;

      var images = [];
      var count = 0;

      $scope.async.each(notes, function(note, cb) {
        var doc = new $scope.jsPDF('landscape');
        $http.get('/api/notes/' + note.fileDescriptor).success(function(fNote) {
          fNote.imagesData.forEach(function(imageData) {
            images.push({
              data : imageData.data,
              title : fNote.title,
              date : fNote.date
            });
            if (images.length === 4) {
              pdfService.makePdfFrom4Images(doc, images);
              doc.save(count + '.pdf');
              count++;
              images = [];
              doc = new $scope.jsPDF('landscape');
            }
          });

          cb();
        })
      }, function(err) {
        if (err) {
          console.log(err);
        }
      });
    });

    $scope.downloadPdf = function(note) {
      $http.get('/api/notes/' + note.fileDescriptor).success(function (fNote) {
        var doc = new $scope.jsPDF('landscape');
        pdfService.makePdf(doc, fNote);
        doc.save(note.fileDescriptor + '.pdf');
      });
    }
  });

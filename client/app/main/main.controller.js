'use strict';

angular.module('wechatGalleryClientApp')
  .controller('MainCtrl', function ($scope, $http, pdfService) {
    $scope.awesomeThings = [];

    $http.get('/api/notes').success(function(notes) {
      // pdfService.makePdf(null);
      $scope.notes = notes;
    });


    $scope.images = [];

    $scope.downloadAll = function() {

      var count = 0;
      var doc = new $scope.jsPDF('landscape');
      var descriptionImageMap = {};

      $scope.async.each($scope.notes, function(note, cb) {

        $http.get('/api/notes/' + note.fileDescriptor).success(function(fNote) {
          descriptionImageMap[fNote.fileDescriptor] = descriptionImageMap[fNote.fileDescriptor] || fNote.descriptionImage;
          fNote.imagesData.forEach(function(imageData) {
            $scope.images.push({
              data : imageData.data,
              title : fNote.title,
              date : fNote.date,
              noteId : fNote.fileDescriptor
            });
          });
          cb();
        })
      }, function(err) {

        // need one more time for the last one
        pdfService.makePdfFromAllImages(doc, $scope.images, descriptionImageMap);
        doc.save('test.pdf');
        if (err) {
          console.log(err);
        }
      });
    };
  });

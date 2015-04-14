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

      var descriptionImageMap = {};

      $scope.async.eachLimit($scope.notes, 10, function(note, cb) {
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
        var i,j,temparray,chunk = 64;

        for (i=0,j=$scope.images.length; i<j; i+=chunk) {
          temparray = $scope.images.slice(i,i+chunk);

          var doc = new $scope.jsPDF('landscape');
          pdfService.makePdfFromAllImages(doc, temparray, descriptionImageMap);
          doc.save( '' + i + '-' + (i+chunk) + '.pdf');
        }


        if (err) {
          console.log(err);
        }
      });
    };
  });

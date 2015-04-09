'use strict';

angular.module('wechatGalleryClientApp')
  .controller('MainCtrl', function ($scope, $http, pdfService) {
    $scope.awesomeThings = [];

    $http.get('/api/notes').success(function(notes) {
      // pdfService.makePdf(null);
      $scope.notes = notes;
    });

    $scope.downloadAll = function() {
      var images = [];
      var count = 0;

      $scope.async.each($scope.notes, function(note, cb) {
        var doc = new $scope.jsPDF('landscape');
        $http.get('/api/notes/' + note.fileDescriptor).success(function(fNote) {
          fNote.imagesData.forEach(function(imageData) {
            images.push({
              data : imageData.data,
              title : fNote.title,
              date : fNote.date,
              text: fNote.text
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
    };

    $scope.downloadPdf = function(note) {

      var a4Width = 297;
      var a4Height = 210;



      //$scope.pdfMake.fonts = {
      //  song : {
      //    normal: '',
      //    bold: '/assets/font/zy.ttf',
      //    italics: '/assets/font/zy.ttf',
      //    bolditalics: '/assets/font/zy.ttf'
      //  }
      //};

      var docDefinition = {
        pageSize: 'A4',
        // by default we use portrait, you can change it to landscape if you wish
        pageOrientation: 'landscape',
        content: [],
        pageMargins: [ 0,0,0,0 ]
      };


      $http.get('/api/notes/' + note.fileDescriptor).success(function (fNote) {

        fNote.imagesData.forEach(function(imgData) {
          docDefinition.content.push({
            image: imgData.data,
            width: 400
          });
          docDefinition.content.push({
            text : fNote.text
          });
        });
        $scope.pdfMake.createPdf(docDefinition).download();
      });
    };
  });

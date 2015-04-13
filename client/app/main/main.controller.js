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
      var doc = new $scope.jsPDF('landscape');

      $scope.async.each($scope.notes, function(note, cb) {

        $http.get('/api/notes/' + note.fileDescriptor).success(function(fNote) {
          fNote.imagesData.forEach(function(imageData) {
            images.push({
              data : imageData.data,
              title : fNote.title,
              date : fNote.date,
              text: fNote.text
            });
          });
          cb();
        })
      }, function(err) {

        // need one more time for the last one
        pdfService.makePdfFromAllImages(doc, images);
        doc.save('test.pdf');
        if (err) {
          console.log(err);
        }
      });
    };

    $scope.downloadPdf = function(note) {

      var a4Width = 297;
      var a4Height = 210;



      $scope.pdfMake.fonts = {
        song : {
          normal: 'Ubuntu-Regular.ttf',
          bold: 'Ubuntu-Regular.ttf',
          italics: 'Ubuntu-Regular.ttf',
          bolditalics: 'Ubuntu-Regular.ttf'
        }
      };

      var docDefinition = {
        pageSize: 'A4',
        // by default we use portrait, you can change it to landscape if you wish
        pageOrientation: 'landscape',
        content: [{
          columns : [],
          columnGap: 0
        }],
        pageMargins: [ 0,0,0,0 ],
        defaultStyle: {
          font: 'song'
        }
      };


      $http.get('/api/notes/' + note.fileDescriptor).success(function (fNote) {

        fNote.imagesData.forEach(function(imgData) {
          docDefinition.content[0].columns.push({
            text : fNote.text,
            width : '*'
          });
          //docDefinition.content.push({
          //  text : fNote.text,
          //  fontSize : 15
          //});
        });
        $scope.pdfMake.createPdf(docDefinition).download();
      });
    };
  });

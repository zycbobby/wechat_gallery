'use strict';

angular.module('wechatGalleryClientApp')
  .service('pdfService', function ($window ) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var a4Width = 297;
    var a4Height = 210;

    this.getPositionAndSize = function(imageData, maxWidth, maxHeight) {
      var wScale = maxWidth/imageData.width;
      var hScale = maxHeight/imageData.height;

      if (wScale > hScale) {
        // scale in the height orientation
        var scale = hScale;
        var totalPadding = maxWidth - imageData.width * scale;
        return {

        }
      }

      var length = imagesData.length;
      switch (length) {
        case 1:
          doc.addImage(note.imagesData[0].data, 'JPEG', 0, 0, a4Width, a4Height );
          break;
      }
    };

    this.makePdf = function (doc, note) {

      // var img = note.images.length;
      console.log(note);
      note.imagesData.forEach(function(imgData) {
        doc.addImage(imgData.data, 'JPEG', 0, 0, a4Width, a4Height );
        doc.addPage();
      });
      return doc;
    };

    this.makePdfFrom4Images = function (doc, images) {

      doc.addImage(images[0].data, 'JPEG', 0, 0, a4Width/2, a4Height/2 );
      doc.addImage(images[1].data, 'JPEG', a4Width/2, 0, a4Width/2, a4Height/2 );
      doc.addImage(images[2].data, 'JPEG', 0, a4Height/2, a4Width/2, a4Height/2 );
      doc.addImage(images[3].data, 'JPEG', a4Width/2, a4Height/2, a4Width/2, a4Height/2 );
      doc.line(0, a4Height/2, a4Width, a4Height/2);
      doc.line(a4Width/2, 0, a4Width/2, a4Height);
      doc.addPage();
      return doc;
    }
  }
)
;

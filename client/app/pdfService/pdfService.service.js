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
      //switch (img) {
      //  case 1:
      //
      //    break;
      //  case 2:
      //
      //    break;
      //  case 3:
      //
      //    break;
      //  case 4:
      //
      //    break;
      //  case 5:
      //
      //    break;
      //  case 6:
      //
      //    break;
      //  case 7:
      //
      //    break;
      //  case 8:
      //
      //    break;
      //  case 9:
      //
      //    break;
      //}
      //doc.setFontSize(40);
      //doc.setDrawColor(0);
      //doc.setFillColor(238, 238, 238);
      //doc.rect(0, 0, 595.28,  841.89, 'F');
      //doc.text(35, 100, "Paranyan loves jsPDF");

      //doc.save( 'a.pdf')

      return doc;
    }
  }
)
;

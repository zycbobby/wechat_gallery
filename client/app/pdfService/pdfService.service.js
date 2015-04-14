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

    this.makePdfFromAllImages = function (doc, images, descriptionImageMap) {
      var recent4= [];

      images.forEach(function(image, idx){
        doc.addImage(image.data, 'JPEG', idx%2===1?a4Width/2:0,  idx%4 > 1?a4Height/2:0, a4Width/2, a4Height/2 );
        recent4.push(image);

        if (idx%4 === 3 || idx === images.length - 1) {
          doc.line(0, a4Height/2, a4Width, a4Height/2);
          doc.line(a4Width/2, 0, a4Width/2, a4Height);
          doc.addPage();

          if (recent4.length > 0) {
            doc.addImage(descriptionImageMap[recent4[0].noteId], 'JPEG', a4Width/2,  0 , a4Width/2, a4Height/2 );
            // doc.text(5 + a4Width / 2, 10, date0.getFullYear() + '-' + (date0.getMonth() + 1) + '-' + date0.getDate());
          }
          if (recent4.length > 1) {
            doc.addImage(descriptionImageMap[recent4[1].noteId], 'JPEG', 0        ,  0 , a4Width/2, a4Height/2 );
          }
          if (recent4.length > 2) {
            doc.addImage(descriptionImageMap[recent4[2].noteId], 'JPEG', a4Width/2,  a4Height/2 , a4Width/2, a4Height/2 );
          }

          if (recent4.length > 3) {
            doc.addImage(descriptionImageMap[recent4[3].noteId], 'JPEG', 0        ,  a4Height/2 , a4Width/2, a4Height/2 );
          }

          doc.line(0, a4Height/2, a4Width, a4Height/2);
          doc.line(a4Width/2, 0, a4Width/2, a4Height);

          recent4 = [];
          if (idx !== images.length - 1) {
            doc.addPage();
          }
        }
      });

      return doc;
    };

    this.makePdfFrom4Images = function (doc, images) {

      doc.addImage(images[0].data, 'JPEG', 0, 0, a4Width/2, a4Height/2 );
      if (images.length > 1 ) {
        doc.addImage(images[1].data, 'JPEG', a4Width/2, 0, a4Width/2, a4Height/2 );
      }

      if (images.length > 2 ) {
        doc.addImage(images[2].data, 'JPEG', 0, a4Height/2, a4Width/2, a4Height/2 );
      }

      if (images.length > 3 ) {
        doc.addImage(images[3].data, 'JPEG', a4Width/2, a4Height/2, a4Width/2, a4Height/2 );
      }

      doc.line(0, a4Height/2, a4Width, a4Height/2);
      doc.line(a4Width/2, 0, a4Width/2, a4Height);

      doc.addPage();

      var fontHeight = 4;
      var dateLength = 50;


      //doc.setFont("courier");
      //doc.setFontType("bold");
      doc.setTextColor(100);

      var date0 = new Date(images[0].date);
      doc.text( 5 + a4Width/2 , 5, date0.getFullYear() + '-' + (date0.getMonth()+1) + '-' + date0.getDate());
      //doc.text( 5 + a4Width/2 , 5 + fontHeight, images[0].text);

      var date1 = new Date(images[1].date);
      doc.text( 5, 5, date1.getFullYear() + '-' + (date1.getMonth() + 1) + '-' + date1.getDate());
      // doc.text( 5 , 5 + fontHeight, images[1].text);

      var date2 = new Date(images[2].date);
      doc.text( a4Width/2 + 5 , a4Height/2 + 5, date2.getFullYear() + '-' + (date2.getMonth() + 1) + '-' + date2.getDate());
      // doc.text( a4Width/2 + 5 , a4Height/2 + 5 + fontHeight, images[2].text);

      var date3 = new Date(images[3].date);
      doc.text( 5, a4Height/2 + 5, date3.getFullYear() + '-' + (date3.getMonth() + 1) + '-' + date3.getDate());
      // doc.text( 5, a4Height/2 + 5 + fontHeight, images[3].text);

      return doc;
    }
  }
)
;

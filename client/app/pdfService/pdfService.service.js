'use strict';

angular.module('wechatGalleryClientApp')
  .service('pdfService', function ($window) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var a4Width = 297;
    var a4Height = 210;

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

    this.makePdfOneByOneImages = function (doc, fNote) {
      fNote.imagesData.forEach(function(image, idx){
        doc.addImage(image.data, 'JPEG', 0, 0, a4Width, a4Height);
        doc.addPage();
        doc.addImage(fNote.descriptionImage, 'JPEG', 0 , 0 , a4Width, a4Height);
        if (idx !== fNote.imagesData.length - 1) {
          doc.addPage();
        }
      });

      return doc;
    };

  }
)
;

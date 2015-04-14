'use strict';

'use strict';

var config = require('../../config/environment');
var path = require('path');
var zip = require('adm-zip');
var cheerio = require('cheerio');
var fs = require('fs');
var Q = require('q');
var async = require('async');
var http = require('http');
var getPixels = require("get-pixels");
var lwip = require("lwip");
var Canvas = require('canvas')
  , Image = Canvas.Image;

function Note(noteGuid, title) {
  this.fileDescriptor = noteGuid;
  this.file = path.join(config.noteBase, '{' + this.fileDescriptor + '}');
  this.date = new Date(title);
  this.title = title;
}

var a4Width = 2970/2 ;
var a4Height = 2100/2 ;

var lineHeight = 80;

var paddingTop = 50;
var paddingLeft = 50;

Note.prototype.extractZip = function () {
  var zipFile = new zip(this.file);
  this.targetPath = path.join(config.tmpBase, this.fileDescriptor);
  zipFile.extractAllTo(this.targetPath, true);
  return this.targetPath;
};

Note.prototype.extractTitleAndImg = function () {
  var defer = Q.defer();
  this.targetPath = path.join(config.tmpBase, this.fileDescriptor);
  var targetPath = this.targetPath;
  var self = this;
  fs.readFile(path.join(targetPath, 'index.html'), function (err, data) {
    if (err) {
      throw err;
    }
    try {
      var $ = cheerio.load(data);

      var $div = $('span');
      //if (targetPath.indexOf('4e1f1272-7f05-4391-a401-8abcf675715d') >= 0) {
      //  console.log('...');
      //}
      self.text = '';
      for(var  i = 0; i< $div.length; i++) {
        var text = $($div[i]).text();
        if (text.length > 0 && text.indexOf('201') !== 0) {
           self.text += text;
        }
      }

      var images = $('img');
      self.images = [];
      self.imagesData = [];
      for (var i = 0; i < images.length; i++) {
        // https://note.wiz.cn/api/document/files/unzip/4d488bda-6f6b-11e1-b565-00237def97cc/454c777b-11f5-4481-bed5-2bb0e02d8e5f.5767/index_files/cc30377b-139d-4cab-90cd-c6e7d82bfd4f.jpg
        var imgPath = path.join(targetPath, images[i].attribs.src);
        self.images.push(imgPath);
      }

      async.each(self.images, function (image, cb) {
        var imgData = {};
        lwip.open(image, function (err, image) {
          var batch = image.batch();
          console.log('width : ' + image.width() + ' height : ' + image.height());

          if (image.height() > image.width() + 20) {
            batch = batch.rotate(90);
            var newWidth = image.height();
            var newHeight = image.width();
          } else {
            var newWidth = image.width();
            var newHeight = image.height();
          }
          if (a4Height / newHeight > a4Width / newWidth) {
            // scale horizontally
            batch = batch.resize(a4Width);
            console.log('resize : ' + a4Width / newWidth);
            // padding vertically
            var totalVerticalPadding = a4Height - newHeight * a4Width / newWidth;
            batch = batch.pad(0, totalVerticalPadding / 2, 0, totalVerticalPadding / 2, 'white');
          } else {
            // scale vertically
            batch = batch.scale(a4Height / newHeight, a4Height / newHeight);
            console.log('scale : ' + a4Height / newHeight);

            // padding horizontally
            var totalHorizontalPadding = a4Width - newWidth * a4Height / newHeight;
            batch = batch.pad(totalHorizontalPadding / 2, 0, totalHorizontalPadding / 2, 0, 'white');
          }

          batch.toBuffer('jpg', function (err, buffer) {
            imgData.data = 'data:image/jpeg;base64,' + buffer.toString('base64');
            imgData.width = a4Width;
            imgData.height = a4Height;
            self.imagesData.push(imgData);
            cb();
          });
        })
      }, function (err) {
        if (err) {
          console.log(err);
          throw err;
        }

        var canvas = new Canvas(a4Width,a4Height);
        var ctx = canvas.getContext('2d');
        ctx.font = '30pt simsun';
        ctx.fillText(self.title, paddingLeft, paddingTop);
        if (self.text.length > 0 ) {
          ctx.fillText(self.text.match(/.{1,30}/g).join('\n'), paddingLeft, paddingTop + lineHeight);
        }

        // converting png to jpeg
        lwip.open(canvas.toBuffer(), 'png', function(err, image) {
          lwip.create(image.width(), image.height(), 'white', function(err, canvas){
            // paste original image on top of the canvas
            canvas.paste(0, 0, image, function(err, image){
              // now image has a white background...
              var batch = image.batch();
              batch.toBuffer('jpg', function (err, buffer) {
                self.descriptionImage = 'data:image/jpeg;base64,' + buffer.toString('base64');
                defer.resolve(self);
              });
            });
          });
        });

      });

    }
    catch (e) {
      console.log(e);
      throw e;
    }
  });
  return defer.promise;
};

Note.prototype.extractTitleAndImg_Stable = function () {
  var defer = Q.defer();
  var targetPath = this.extractZip();
  var self = this;
  fs.readFile(path.join(targetPath, 'index.html'), function (err, data) {
    if (err) {
      throw err;
    }
    try {
      var $ = cheerio.load(data);

      self.text = $('div > span').first().text();
      var images = $('img');
      self.images = [];
      self.imagesData = [];
      for (var i = 0; i < images.length; i++) {
        // https://note.wiz.cn/api/document/files/unzip/4d488bda-6f6b-11e1-b565-00237def97cc/454c777b-11f5-4481-bed5-2bb0e02d8e5f.5767/index_files/cc30377b-139d-4cab-90cd-c6e7d82bfd4f.jpg
        var imgPath = path.join(targetPath, images[i].attribs.src);
        self.images.push(imgPath);
      }

      var readFileQ = Q.denodeify(fs.readFile);
      var getPixelsQ = Q.denodeify(getPixels);

      async.each(self.images, function (image, cb) {

        var imgData = {};
        readFileQ(image).then(function (data) {
          imgData.data = 'data:image/jpeg;base64,' + data.toString('base64');
        }).then(function () {
          return getPixelsQ(image);
        }).then(function (pixels) {
          imgData.pixels = pixels;
          delete imgData.pixels.data;
          imgData.width = imgData.pixels.shape[0];
          imgData.height = imgData.pixels.shape[1];
        }).done(function () {
          self.imagesData.push(imgData);
          cb();
        });

      }, function (err) {
        if (err) {
          console.log(err);
          throw err;
        }
        defer.resolve(self);
      });
    }
    catch (e) {
      console.log(e);
      throw e;
    }
  });
  return defer.promise;
};


function getFixRatioImage(maxHeight, maxWidth, originalImage) {
  var defer = Q.defer();
  var isVertical = maxHeight > maxWidth;
  var isHorizontal = !isVertical;

  var imgHeight = originalImage.height();
  var imgWidth = originalImage.width();
  var isImgVertical = imgHeight > imgWidth;

  var batch = originalImage.batch();
  if (isImgVertical !== isVertical) {
    batch = batch.rotate(90);
    var newWidth = originalImage.height();
    var newHeight = originalImage.width();
  } else {
    var newWidth = originalImage.width();
    var newHeight = originalImage.height();
  }

  console.log('width : ' + newWidth + ' height : ' + newHeight);

  if (maxHeight / newHeight > maxWidth / newWidth) {
    // scale horizontally
    batch = batch.resize(maxWidth);

    // padding vertically
    var totalVerticalPadding = maxHeight - newHeight * maxWidth / newWidth;
    batch = batch.pad(0, totalVerticalPadding / 2, 0, totalVerticalPadding / 2, 'white');
    console.log('resize : ' + maxWidth / newWidth + ' pad :' + totalVerticalPadding / 2);

  } else {
    // scale vertically
    batch = batch.scale(maxHeight / newHeight, maxHeight / newHeight);


    // padding horizontally
    var totalHorizontalPadding = maxWidth - newWidth * maxHeight / newHeight;
    batch = batch.pad(totalHorizontalPadding / 2, 0, totalHorizontalPadding / 2, 0, 'white');
    console.log('scale : ' + maxHeight / newHeight+ ' pad :' + totalHorizontalPadding / 2);
  }

  batch.toBuffer('jpg', function (err, buffer) {
    lwip.open(buffer, 'jpg', function (err, image) {
      if (err) {
        console.log(err);
        throw err;
      } else {
        defer.resolve(image)
      }
    });
  });

  return defer.promise;
}

/**
 * return a new note
 * @param images
 */
function createNoteFromLwipWellRatioImages(note, images) {
  var note2 = new Note(note.fileDescriptor, note.title);
  var defer = Q.defer();

  var imageCount = images.length;

  lwip.create(a4Width, a4Height, 'white', function (err, image) {
    var batch = image.batch();

    switch (imageCount) {
      case 1:
        batch = batch.paste(0, 0, images[0]);
        break;
      case 2:
        batch = batch.paste(0, 0, images[0]).paste(a4Width / 2, 0, images[1]);
        break;
      case 3:
        batch = batch.paste(0, 0, images[0]).paste(a4Width / 3, 0, images[1]).paste(2 * a4Width / 3, 0, images[2]);
        break;
      default:
        console.log('not implemented');
    }

    batch.toBuffer('jpg', function (err, buffer) {
      note2.imagesData = [];
      note2.imagesData.push({
        data: 'data:image/jpeg;base64,' + buffer.toString('base64'),
        width: a4Width,
        height: a4Height
      });

      defer.resolve(note2);
    })
  });
  return defer.promise;
}


/**
 * return only one image which was well coordinate
 * @returns {*}
 */
Note.prototype.extractTitleAndImgOne = function () {
  var defer = Q.defer();
  this.targetPath = path.join(config.tmpBase, this.fileDescriptor);
  var targetPath = this.targetPath;
  var self = this;
  fs.readFile(path.join(targetPath, 'index.html'), function (err, data) {
    if (err) {
      throw err;
    }
    try {
      var $ = cheerio.load(data);

      self.text = $('div > span').first().text();
      var images = $('img');
      self.images = [];
      self.imagesData = [];
      for (var i = 0; i < images.length; i++) {
        // https://note.wiz.cn/api/document/files/unzip/4d488bda-6f6b-11e1-b565-00237def97cc/454c777b-11f5-4481-bed5-2bb0e02d8e5f.5767/index_files/cc30377b-139d-4cab-90cd-c6e7d82bfd4f.jpg
        var imgPath = path.join(targetPath, images[i].attribs.src);
        self.images.push(imgPath);
      }

      var lwipImages = [];

      async.each(self.images, function (image, cb) {
        lwip.open(image, function (err, image) {
          lwipImages.push(image);
          cb();
        });
      }, function (err) {
        if (err) {
          console.log(err);
          throw err;
        }

        var imagesCount = lwipImages.length;

        switch (imagesCount) {
          case 1:
            getFixRatioImage(a4Height, a4Width, lwipImages[0]).then(function (wellRatioImage) {
              createNoteFromLwipWellRatioImages(self, [wellRatioImage]).then(function (n) {
                defer.resolve(n);
              })
            });
            break;
          case 2:
            var maxHeight = a4Height;
            var maxWidth = a4Width / 2;
            var ratioImages = [];
            async.each(lwipImages, function (img, cb) {
              getFixRatioImage(maxHeight, maxWidth, img).then(function (wellRatioImage) {
                ratioImages.push(wellRatioImage);
                cb();
              })
            }, function (err) {
              if (err) {
                console.log(err);
                throw err;
              }
              createNoteFromLwipWellRatioImages(self, ratioImages).then(function (n) {
                defer.resolve(n);
              })
            });
            break;
          case 3:
            var maxHeight = a4Height;
            var maxWidth = a4Width / 3;
            var ratioImages = [];
            async.each(lwipImages, function (img, cb) {
              getFixRatioImage(maxHeight, maxWidth, img).then(function (wellRatioImage) {
                ratioImages.push(wellRatioImage);
                cb();
              })
            }, function (err) {
              if (err) {
                console.log(err);
                throw err;
              }
              createNoteFromLwipWellRatioImages(self, ratioImages).then(function (n) {
                defer.resolve(n);
              })
            });
            break;
          default:
            console.log('not supported');
        }

      });


    }
    catch (e) {
      console.log(e);
      throw e;
    }
  });
  return defer.promise;
};

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  var words = text.split(' ');
  var line = '';

  for(var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + ' ';
    var metrics = context.measureText(testLine);
    var testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    }
    else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
}


module.exports = Note;

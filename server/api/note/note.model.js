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

var a4Width = 2970 ;
var a4Height = 2100 ;

var lineHeight = 100;

var paddingTop = 100;
var paddingLeft = 100;

Note.prototype.extractZip = function () {
  var zipFile = new zip(this.file);
  this.targetPath = path.join(config.tmpBase, this.fileDescriptor);
  zipFile.extractAllTo(this.targetPath, true);
  return this.targetPath;
};

Note.prototype.extractTitleAndImg = function () {
  var defer = Q.defer();
  this.targetPath = path.join(config.tmpBase, this.fileDescriptor);

  if (!fs.existsSync(this.targetPath)) {
    this.targetPath = this.extractZip();
  }

  var targetPath = this.targetPath;
  var self = this;
  fs.readFile(path.join(targetPath, 'index.html'), function (err, data) {
    if (err) {
      throw err;
    }
    try {
      var $ = cheerio.load(data);
      var $div = $('span');

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
          ctx.fillText(self.text.match(/.{1,60}/g).join('\n'), paddingLeft, paddingTop + lineHeight);
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

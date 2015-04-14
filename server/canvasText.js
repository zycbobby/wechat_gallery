var Canvas = require('canvas')
  , Image = Canvas.Image
  , canvas = new Canvas(1000,1000)
  , ctx = canvas.getContext('2d');

var fs = require('fs');
var lwip = require("lwip");

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


ctx.font = '20pt simsun';
wrapText(ctx, "中文 嫩  All the world \'s a stage, and all the men and women merely players. They have their exits and their entrances; And one man in his time plays many parts.", 20, 50, 600, 50);

//var out = fs.createWriteStream(__dirname + '/' + new Date() + '.png'),
//  stream = canvas.createPNGStream();
//
//stream.on('data', function(chunk){
//  out.write(chunk);
//});
//
//stream.on('end', function(){
//  console.log('saved png');
//});

canvas.toDataURL('image/png', function(err, str){
  console.log(str);
});

lwip.open(canvas.toBuffer(), 'png', function(err, image) {
  lwip.create(image.width(), image.height(), 'white', function(err, canvas){
    // paste original image on top of the canvas
    canvas.paste(0, 0, image, function(err, image){
      // now image has a white background...
      var batch = image.batch();
      batch.toBuffer('jpg', function (err, buffer) {
        console.log('data:image/jpeg;base64,' + buffer.toString('base64'));
      });
    });
  });
});
//
//canvas.toDataURL('image/png', function(err, str){
//  console.log(str);
//});

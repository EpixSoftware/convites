var express = require('express');
var app = express();
var fs = require('fs');
var crypto = require('crypto');
var pdf = require('pdfkit');
var qr = require('qrcode');
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }));

var form = '<form method="post" action="/convite">'+
'<textarea name="numero" rows="8"></textarea><br>'+
'<input type="submit" value="gerar">'+
'</form>'

function fn(n){
  var patt = new RegExp('[^0-9]');
  var pad = '000';

  if (patt.test(n))
    return null;

  var tmp = parseInt(n);

  if (isNaN(tmp) || tmp <= 0)
    return null;

  n = String(tmp);

  if (n.length > 3)
    return null;
  else if (n.length < 3) 
    return pad.slice(n.length, 3) + n;
  else
    return n;
}

var sendConvite = function(codigo, res) {
  var doc = new pdf({size: 'A4', layout: 'portrait', margin: 0});
  doc.pipe(res);
  var w = 4;
  var w2 = 0;
  var qrcode = function(err, vector, side) {

    for(var i=0; i<vector.length; i++) {
      var row = Math.floor(i / side);
      var col = i % side;

      var x = col*w+359+44;
      var y = row*w+164;

      if (vector[i] == 1) 
        doc.rect(x, y+delta, w, w).fill();

    }
  }

  for(var i=0; i<codigo.length; i++) {
    if (i%3==0 && i>0)
        doc.addPage();

    var delta = (i % 3) * 245+30;

    doc.image('convite.jpeg', 70, 26+delta, {scale: 0.35});
    var w2 = w + delta;
    qr.drawBitArray(codigo[i], qrcode);
    doc.fontSize(22).text(codigo[i].slice(0,3), 20, 210+delta, {align: 'center' });
  } 

  doc.end();
}

app.get('/convite', function (req, res) {
  res.send(form);
});

app.post('/convite', function (req, res) {
  var codigos = [];
  req.body.numero.replace(/\r/g,'').split('\n').forEach(function(el) {
    var num = fn(el);
    if (num==null)
      return res.send('Numero invalido: '+el+'<br><br><small><a href="" onClick="history.go(-1);">voltar</a></small>');
    var sig = crypto.createHash('md5').update(num+'chelonia!').digest("hex").slice(-3);
    console.log(el+' => '+num+'-'+sig);
    codigos.push(num+sig);
  });
  return sendConvite(codigos, res);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

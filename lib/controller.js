var mongoose = require('mongoose');
var srs = require('secure-random-string');
var Caisse = mongoose.model('Caisse');

exports.addCaisse = function(req,res) {
  console.log("controller:addCaisse")
  srs({ length:256 },function(err,sr) {
  var caisse = new Caisse({   
                            cle_keraweb: 	req.body.cle_keraweb , 
                            id_shop:   		req.body.id_shop ,
                            id_cash_drawer: req.body.id_cash_drawer , 
                            mail_magasin: 	req.body.mail_magasin ,
                            url_longue: 	sr ,
                            url_image: 		'image_pub_'+req.body.id_cash_drawer+'.png',
                            url_logo: 		'image_logo_'+req.body.id_shop+'.png',
                            url_css: 		'ticket_'+req.body.id_cash_drawer+'.css' ,
                            actif: true                     
                        })
  

   caisse.save(function (err) {
    if (err) return handleError(err);
    res.json(caisse);
  });
    })
}
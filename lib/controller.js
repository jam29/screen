var mongoose = require('mongoose');
var srs = require('secure-random-string');
var Caisse = mongoose.model('Caisse');

exports.addCaisse = function(req,res) {
  console.log("controller:addCaisse")
  srs({ length:256 },function(err,sr) {
  var caisse = new Caisse({   
                            cle_keraweb: 	req.body.cle_keraweb , 
                            id_magasin:  	req.body.id_magasin ,
                            id_caisse:   	req.body.id_caisse , 
                            mail_magasin: 	req.body.mail_magasin ,
                            url_longue: 	sr ,
                            url_image: 		'image_pub_'+req.body.id_caisse+'.png',
                            url_logo: 		'image_logo_'+req.body.id_magasin+'.png',
                            url_css: 		'ticket_'+req.body.id_caisse+'.css' ,
                            actif: true                     
                        })
  

   caisse.save(function (err) {
    if (err) return handleError(err);
    res.json(caisse);
  });
    })
}
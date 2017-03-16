var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var caisseSchema = new Schema ({
  cle_kerawen:String,
  id_shop:String,
  id_cash_drawer: String,
  mail_magasin: String,
  url_longue: String,
  url_image: String,
  url_logo: String,
  url_css: String,
  actif: Boolean
})

mongoose.model('Caisse', caisseSchema );
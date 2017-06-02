# screen
kerawen afficheur

## enrollement

* Pour créer une ligne dans la base screen; faire un POST de
	* shop (domaine)
	* key (licence kerawen)
	* id_cash_drawer

* pour uploader l'image publicitaire et le logo faire un POST de
	* fichier jpeg
	* nom du fichier (pub_+id_cash_drawer.jpg)
	* id_shop
	* id_caisse

* pour uploader le css 
	* fichier css
	* nom du fichier (pub_+id_cash_drawer.css) ?? 
	* id_shop
	* id_caisse

* Questions
	* Y'a-t-il une pub, logo et css par caisse (ou logo par magasin par exemple)


## reception de tickets

* push d'un json ticket à chaque modification du ticket vers le serveur node. la syntaxe du push est:

	* socket.emit('ticket:url_longue:magasin:caisse', ticket)



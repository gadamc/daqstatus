function(doc,req){
	doc.status = req.form.status;
	return[doc, doc.status
}
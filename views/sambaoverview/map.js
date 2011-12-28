function (doc) {
  if(doc.type == 'daqdocument'){
    emit(doc.Hote, [doc.run_name+'_'+doc.file_number, doc.Date, doc.Heure, doc.Condition]);
  }
}
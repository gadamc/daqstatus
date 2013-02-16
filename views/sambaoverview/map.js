function (doc) {
  if(doc.type == 'daqdocument' && doc.run_name && doc.Hote && doc.file_number && doc.Date && doc.Heure && doc.Condition){
    emit(doc.Hote, [doc.run_name+'_'+doc.file_number, doc.Date, doc.Heure, doc.Condition]);
  }
}
function (doc) {
  if(doc.type == 'daqdocument' && doc.Hote && doc.run_name && doc.file_number){
    emit([doc.Hote, doc.run_name, doc.file_number], 1);
  }
}
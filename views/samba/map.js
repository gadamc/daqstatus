function (doc) {
  if(doc.type == 'daqdocument'){
    emit([doc.Hote, doc.run_name, doc.file_number], 1);
  }
}
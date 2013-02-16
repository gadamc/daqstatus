function (doc) {
  if(doc.type == 'daqdocument' && doc.run_name && doc.file_number){
    emit([doc.run_name, doc.file_number], 1);
  }
}
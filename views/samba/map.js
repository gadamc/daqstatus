function (doc) {
  if(doc.type == 'daqdocument'){
    emit(doc.Hote, 1);
  }
}
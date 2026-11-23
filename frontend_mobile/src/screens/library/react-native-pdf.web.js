import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Platform, View } from 'react-native';

// Configuration nécessaire pour le worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const Pdf = ({ source, style }) => {
  return (
    <View style={style}>
      <Document file={source.uri}>
        <Page pageNumber={1} width={400} />
      </Document>
    </View>
  );
};

export default Pdf;
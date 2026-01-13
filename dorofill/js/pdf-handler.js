/**
 * DoroFill - PDF Handler
 * PDF 생성 및 처리 로직 (pdf-lib 사용)
 */

const PDF_CONFIG = {
    pageWidth: 595.28,
    pageHeight: 841.89,
    margin: 50,
    fontSize: { title: 18, subtitle: 14, body: 11, small: 9 }
};

async function createPDFDocument() {
    if (typeof PDFLib === 'undefined') {
        throw new Error('pdf-lib 라이브러리가 로드되지 않았습니다.');
    }
    return await PDFLib.PDFDocument.create();
}

function addPage(pdfDoc) {
    return pdfDoc.addPage([PDF_CONFIG.pageWidth, PDF_CONFIG.pageHeight]);
}

async function generateReportPDF(data) {
    const pdfDoc = await createPDFDocument();
    const page = addPage(pdfDoc);
    // TODO: Add report content
    return await pdfDoc.save();
}

async function generateStatementPDF(data) {
    const pdfDoc = await createPDFDocument();
    const page = addPage(pdfDoc);
    // TODO: Add statement content
    return await pdfDoc.save();
}

function downloadPDF(pdfBytes, filename) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

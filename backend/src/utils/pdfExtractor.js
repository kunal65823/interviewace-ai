import pdfParse from 'pdf-parse';

/**
 * Extracts plain text from a PDF buffer.
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
export const extractTextFromPDF = async (buffer) => {
  const data = await pdfParse(buffer);
  return data.text.replace(/\s+/g, ' ').trim();
};

// Helper function to tokenize text into words
function tokenize(text) {
    return text.toLowerCase().match(/\b\w+\b/g) || [];
  }
  
  // Calculate term frequency
  function tf(term, document) {
    const terms = tokenize(document);
    return terms.filter(t => t === term).length / terms.length;
  }
  
  // Calculate inverse document frequency
  function idf(term, documents) {
    const numDocsWithTerm = documents.filter(doc => tokenize(doc).includes(term)).length;
    return Math.log(documents.length / (1 + numDocsWithTerm));
  }
  
  // Calculate TF-IDF
  function tfidf(term, document, documents) {
    return tf(term, document) * idf(term, documents);
  }
  
  // Calculate cosine similarity between two vectors
  function cosineSimilarity(vec1, vec2) {
    const dotProduct = Object.keys(vec1).reduce((sum, key) => sum + vec1[key] * (vec2[key] || 0), 0);
    const mag1 = Math.sqrt(Object.values(vec1).reduce((sum, val) => sum + val * val, 0));
    const mag2 = Math.sqrt(Object.values(vec2).reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (mag1 * mag2);
  }
  
  export async function findMostRelevantText(fullText, query, maxLength = 2000) {
    // Split the full text into paragraphs
    const paragraphs = fullText.split(/\n\s*\n/);
  
    // Calculate TF-IDF vectors for each paragraph and the query
    const tfidfVectors = paragraphs.map(paragraph => {
      const vector = {};
      tokenize(paragraph).forEach(term => {
        vector[term] = tfidf(term, paragraph, paragraphs);
      });
      return vector;
    });
  
    const queryVector = {};
    tokenize(query).forEach(term => {
      queryVector[term] = tfidf(term, query, paragraphs);
    });
  
    // Calculate cosine similarity between query and each paragraph
    const similarities = tfidfVectors.map(vector => cosineSimilarity(queryVector, vector));
  
    // Sort paragraphs by similarity and select the most relevant ones
    const sortedParagraphs = paragraphs
      .map((paragraph, index) => ({ paragraph, similarity: similarities[index] }))
      .sort((a, b) => b.similarity - a.similarity);
  
    // Combine most relevant paragraphs up to maxLength
    let result = '';
    for (const { paragraph } of sortedParagraphs) {
      if ((result + paragraph).length <= maxLength) {
        result += paragraph + '\n\n';
      } else {
        break;
      }
    }
  
    return result.trim();
  }
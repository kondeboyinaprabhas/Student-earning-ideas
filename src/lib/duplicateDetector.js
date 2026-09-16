// duplicateDetector.js - N-gram & Jaccard Content Similarity Analyzer

function tokenize(text) {
  if (!text) return new Set();
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3)
  );
}

function get3Grams(text) {
  if (!text) return new Set();
  const cleaned = text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const grams = new Set();
  for (let i = 0; i < cleaned.length - 2; i++) {
    grams.add(cleaned.slice(i, i + 3));
  }
  return grams;
}

function jaccardSimilarity(setA, setB) {
  if (!setA.size || !setB.size) return 0;
  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) intersectionCount++;
  }
  const unionSize = setA.size + setB.size - intersectionCount;
  return unionSize === 0 ? 0 : (intersectionCount / unionSize);
}

export function checkContentDuplication(newIdea, existingIdeas = []) {
  if (!newIdea || !existingIdeas.length) {
    return { isDuplicate: false, maxScore: 0, highestMatchTitle: null };
  }

  const newText = `${newIdea.title || ''} ${newIdea.subtitle || ''} ${newIdea.summary || ''} ${JSON.stringify(newIdea.steps || '')}`;
  const newTokens = tokenize(newText);
  const newGrams = get3Grams(newText);

  let maxScore = 0;
  let highestMatchTitle = null;

  for (const existing of existingIdeas) {
    if (existing.id === newIdea.id) continue; // Skip self

    const existingText = `${existing.title || ''} ${existing.subtitle || ''} ${existing.breakdown?.summary || ''} ${JSON.stringify(existing.implementationSteps || '')}`;
    const existingTokens = tokenize(existingText);
    const existingGrams = get3Grams(existingText);

    const tokenScore = jaccardSimilarity(newTokens, existingTokens);
    const gramScore = jaccardSimilarity(newGrams, existingGrams);
    const combinedScore = (tokenScore * 0.4) + (gramScore * 0.6);

    if (combinedScore > maxScore) {
      maxScore = combinedScore;
      highestMatchTitle = existing.title;
    }
  }

  const scorePercentage = Math.round(maxScore * 100);
  const isDuplicate = scorePercentage >= 40;

  return {
    isDuplicate,
    score: scorePercentage,
    highestMatchTitle,
    level: scorePercentage >= 65 ? 'critical' : scorePercentage >= 40 ? 'warning' : 'safe',
    message: isDuplicate 
      ? `High similarity (${scorePercentage}%) with "${highestMatchTitle}". Please differentiate unique student value.`
      : scorePercentage > 20
      ? `Mild similarity (${scorePercentage}%) with "${highestMatchTitle}". Looks good.`
      : `Original content (${scorePercentage}% overlap). Excellent uniqueness score.`
  };
}

// chatgptParser.js - Intelligent Paste & Auto-Format NLP Heuristic Engine
// Parses raw ChatGPT markdown/text and extracts 11+ structured fields automatically

export function parseChatGptArticle(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  const text = rawText.trim();
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Helper regex search
  function findMatch(patterns) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) return match[1].trim();
    }
    return '';
  }

  // 1. Extract Title
  let title = findMatch([
    /(?:Title|Headline|Idea Name):\s*["']?([^"'\n]+)["']?/i,
    /^#\s+(.+)$/m,
    /^([A-Z0-9\s—–:-]{10,80})$/m
  ]);
  if (!title && lines.length > 0) {
    // Strip markdown formatting from first line
    title = lines[0].replace(/^[#*-\s]+/, '').replace(/[*_#]/g, '');
  }

  // 2. Extract Subtitle
  let subtitle = findMatch([
    /(?:Subtitle|Tagline|Summary Line):\s*["']?([^"'\n]+)["']?/i,
    /(?:Quick Summary|Overview):\s*([^\n]+)/i
  ]);
  if (!subtitle && lines.length > 1) {
    subtitle = lines[1].replace(/^[#*-\s]+/, '').replace(/[*_#]/g, '');
    if (subtitle.length > 140) subtitle = subtitle.slice(0, 137) + '...';
  }

  // 3. Investment
  let investment = findMatch([
    /(?:Initial Investment|Startup Cost|Investment|Cost):\s*([^\n]+)/i,
    /(₹\s*[\d,]+(?:\s*–\s*₹\s*[\d,]+)?)/i
  ]);
  if (!investment) {
    if (text.toLowerCase().includes('zero investment') || text.toLowerCase().includes('no money') || text.toLowerCase().includes('free')) {
      investment = '₹0–₹500';
    } else {
      investment = '₹500–₹2000';
    }
  }

  // 4. Estimated Profit
  let estimatedProfit = findMatch([
    /(?:Estimated Profit|Monthly Profit|Potential Earnings|Earning Potential|Income):\s*([^\n]+)/i,
    /(₹\s*[\d,]+(?:\s*–\s*₹\s*[\d,]+)?\s*(?:\/\s*(?:mo|month|day))?)/i
  ]);
  if (!estimatedProfit) estimatedProfit = "₹12,000–₹35,000 / mo";

  // 5. Payback Period
  let paybackPeriod = findMatch([
    /(?:Payback Period|Time to First Payout|Time to First Rupee|Payback):\s*([^\n]+)/i
  ]);
  if (!paybackPeriod) paybackPeriod = "1–2 weeks";

  // 6. Difficulty & Time Required
  let difficulty = "Beginner";
  if (text.match(/intermediate/i)) difficulty = "Intermediate";
  if (text.match(/advanced|expert/i)) difficulty = "Advanced";

  let timeRequired = findMatch([
    /(?:Time Required|Time Commitment|Daily Time|Effort):\s*([^\n]+)/i
  ]);
  if (!timeRequired) timeRequired = "1–2 hrs / day";

  // 7. Category Detection
  let suggestedCategory = "Online Business";
  const lower = text.toLowerCase();
  if (lower.includes('reels') || lower.includes('video') || lower.includes('youtube') || lower.includes('content') || lower.includes('notion')) {
    suggestedCategory = "Digital Business";
  } else if (lower.includes('tutor') || lower.includes('coding') || lower.includes('course') || lower.includes('teaching')) {
    suggestedCategory = "Education";
  } else if (lower.includes('stall') || lower.includes('campus') || lower.includes('fest') || lower.includes('event')) {
    suggestedCategory = "Campus Gigs";
  } else if (lower.includes('snack') || lower.includes('baking') || lower.includes('food') || lower.includes('pickle')) {
    suggestedCategory = "Home-Based";
  } else if (lower.includes('book') || lower.includes('flip') || lower.includes('gadget') || lower.includes('resell')) {
    suggestedCategory = "E-Commerce";
  } else if (lower.includes('offline') || lower.includes('physical')) {
    suggestedCategory = "Offline Business";
  }

  // 8. Breakdown Summary & How it works
  let summary = findMatch([
    /(?:Idea Breakdown|What It Is|Overview|Summary):\s*\n*([^#\n]+(?:\n[^#\n]+){1,3})/i
  ]);
  if (!summary) {
    summary = lines.slice(1, 4).join(' ').replace(/[*_]/g, '');
  }

  // 9. Step-by-Step Implementation Extraction
  const steps = [];
  const stepRegex = /(?:Step\s*(\d+)[:.-]\s*([^\n]+)|(\d+)\.\s+([^\n]+))/gi;
  let stepMatch;
  let stepCount = 1;
  
  // Try finding explicit steps
  const stepBlocks = text.split(/(?=Step\s*\d+|(?:\n\d+\.\s+))/i);
  for (const block of stepBlocks) {
    const headerMatch = block.match(/(?:Step\s*\d+[:.-]?|\d+\.)\s*([^\n]+)/i);
    if (headerMatch && steps.length < 5) {
      const stepTitle = headerMatch[1].replace(/[*_#]/g, '').trim();
      const content = block.replace(headerMatch[0], '').trim().slice(0, 250);
      steps.push({
        step: steps.length + 1,
        title: stepTitle || `Action Phase ${steps.length + 1}`,
        detail: content || "Execute this phase systematically using free online tools.",
        proTip: `Focus on consistency during this phase to build quick momentum.`
      });
    }
  }

  // Fallback default steps if fewer than 3 were parsed
  if (steps.length < 3) {
    steps.length = 0;
    steps.push(
      { step: 1, title: "Market Research & Niche Selection", detail: "Identify student demand and test with a free pilot.", proTip: "Survey your campus batch for fast validation." },
      { step: 2, title: "Assemble Proof of Work", detail: "Create 3 high quality free samples demonstrating capability.", proTip: "Host samples on Google Drive or Notion." },
      { step: 3, title: "Direct Outreach & Distribution", detail: "Connect directly with initial customers via WhatsApp and Instagram.", proTip: "Direct personal messages convert 5x better than cold posts." },
      { step: 4, title: "Fulfillment & Instant UPI Payments", detail: "Deliver on time and collect upfront deposits.", proTip: "Set up instant payment alerts with Google Pay / PhonePe." },
      { step: 5, title: "Collect Testimonials & Scale", detail: "Ask satisfied customers for referrals and campus word-of-mouth.", proTip: "Word of mouth is your highest ROI growth driver." }
    );
  }

  // 10. Checklist items
  const checklist = [
    { id: `c_${Date.now()}_1`, text: `Set up tools & workspace for ${title.slice(0, 30)}`, completed: false },
    { id: `c_${Date.now()}_2`, text: "Create first 3 proof-of-concept samples", completed: false },
    { id: `c_${Date.now()}_3`, text: "Set up payment method (UPI / QR Code)", completed: false },
    { id: `c_${Date.now()}_4`, text: "Launch outreach to first 10 potential customers", completed: false },
    { id: `c_${Date.now()}_5`, text: "Deliver first order and document feedback", completed: false }
  ];

  // 11. SEO Fields
  const seoTitle = `${title} | Student Earning Ideas`;
  const metaDescription = subtitle.length > 150 ? subtitle.slice(0, 150) + '...' : subtitle;

  return {
    title: title || "New Student Earning Idea",
    subtitle: subtitle || "Step-by-step student business blueprint with zero investment.",
    category: suggestedCategory,
    investment,
    estimatedProfit,
    paybackPeriod,
    difficulty,
    timeRequired,
    summary,
    steps,
    checklist,
    seoTitle,
    metaDescription
  };
}

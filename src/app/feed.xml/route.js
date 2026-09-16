// src/app/feed.xml/route.js - Dynamic RSS Feed
import { SEED_IDEAS } from '@/lib/seedData';

export async function GET() {
  const baseUrl = 'https://studentearningideas.com';

  const itemsXml = SEED_IDEAS.map(idea => `
    <item>
      <title><![CDATA[${idea.title}]]></title>
      <link>${baseUrl}/idea/${idea.slug}</link>
      <guid>${baseUrl}/idea/${idea.slug}</guid>
      <description><![CDATA[${idea.subtitle} - Investment: ${idea.investment}, Potential Profit: ${idea.estimatedProfit}]]></description>
      <category>${idea.category}</category>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
  `).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Student Earning Ideas — 100+ Ways to Earn</title>
    <link>${baseUrl}</link>
    <description>Verified student business blueprints, side hustles and calculators.</description>
    <language>en-in</language>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate'
    }
  });
}

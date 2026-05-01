import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // For demonstration, we simulate fetching.
    // In a real scenario, you'd use a proxy or a headless browser service here.
    
    const isTwitter = url.includes('x.com') || url.includes('twitter.com');
    
    if (isTwitter) {
      // Simulate specialized Twitter scraping
      return NextResponse.json({
        source: 'X (Twitter)',
        results: [
          { id: 1, date: '2024-12-03', text: 'Significant anomalies detected in election data. NEC records must be secured.', type: 'Alert' },
          { id: 2, date: '2024-12-14', text: 'Presidential statement regarding the recent impeachment proceedings.', type: 'Update' },
          { id: 3, date: '2025-01-18', text: 'Report from Seoul Western District Court: Evidence of provocation found.', type: 'Investigation' },
        ]
      });
    }

    // For general URLs, we can try to fetch the title
    try {
      const response = await fetch(url, { next: { revalidate: 3600 } });
      const html = await response.text();
      const titleMatch = html.match(/<title>(.*?)<\/title>/);
      const title = titleMatch ? titleMatch[1] : url;

      return NextResponse.json({
        source: 'Web',
        results: [
          { id: 1, date: 'Today', text: `Successfully extracted content from: ${title}`, type: 'General' },
          { id: 2, date: 'Today', text: `Source URL: ${url}`, type: 'Metadata' },
        ]
      });
    } catch (fetchError) {
      return NextResponse.json({
        source: 'Error',
        results: [
          { id: 1, date: 'N/A', text: `Could not reach ${url}. The site might be blocking automated requests.`, type: 'Error' }
        ]
      });
    }

  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

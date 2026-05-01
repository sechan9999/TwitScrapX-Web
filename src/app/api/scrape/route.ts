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
      // Simulate specialized Twitter scraping using our pre-collected database
      return NextResponse.json({
        source: 'X (Twitter)',
        results: [
          { id: 1, date: '2024-12-10', text: 'The electronic vote counting machine display monitor shows 783 votes in a row going to 1 candidate. That\'s not normal.', type: 'Alert' },
          { id: 2, date: '2024-12-09', text: '"Forward Toward Socialism" (사회주의를 향한 전진) Why is this written on the large red flag at the National Assembly?', type: 'Observation' },
          { id: 3, date: '2024-12-08', text: 'Police blocking citizens from entering National Election Commission (NEC) building to search for evidence of election fraud.', type: 'Alert' },
          { id: 4, date: '2024-12-14', text: 'President Yoon Suk-yeol’s Statement on the Impeachment Vote. 204 for, 85 against.', type: 'Update' },
          { id: 5, date: '2024-12-15', text: 'Police arrested KDIC commanders. They hate that KDIC searched corrupt Natl Election Commission.', type: 'Crisis' },
          { id: 6, date: '2024-12-14', text: 'Rent-a-Crowd with Chinese demanding impeachment of South Korean president.', type: 'Claim' },
          { id: 7, date: '2025-01-20', text: 'President Yoon Suk-yeol\'s mother, 93, is hospitalized. They won\'t release Prez Yoon to see his mother.', type: 'Personal' },
          { id: 8, date: '2025-01-19', text: 'Police lured upset citizens into Seoul Western District Court. The police walked back, luring them in.', type: 'Investigation' },
          { id: 9, date: '2025-01-19', text: 'JTBC journalist was the one who broke the glass door with a fire extinguisher. Agent provocateur.', type: 'Exposure' },
          { id: 10, date: '2025-04-04', text: 'The Constitutional Court\'s decision to remove President Yoon is null and void (원천무효) based on lies.', type: 'Declaration' },
          { id: 11, date: '2025-04-04', text: 'Patriots gathering at Gwanghwamun to protest the unconstitutional removal of President Yoon.', type: 'Protest' },
          { id: 12, date: '2025-04-05', text: 'Constitutional Court used fake evidence and false testimony to impeach the President.', type: 'Allegation' },
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

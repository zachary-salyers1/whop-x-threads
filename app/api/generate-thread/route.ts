import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function POST(req: NextRequest) {
  try {
    const { youtubeUrl, threadLength } = await req.json();

    if (!youtubeUrl) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
    }

    // Extract video ID from YouTube URL
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    // Get transcript from YouTube video
    let transcript: string;
    try {
      const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
      transcript = transcriptData.map(item => item.text).join(' ');
    } catch (error) {
      console.error('Error fetching transcript:', error);
      return NextResponse.json({ 
        error: 'Unable to fetch transcript. The video might not have captions available.' 
      }, { status: 400 });
    }

    // Generate threads using a simple approach (in a real app, you'd use OpenAI or similar)
    const threads = generateThreadsFromTranscript(transcript, threadLength);

    return NextResponse.json({ threads });
  } catch (error) {
    console.error('Error generating thread:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

function generateThreadsFromTranscript(transcript: string, threadLength: number): string[] {
  // Split transcript into sentences
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0) {
    return ['Unable to generate thread from this video.'];
  }

  const threads: string[] = [];
  const sentencesPerThread = Math.max(1, Math.floor(sentences.length / threadLength));

  for (let i = 0; i < threadLength; i++) {
    const startIdx = i * sentencesPerThread;
    const endIdx = i === threadLength - 1 ? sentences.length : (i + 1) * sentencesPerThread;
    
    const threadSentences = sentences.slice(startIdx, endIdx);
    let threadText = threadSentences.join('. ').trim();
    
    // Ensure thread doesn't exceed Twitter's character limit (280 chars)
    if (threadText.length > 270) {
      threadText = threadText.substring(0, 267) + '...';
    }
    
    // Add thread numbering for the first tweet
    if (i === 0 && threadLength > 1) {
      threadText = `🧵 Thread: ${threadText}`;
    }
    
    if (threadText) {
      threads.push(threadText);
    }
  }

  return threads.length > 0 ? threads : ['Unable to generate meaningful threads from this video.'];
}
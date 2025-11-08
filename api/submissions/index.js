import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Transform to match old format
      const submissions = data.map(row => ({
        id: row.id,
        songName: row.song_name,
        artistName: row.artist_name,
        albumName: row.album_name,
        albumCover: row.album_cover,
        previewUrl: row.preview_url,
        userText: row.user_text,
        submittedBy: row.submitted_by,
        timestamp: row.timestamp,
        likes: row.likes || 0
      }));

      return res.status(200).json(submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return res.status(500).json({ error: 'Failed to load submissions' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { songName, artistName, albumName, albumCover, previewUrl, userText, submittedBy } = req.body;

      if (!songName || !artistName || !albumName || !userText) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { data, error } = await supabase
        .from('submissions')
        .insert([
          {
            song_name: songName,
            artist_name: artistName,
            album_name: albumName,
            album_cover: albumCover,
            preview_url: previewUrl || null,
            user_text: userText,
            submitted_by: submittedBy || 'Anonymous',
            likes: 0
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Transform to match old format
      const newSubmission = {
        id: data.id,
        songName: data.song_name,
        artistName: data.artist_name,
        albumName: data.album_name,
        albumCover: data.album_cover,
        previewUrl: data.preview_url,
        userText: data.user_text,
        submittedBy: data.submitted_by,
        timestamp: data.timestamp,
        likes: data.likes || 0
      };

      return res.status(201).json(newSubmission);
    } catch (error) {
      console.error('Error creating submission:', error);
      return res.status(500).json({ error: 'Failed to create submission' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

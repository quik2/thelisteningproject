import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    // Check if environment variables are set
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing environment variables:', {
        hasUrl: !!process.env.SUPABASE_URL,
        hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      });
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Get current submission
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('likes')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return res.status(404).json({ error: 'Submission not found', details: fetchError.message });
    }

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Decrement likes (don't go below 0)
    const newLikes = Math.max((submission.likes || 0) - 1, 0);

    const { error: updateError } = await supabase
      .from('submissions')
      .update({ likes: newLikes })
      .eq('id', id);

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    return res.status(200).json({ likes: newLikes });
  } catch (error) {
    console.error('Error unliking submission:', error);
    return res.status(500).json({ error: 'Failed to unlike submission', details: error.message });
  }
}

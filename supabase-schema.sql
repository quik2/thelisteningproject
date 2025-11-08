-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  song_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_name TEXT NOT NULL,
  album_cover TEXT NOT NULL,
  preview_url TEXT,
  user_text TEXT NOT NULL,
  submitted_by TEXT DEFAULT 'Anonymous',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on timestamp for sorting
CREATE INDEX IF NOT EXISTS idx_submissions_timestamp ON submissions(timestamp DESC);

-- Create index on likes for sorting
CREATE INDEX IF NOT EXISTS idx_submissions_likes ON submissions(likes DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to read submissions
CREATE POLICY "Allow public read access" ON submissions
  FOR SELECT USING (true);

-- Allow anyone to insert submissions
CREATE POLICY "Allow public insert access" ON submissions
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update likes
CREATE POLICY "Allow public update likes" ON submissions
  FOR UPDATE USING (true);

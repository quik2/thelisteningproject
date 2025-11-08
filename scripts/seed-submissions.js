import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Diverse song submissions with varied stories
const submissions = [
  {
    query: "Landslide Fleetwood Mac",
    story: "I was 16 when I first heard this song, sitting in my mom's car outside the grocery store. She was inside shopping and I was waiting, flipping through radio stations out of boredom. When this came on, I stopped. I had no idea who Fleetwood Mac was. I just knew that this woman's voice was singing about getting older and being afraid of change, and somehow she was describing exactly how I felt about graduating high school, even though she wrote it decades before I was born. I sat there in the parking lot, windows fogging up from the cold, and I cried. Not dramatic sobbing, just quiet tears because someone understood. My mom came back with the groceries and asked if I was okay. I couldn't explain it. I just said 'yeah, I'm fine' and we drove home in silence. Now I'm 34. My mom passed away two years ago. This song came on shuffle while I was cleaning out her house, packing up her things, deciding what to keep and what to let go. I sat on the floor of her bedroom, surrounded by boxes and memories, and cried the same quiet tears. Stevie Nicks is still singing about getting older and being afraid of change. I still don't have the answers. But there's something comforting about that—about a song that grows with you, that means something different every time you need it."
  },
  {
    query: "Wonderwall Oasis",
    story: "Yeah, I know. Everyone has a story about this song. But here's mine: I was at a party in college, one of those huge house parties where you don't know anyone and the music is too loud and you're questioning why you came. I was about to leave when someone started playing guitar in the corner. Acoustic. This song. And something shifted. Everyone stopped pretending to be cool for a second. People started singing. Not ironically, not making fun of it, just genuinely singing along to this overplayed, cliché song. And for those three and a half minutes, a room full of strangers felt like friends. I don't remember anything else about that night. Not what I wore, not who I talked to, not how I got home. But I remember that moment of collective joy over a song everyone claims to hate but secretly still loves."
  },
  {
    query: "Heroes David Bowie",
    story: "My dad was obsessed with Bowie. When I was a kid, I thought it was embarrassing. He'd blast this song while washing the car on Sunday mornings, singing at the top of his lungs, completely off-key. The neighbors would stare. I'd hide inside. Classic teenage mortification. He died suddenly when I was 22. Heart attack. No warning. And I realized I'd never actually told him I loved him. Not out loud, anyway. We just weren't that kind of family. A few weeks after the funeral, I was driving and this song came on the radio. I had to pull over. Because I finally understood what he loved about it. It's not just a song. It's a declaration. It's about being brave enough to believe in something bigger than yourself, even if it's just for one day. My dad wasn't a particularly brave man in the conventional sense. He had a normal job, a normal life. But he loved fiercely. He showed up. He tried. And maybe that's what being a hero actually is. Every time I hear this song now, I think about him singing in the driveway, not caring who was watching. That was brave. That was love."
  },
  {
    query: "Creep Radiohead",
    story: "High school dance. I didn't want to be there but my friends dragged me. I spent most of the night against the wall, watching everyone else have fun, feeling like an alien observing humans. Then this song came on. And suddenly I wasn't alone. Because everyone in that room, even the popular kids, were singing along to a song about not belonging. We were all creeps. We were all weirdos. And for those four minutes, that was okay."
  },
  {
    query: "Africa Toto",
    story: "Okay so this is ridiculous but: I was on a terrible Tinder date. Like, truly awful. The guy spent 45 minutes talking about cryptocurrency and didn't ask me a single question. I was planning my escape when this song came on in the restaurant. Out of nowhere, he stops mid-sentence about blockchain and goes 'I fucking love this song.' And we both just started singing. Loudly. The whole restaurant was staring. We got the chorus wrong. We didn't care. The date was still bad but that moment was perfect. Sometimes the worst experiences have the best soundtracks."
  },
  {
    query: "Bitter Sweet Symphony The Verve",
    story: "I listened to this song on repeat for an entire year after my divorce. Something about the lyrics 'I'm a million different people from one day to the next' just hit. I was trying to figure out who I was without being someone's wife. Some days I felt free, some days I felt lost, some days I felt both at the same time. This song understood that. It didn't try to fix me or cheer me up. It just sat with me in the mess."
  },
  {
    query: "Smells Like Teen Spirit Nirvana",
    story: "My teenage rebellion song, except I was rebelling against nothing in particular. Grew up in the suburbs, had loving parents, went to a decent school. But I felt this inexplicable rage anyway. This song gave it a voice. Now I'm in my 40s and when I hear it I don't feel angry anymore. I just feel nostalgic for a time when everything felt so urgent and important, even when it wasn't."
  },
  {
    query: "Champagne Supernova Oasis",
    story: "Summer after freshman year of college. My friends and I would drive out to this spot by the lake and just sit on the hood of the car, drinking cheap beer and feeling infinite. This song was our anthem for those nights. We thought we were so deep, discussing the meaning of life and wondering where we'd all be in ten years. Well, it's been ten years. We're scattered across the country now. Different jobs, different lives. But we have a group chat and sometimes someone will just send a link to this song and we all know what it means: remember when we were young and stupid and everything felt possible?"
  },
  {
    query: "Come As You Are Nirvana",
    story: "This was playing in the hospital waiting room when my sister came out of surgery. She'd been in a bad car accident. The surgery went well but those hours of not knowing were the worst of my life. This song came on the radio and I just focused on Kurt Cobain's voice. The repetitive guitar. The rhythm. It kept me grounded when I felt like I was falling apart."
  },
  {
    query: "Under the Bridge Red Hot Chili Peppers",
    story: "Moved to LA for a job. Didn't know anyone. Spent the first three months completely alone. I'd drive around at night listening to this song, looking at the city lights, feeling lonely but also kind of in love with the melancholy of it all. The city was beautiful and I was sad and somehow both things were okay."
  },
  {
    query: "Black Hole Sun Soundgarden",
    story: "This song always felt like a fever dream to me. Dark and surreal and beautiful. I listened to it a lot during a really weird period of unemployment where I had no structure and time felt meaningless. I'd sleep until noon, stay up all night, exist in this strange liminal space. This song was the soundtrack."
  },
  {
    query: "Zombie The Cranberries",
    story: "Protest song. Breakup song. Anger song. I've used this for all three. The way Dolores O'Riordan screams 'in your HEAD' gives me chills every single time. Sometimes you need music that matches your rage."
  },
  {
    query: "Good Riddance Green Day",
    story: "Graduation song for every millennial. But it hits different when you actually have something to say goodbye to. Played this at my best friend's funeral. She died at 28. Brain aneurysm. No warning. And the line 'it's something unpredictable, but in the end it's right' felt both comforting and cruel. I still don't know if I believe it."
  },
  {
    query: "Don't Stop Believin' Journey",
    story: "Karaoke. Always karaoke. I'm a terrible singer but this song makes me brave."
  },
  {
    query: "Mr. Brightside The Killers",
    story: "Every millennial's emo anthem. This song comes on at any bar after midnight and suddenly everyone is 17 again, screaming about jealousy and turning saints into the sea. We're all too old for this but we don't care."
  },
  {
    query: "Sweet Child O' Mine Guns N' Roses",
    story: "My dad's ringtone. He's 65 and doesn't know how to change it. Every time his phone rings in public he gets embarrassed but I love it. That guitar riff means he's calling."
  },
  {
    query: "Hallelujah Jeff Buckley",
    story: "This song is so overused it's almost a cliche. But there's a reason everyone keeps coming back to it. It's about love and loss and faith and doubt and sex and spirituality and somehow it's about all of those things at once. I walked down the aisle to this. My dad cried. I cried. Everyone cried. Because Leonard Cohen understood that love is holy and broken and both things can be true."
  },
  {
    query: "Take On Me a-ha",
    story: "Pure joy in song form. Impossible to listen to without smiling. I play this when I'm sad and need to remember that sometimes things can just be fun and silly and that's enough."
  },
  {
    query: "Losing My Religion R.E.M.",
    story: "I thought this song was about actual religion for years. Turns out it's about unrequited love and feeling like you're losing yourself. Which honestly makes more sense. I listened to this a lot in my 20s when I was dating someone who didn't love me back but I kept trying anyway."
  },
  {
    query: "Everybody Hurts R.E.M.",
    story: "Sometimes you need someone to tell you that pain is universal. That you're not alone. That you should hold on. This song does that. It saved me once, and I'm not being dramatic."
  },
  {
    query: "Nothing Compares 2 U Sinead O'Connor",
    story: "The rawest vocal performance ever recorded. You can hear the heartbreak in her voice. I ugly cried to this after a breakup and it felt like she was crying with me."
  },
  {
    query: "Fade Into You Mazzy Star",
    story: "This song sounds like falling in love in slow motion. Hazy and dreamy and a little bit sad. I listened to it on repeat when I first started dating my partner. It matched the feeling of being pulled into someone else's orbit."
  },
  {
    query: "There Is a Light That Never Goes Out The Smiths",
    story: "Morrissey is problematic but this song is perfect. The drama of 'to die by your side is such a heavenly way to die' when you're 16 and in love for the first time. I took it so seriously then. Now it makes me laugh. But I still love it."
  },
  {
    query: "Just Like Heaven The Cure",
    story: "Running through the park at sunset with someone I loved, this song playing in my headphones, feeling like I was in a movie. That relationship ended years ago but this song still makes me feel young and free and reckless in the best way."
  },
  {
    query: "Where Is My Mind Pixies",
    story: "Fight Club ruined this song by making it iconic, but it was already perfect. I listen to it when I'm overwhelmed and need to reset. The chaos of the verses and then that calm, questioning chorus. Where IS my mind? Honestly, I'm still looking for it."
  },
  {
    query: "Common People Pulp",
    story: "Class consciousness set to a perfect pop song. I didn't fully appreciate this until I was older and understood what Jarvis Cocker was actually saying. Now it's one of my favorites. Biting and brilliant."
  },
  {
    query: "Only Happy When It Rains Garbage",
    story: "My depression anthem. Sometimes I don't want to be cheered up. Sometimes I want to sit in it. This song gets that."
  },
  {
    query: "Wannabe Spice Girls",
    story: "No shame. This song is pure nostalgia and friendship and girl power. My friends and I still sing this at karaoke and we're all in our 30s."
  },
  {
    query: "No Scrubs TLC",
    story: "This was playing the first time I stood up for myself in a relationship. He was a scrub. I was done. This song gave me the soundtrack I needed to walk away."
  },
  {
    query: "Waterfalls TLC",
    story: "My mom loved this song. She'd sing along in the car. I didn't really understand what it was about as a kid but now the whole 'don't go chasing waterfalls' thing makes sense. Stick to what you know. Don't self-destruct. It's advice I still need to hear."
  },
  {
    query: "Bohemian Rhapsody Queen",
    story: "My 4-year-old daughter calls this 'the mama song' because of the opening. She has no idea what it's about but she insists we listen to it every single day on the way to preschool. This morning she asked me why the man killed someone. I told her it's complicated. She said 'okay' and went back to eating her cheerios. Parenting is wild.",
    likes: 287
  },
  {
    query: "Fix You Coldplay",
    story: "I was in the ICU after a suicide attempt. My sister sat next to my bed and played this song on her phone. I was too weak to tell her to turn it off. She just held my hand and cried. 'Lights will guide you home' felt like both a promise and a prayer. That was three years ago. I'm still here. The lights did guide me home.",
    likes: 412
  },
  {
    query: "Fast Car Tracy Chapman",
    story: "My mom was a single parent working two jobs. We lived in a tiny apartment and she drove this beat-up Toyota that barely ran. This song was on a cassette tape that got stuck in the car stereo, so it was literally the only thing we could listen to for like six months. She'd sing along while we sat in traffic and I'd roll my eyes because I was 14 and everything was embarrassing. She worked herself to death to give me a better life. I have that better life now. I drive a nice car. But sometimes I play this song and cry in parking lots, wishing I could go back to that beat-up Toyota and tell her thank you.",
    likes: 523
  },
  {
    query: "Someone Like You Adele",
    story: "I sang this at my ex's wedding. Yes, really. No, it wasn't weird. Okay, it was a little weird. But he asked me to and I said yes because we're genuinely friends now and I'm genuinely happy for him. His wife cried. I cried. He cried. Everyone cried. Sometimes love doesn't work out the way you planned but it still meant something.",
    likes: 198
  },
  {
    query: "All Too Well Taylor Swift",
    story: "The 10 minute version came out right after my breakup. I listened to it 47 times in one day. I know because Spotify sent me a notification asking if I was okay. I was not okay.",
    likes: 342
  },
  {
    query: "Stan Eminem",
    story: "High school English teacher played this when we were studying obsession in literature. Then he played 'Dear Theodosia' from Hamilton. Then he told us about his daughter and how becoming a parent changed him. Mr. Patterson, if you're reading this, that lesson stuck with me more than anything else from high school.",
    likes: 156
  },
  {
    query: "Dancing Queen ABBA",
    story: "My 86-year-old grandmother has dementia. She doesn't recognize me most days. But when we play this song, she lights up and starts dancing. Her body remembers even when her mind doesn't. Music is the last thing to leave us.",
    likes: 891
  },
  {
    query: "September Earth Wind and Fire",
    story: "Got married on September 21st specifically so we could play this at our wedding. We're divorced now but I stand by the decision. It was a good party.",
    likes: 178
  },
  {
    query: "Tiny Dancer Elton John",
    story: "This song came on the radio while I was driving my daughter to her first day of kindergarten. She was nervous and I was trying not to cry. I started singing along and she asked me what the words meant. I realized I had no idea. We've been singing it wrong together for three years now and I'm never going to correct her.",
    likes: 234
  },
  {
    query: "Radioactive Imagine Dragons",
    story: "This was my pump-up song before I came out to my parents. I sat in my car in their driveway, listening to this on repeat, trying to gather the courage. I must have restarted it like 15 times before I finally went inside. They were more accepting than I expected. Now every time I hear it I remember that feeling of being terrified and brave at the same time.",
    likes: 267
  },
  {
    query: "Drops of Jupiter Train",
    story: "My high school girlfriend broke up with me because she wanted to 'find herself.' This song came out that same summer. I was 17 and heartbroken and I took it SO personally. Like, Train wrote this song specifically about MY breakup. Now I'm 38 and I realize we were children. I hope she found herself. I hope she's happy.",
    likes: 143
  },
  {
    query: "Iris Goo Goo Dolls",
    story: "City of Angels soundtrack. My first real heartbreak. Thought I'd never love anyone again. Cried to this song for weeks. Fast forward 20 years: happily married, two kids, stable job, good life. But this song still destroys me. Some emotional scars are permanent and that's okay.",
    likes: 189
  },
  {
    query: "Chasing Cars Snow Patrol",
    story: "My husband proposed during this song. We were at home on the couch, not even doing anything special, just existing together. He paused the TV and said 'I want to do this forever.' No ring, no plan, just us. We got married at the courthouse the next week. That was 12 years ago.",
    likes: 456
  },
  {
    query: "Hey There Delilah Plain White T's",
    story: "Long distance relationship in college. He was in California, I was in New York. We'd play this song on the phone before bed. We broke up after graduation and I didn't hear from him for 10 years. Last month he called me out of the blue. He's getting married. He wanted to tell me himself. We talked for three hours like no time had passed. Some people change your life even when they don't stay in it.",
    likes: 378
  },
  {
    query: "Let It Be The Beatles",
    story: "Played this at my mom's funeral. She wasn't religious but she loved the Beatles. 'Speaking words of wisdom, let it be' felt like her telling us it was okay to let her go. I still can't make it through the whole song without crying but I listen to it when I need to feel close to her.",
    likes: 512
  },
  {
    query: "Piano Man Billy Joel",
    story: "There's a dive bar in my hometown that plays this every Friday at midnight. Everyone stops what they're doing and sings along. I moved away 10 years ago but every time I visit, I make sure I'm at that bar at midnight on Friday. It's like a time machine to being 22 and thinking I had my whole life figured out.",
    likes: 276
  },
  {
    query: "Hotel California Eagles",
    story: "My dad's favorite song. He died when I was 15. I'm 42 now and I still can't hear that guitar solo without thinking about him air-guitaring in the living room. He looked ridiculous. I miss him so much it physically hurts.",
    likes: 423
  },
  {
    query: "Bittersweet Symphony The Verve",
    story: "Played this on repeat during my divorce. The irony of 'I'm a million different people from one day to the next' was not lost on me. I was trying to figure out who I was when I wasn't someone's wife anymore.",
    likes: 167
  },
  {
    query: "Rolling in the Deep Adele",
    story: "My revenge song. He cheated. I blasted this while packing his stuff. Felt very dramatic and powerful. 10/10 would recommend.",
    likes: 289
  },
  {
    query: "Time After Time Cyndi Lauper",
    story: "My grandparents had been married for 67 years when my grandpa died. At his funeral, my grandma stood up and sang this. A cappella. In front of everyone. Her voice shook but she made it through the whole song. There wasn't a dry eye in the room. She died six months later. I think she just wanted to be with him again.",
    likes: 734
  },
  {
    query: "Don't You Forget About Me Simple Minds",
    story: "Last day of high school. Everyone signed yearbooks with quotes from The Breakfast Club like we were the first generation to discover it. We thought we were so deep. We thought we'd be friends forever. We were wrong about everything except this song being perfect.",
    likes: 156
  },
  {
    query: "Every Breath You Take The Police",
    story: "Fun fact: this song is creepy as hell when you actually listen to the lyrics. My husband wanted it for our first dance. I vetoed. We did 'Unchained Melody' instead. He still brings it up at parties. 'She wouldn't let me have my stalker song.'",
    likes: 298
  },
  {
    query: "With or Without You U2",
    story: "I can't explain what this song means to me without sounding pretentious. But if you know, you know.",
    likes: 134
  },
  {
    query: "The Scientist Coldplay",
    story: "I ruined the best relationship I ever had. This song came on shuffle while I was drunk and I called her at 2am crying and trying to explain why I was sorry. She didn't answer. I left a voicemail that was probably 8 minutes long. She texted me the next day: 'I forgive you but I'm not coming back.' Fair.",
    likes: 445
  },
  {
    query: "Wagon Wheel Darius Rucker",
    story: "Every white person at every bonfire has sung this song off-key. I am one of those white people. No regrets.",
    likes: 512
  },
  {
    query: "Don't Stop Me Now Queen",
    story: "Beat cancer. This was my victory song. Blasted it in the car leaving my last chemo appointment. Cried happy tears. Five years in remission now.",
    likes: 678
  },
  {
    query: "American Pie Don McLean",
    story: "My dad made me memorize all the lyrics when I was 12. I thought it was torture. Now I'm the most popular person at karaoke. Thanks, dad.",
    likes: 234
  },
  {
    query: "Sweet Caroline Neil Diamond",
    story: "BUM BUM BUM. Impossible not to sing along. I don't make the rules.",
    likes: 198
  },
  {
    query: "Livin' on a Prayer Bon Jovi",
    story: "Terrible karaoke song choice. Great life philosophy. We're halfway there.",
    likes: 176
  },
  {
    query: "I Will Always Love You Whitney Houston",
    story: "My vocal coach told me to never attempt this song in public. I did not listen. I should have listened.",
    likes: 267
  },
  {
    query: "Don't Stop Believin' Journey",
    story: "My daughter is in show choir. They perform this song. I've seen it 47 times. I'm not sick of it yet. That's how good this song is.",
    likes: 189
  },
  {
    query: "Blue Eiffel 65",
    story: "I'm blue da ba dee da ba di. That's it. That's the whole song. And it's been stuck in your head ever since you read this. You're welcome.",
    likes: 423
  },
  {
    query: "All Star Smash Mouth",
    story: "Shrek. That's the whole story. This is a Shrek song now.",
    likes: 389
  },
  {
    query: "Mr. Jones Counting Crows",
    story: "This song makes me want to quit my corporate job and become an artist even though I have zero artistic ability. That's the power of good music.",
    likes: 143
  },
  {
    query: "What's Up 4 Non Blondes",
    story: "I scream-sang this in my car after getting laid off. Felt cathartic. Still unemployed but the scream helped.",
    likes: 234
  },
  {
    query: "Semi-Charmed Life Third Eye Blind",
    story: "Didn't realize this song was about meth until I was like 25. Just thought it was a fun song about... I don't know, being happy? Anyway. Still slaps.",
    likes: 456
  },
  {
    query: "The Middle Jimmy Eat World",
    story: "High school anthem for everyone who wasn't popular. Turns out we all felt like outsiders. We were all 'the middle.'",
    likes: 278
  },
  {
    query: "In the End Linkin Park",
    story: "RIP Chester Bennington. This song meant everything to sad teenagers in the 2000s. It still means everything.",
    likes: 623
  },
  {
    query: "Numb Linkin Park",
    story: "I listened to this on repeat for my entire freshman year of college. I was deeply depressed and this song was the only thing that understood. I'm better now but I still remember what that felt like.",
    likes: 467
  },
  {
    query: "Boulevard of Broken Dreams Green Day",
    story: "Walking home alone at 3am, this song playing, feeling like the main character in a sad indie movie. Peak 2005 energy.",
    likes: 312
  },
  {
    query: "Wake Me Up When September Ends Green Day",
    story: "Played this at my brother's funeral. He died in August. The timing was cruel. But the song was perfect.",
    likes: 567
  },
  {
    query: "The Reason Hoobastank",
    story: "The most 2000s apology song ever. Worked on my girlfriend in 8th grade. Did not work on my wife in my 30s. Growth.",
    likes: 289
  },
  {
    query: "How to Save a Life The Fray",
    story: "Grey's Anatomy ruined me for this song. Can't hear it without thinking about fictional characters dying. Still cry every time.",
    likes: 398
  },
  {
    query: "Viva La Vida Coldplay",
    story: "This came out the summer between high school and college. Everything felt epic and important. I felt like a revolutionary even though I was just a suburban kid going to state school. This song made me feel powerful.",
    likes: 234
  },
  {
    query: "Use Somebody Kings of Leon",
    story: "College heartbreak song. I was in love with someone who didn't love me back. This song articulated everything I couldn't say. I could use somebody too, man.",
    likes: 312
  },
  {
    query: "Counting Stars OneRepublic",
    story: "My 6-year-old loves this song. He doesn't know what it means. He just likes the counting part. Kids are pure.",
    likes: 167
  },
  {
    query: "Radioactive Imagine Dragons",
    story: "Workout song. Gets me through the last mile every time. I'm waking up to ash and dust? I wipe my brow? And then I do another burpee.",
    likes: 145
  },
  {
    query: "Shut Up and Dance Walk the Moon",
    story: "This was playing when I met my wife. We were at a wedding. She asked me to dance. I said 'I don't dance.' She said 'shut up and dance.' So I did. We've been together 8 years.",
    likes: 489
  },
  {
    query: "Riptide Vance Joy",
    story: "Ukulele song that sounds happy but is actually kind of sad? The millennial anthem.",
    likes: 223
  },
  {
    query: "Take Me to Church Hozier",
    story: "Didn't understand this song was about being queer until someone explained it to me. Then I cried because it's beautiful and powerful and important. Art matters.",
    likes: 534
  }
];

async function getSpotifyToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
      ).toString('base64')
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
}

async function searchSpotifyTrack(query, token) {
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  const data = await response.json();
  return data.tracks.items[0];
}

async function addSubmission(submission, token) {
  try {
    console.log(`Searching for: ${submission.query}`);
    const track = await searchSpotifyTrack(submission.query, token);

    if (!track) {
      console.log(`❌ Could not find track: ${submission.query}`);
      return;
    }

    const submissionData = {
      song_name: track.name,
      artist_name: track.artists.map(a => a.name).join(', '),
      album_name: track.album.name,
      album_cover: track.album.images[0]?.url || '',
      preview_url: track.preview_url || null,
      user_text: submission.story,
      submitted_by: 'Anonymous',
      likes: submission.likes || Math.floor(Math.random() * 15) // Use specified likes or random 0-14
    };

    const { data, error } = await supabase
      .from('submissions')
      .insert([submissionData])
      .select()
      .single();

    if (error) {
      console.log(`❌ Error adding ${track.name}:`, error.message);
    } else {
      console.log(`✅ Added: ${track.name} by ${track.artists[0].name}`);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    console.error(`Error processing ${submission.query}:`, error.message);
  }
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  const token = await getSpotifyToken();
  console.log('✅ Got Spotify access token\n');

  for (const submission of submissions) {
    await addSubmission(submission, token);
  }

  console.log('\n✅ Database seeding complete!');
}

seedDatabase();

import { useState, useEffect } from 'react'
import soundtrackImg from './images/Soundtracks.jpg'
import chaosImg from './images/Chaos.jpg'
import sweetsImg from './images/Sweets.jpg'
import draftsImg from './images/Drafts.jpg'

const App = () => {
  const [currentPage, setCurrentPage] = useState('home')

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // 🎵 1. Songs Page State & Playlists
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [songProgress, setSongProgress] = useState(40) // percentage
  const [trackTime, setTrackTime] = useState("01:24")

  const songPlaylist = [
    { 
      title: "Warm Breeze & Old Tape", 
      artist: "The Paper Cranes", 
      duration: "3:42", 
      mood: "Nostalgic",
      note: "the song that played when we got caught in that sudden July storm. We shared a single jacket and hid under the old theater awning, completely soaked and laughing.",
      artColor: "#EAD5C5",
      artType: "tape"
    },
    { 
      title: "Coffee & Afternoon Rain", 
      artist: "Misty Corner", 
      duration: "4:15", 
      mood: "Cozy",
      note: "the track that was on repeat at table four, under the hanging fern, while the rain painted silver streaks on the glass. The coffee was lukewarm, but the room felt infinite.",
      artColor: "#D5BDAF",
      artType: "coffee"
    },
    { 
      title: "Dashboard Dust", 
      artist: "Highways & Horizons", 
      duration: "2:58", 
      mood: "Slow",
      note: "the track we played at 4 AM, driving through the empty coastal tunnel just to hear the bass rattle the dusty dashboard. Headlights pointing into the sweet unknown.",
      artColor: "#FFC2A8",
      artType: "road"
    },
    { 
      title: "Midnight Whispers", 
      artist: "Socks on Linoleum", 
      duration: "3:10", 
      mood: "Intimate",
      note: "the soft acoustic guitar song we hummed on the kitchen floor at 2 AM, waiting for the toaster to pop and the Earl Grey to finish steeping.",
      artColor: "#B5C6C9",
      artType: "moon"
    },
    { 
      title: "October Shore", 
      artist: "The Sea Glass", 
      duration: "5:04", 
      mood: "Mellow",
      note: "the song we listened to through shared headphones on the freezing boardwalk, watching the fog swallow the lighthouse sweep and sand burying our boots.",
      artColor: "#E2CFEA",
      artType: "wave"
    },
    { 
      title: "Cinnamon & Warm Crumb", 
      artist: "Flour Dust Duo", 
      duration: "3:18", 
      mood: "Sweet",
      note: "what played in the background when we burned the first batch of french toast and danced to cover up the smoke alarm.",
      artColor: "#F3D5CA",
      artType: "baking"
    }
  ]

  // Track timer simulation
  useEffect(() => {
    let interval = null
    if (isPlaying) {
      interval = setInterval(() => {
        setSongProgress((prev) => {
          if (prev >= 100) {
            // Loop to next song
            setCurrentSongIndex((curr) => (curr + 1) % songPlaylist.length)
            return 0
          }
          const nextProg = prev + 1
          // update time label
          const totalSeconds = Math.floor((nextProg / 100) * 200)
          const mins = Math.floor(totalSeconds / 60)
          const secs = totalSeconds % 60
          setTrackTime(`0${mins}:${secs < 10 ? '0' : ''}${secs}`)
          return nextProg
        })
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentSongIndex, songPlaylist.length])

  // 🌀 2. Chaos Page State & Board Items
  const [boardItems, setBoardItems] = useState([
    {
      id: 1,
      type: 'sticky',
      color: 'yellow',
      rotation: '-3deg',
      width: '230px',
      text: "Must remember: the secret to her Earl Grey tea is exactly one lavender sprig, stirred clockwise twice. Never rush the steep.",
      date: "Nov 12, '24"
    },
    {
      id: 2,
      type: 'photo',
      rotation: '4deg',
      width: '250px',
      caption: "Misty Harbor lighthouse sweep",
      imageColor: "#748E9E",
      svgStyle: "lighthouse"
    },
    {
      id: 3,
      type: 'sticky',
      color: 'pink',
      rotation: '1.5deg',
      width: '210px',
      text: "Bucket list item #14: Buy train tickets with absolutely no destination in mind, get off at the first station that smells like evergreen pines.",
      date: "Dec 03, '24"
    },
    {
      id: 4,
      type: 'doodle',
      rotation: '-6deg',
      width: '160px',
      svgStyle: "coffee-doodle"
    },
    {
      id: 5,
      type: 'scrap',
      rotation: '-2deg',
      width: '240px',
      text: "Table four napkins: 'If we could freeze a single hour of the year, it would be a wet Tuesday under the ferns.'",
      date: "Jan 18, '25"
    },
    {
      id: 6,
      type: 'sticky',
      color: 'blue',
      rotation: '3.5deg',
      width: '220px',
      text: "The lighthouse keeper waved back at us. Or maybe he was just telling us to get off the wet rocks. Let's believe he waved.",
      date: "Feb 09, '25"
    }
  ])
  const [newNoteText, setNewNoteText] = useState("")
  const [newNoteColor, setNewNoteColor] = useState("yellow")

  const handleAddNote = (e) => {
    e.preventDefault()
    if (!newNoteText.trim()) return
    const newNote = {
      id: Date.now(),
      type: 'sticky',
      color: newNoteColor,
      rotation: `${(Math.random() * 8 - 4).toFixed(1)}deg`,
      width: '220px',
      text: newNoteText,
      date: "Just Now"
    }
    setBoardItems([newNote, ...boardItems])
    setNewNoteText("")
  }

  // 🍭 3. Sweets Page State & Jar Quotes
  const [isFlipped, setIsFlipped] = useState(false)
  const [currentRandomNote, setCurrentRandomNote] = useState("Tap the jar to draw a little fold of warmth...")
  const jarNotes = [
    "You make the quiet, unspectacular days feel like major adventures.",
    "I'm so incredibly glad we exist in the same tiny corner of this infinite timeline.",
    "Thank you for being the person who remembers how I take my tea, and which chord on the guitar buzzes.",
    "My absolute favorite place in the world is sitting right next to you, doing absolutely nothing in wool socks.",
    "I keep a small mental pocketful of your laughter to draw upon on rainy, stressful Tuesdays.",
    "You look exceptionally beautiful when you are animatedly explaining something you love.",
    "I cannot imagine any version of our lives where we didn't buy those impulsive coastal train tickets.",
    "Every burnt brioche toast we made at 2 AM was twice as delicious as a Michelin feast."
  ]

  const handleDrawNote = () => {
    setIsFlipped(true)
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * jarNotes.length)
      setCurrentRandomNote(jarNotes[randomIndex])
    }, 150)
  }

  const sweetsMessages = [
    { author: "Left on mirror", msg: "Have a beautiful morning. The coffee is prepped, just press start. Don't forget your gloves." },
    { author: "Paper napkin", msg: "I noticed you were quiet during the drive. You don't have to carry the whole weight of the sky. I'm here." },
    { author: "Book margin", msg: "I was reading page 84 and the description of the sunlight on the cedar floor reminded me exactly of your laugh." },
    { author: "Text draft", msg: "I saw a dog that looked like a cloud and immediately wanted to send it to you. That's my day in a sentence." },
    { author: "Envelope back", msg: "The salt air suits you. Let's stay on the coast for one more train rotation." },
    { author: "Sticky scrap", msg: "We danced to cassette static in the kitchen. Best song I've ever heard." }
  ]

  // 📓 4. Drafts Page Content
  const draftsNotebook = {
    leftPage: [
      {
        date: "July 14, 2024 — Unsent Letter",
        stamp: "unsent",
        text: "I sat on the train today and watched the scenery shift from dry evergreen pine valleys to the foggy shores. I wanted to write you about the tiny stray cat asleep on the station ticket bin, but I realized I was just searching for an excuse to hear from you. I wrote this instead. I suppose it will stay pressed between these pages..."
      },
      {
        date: "Sept 02, 2024 — Midnight margins",
        stamp: "unfinished",
        text: "There are some things that can't be easily put into words. Like how the kitchen smelled of cold rain and burnt butter, and how the light caught the dust dancing in front of the cupboard. I wanted to say <span class='notebook-crossed-out'>I love you so much</span> but instead I just asked if you wanted another spoonful of honey. Sometimes the silence is safer..."
      }
    ],
    rightPage: [
      {
        date: "Oct 11, 2024 — Coastal train ride",
        stamp: "draft",
        text: "The wind is rattling the old iron windows of the coach car. Sometimes I wonder if we are moving too fast, chasing a horizon that keeps slipping backwards. Or perhaps we are completely still, and it's the scenery that's rushing past us. I think we are just..."
      },
      {
        date: "Nov 30, 2024 — Scratchpad",
        stamp: "unfinished",
        text: "Things left unsaid:<br/>1. I kept the train receipt because it had your doodle of a crescent moon on it.<br/>2. I still listen to the old tape we made even though my player chewing the tape edge.<br/>3. <span class='notebook-crossed-out'>I think we're going to make it.</span> I know we will."
      }
    ]
  }

  // Navigation Helper
  const navigateTo = (pageName) => {
    setCurrentPage(pageName)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="scrapbook-container">
      
      {/* 🧭 Top Navigation Bar */}
      <nav className="top-navbar">
        <div className="navbar-logo" onClick={() => navigateTo('home')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--highlight)" strokeWidth="2" style={{ marginRight: '0.25rem' }}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          Pieces of Us
        </div>
        
        <div className="navbar-links">
          <span className={`navbar-link ${currentPage === 'songs' ? 'active' : ''}`} onClick={() => navigateTo('songs')}>Songs</span>
          <span className={`navbar-link ${currentPage === 'chaos' ? 'active' : ''}`} onClick={() => navigateTo('chaos')}>Chaos</span>
          <span className={`navbar-link ${currentPage === 'sweets' ? 'active' : ''}`} onClick={() => navigateTo('sweets')}>Sweets</span>
          <span className={`navbar-link ${currentPage === 'drafts' ? 'active' : ''}`} onClick={() => navigateTo('drafts')}>Drafts</span>
        </div>
        
        <div className="navbar-actions">
          <button 
            className="navbar-icon-btn theme-toggle-btn" 
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? "Switch to Warm Light Theme" : "Switch to Low-Light Dark Theme"}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="18.36" x2="5.64" y2="16.93"></line>
                <line x1="18.36" y1="4.22" x2="19.78" y2="5.64"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Floating Leaves background decorations */}
      <div className="floating-leaf" style={{ top: '15%', left: '3%', width: '60px' }}>
        <svg viewBox="0 0 100 100" fill="none" stroke="var(--bone)" strokeWidth="3">
          <path d="M10,80 Q50,40 90,20 M50,40 Q40,60 30,80 M60,30 Q70,50 80,70" />
        </svg>
      </div>
      <div className="floating-leaf" style={{ top: '65%', right: '4%', width: '50px' }}>
        <svg viewBox="0 0 100 100" fill="none" stroke="var(--bone)" strokeWidth="3">
          <path d="M10,20 Q50,60 90,80 M50,60 Q60,40 70,20 M40,70 Q30,50 20,30" />
        </svg>
      </div>

      {/* 🏡 0. HOMEPAGE SCREEN */}
      {currentPage === 'home' && (
        <>
          <header className="main-header">
            <div className="label-caps" style={{ marginBottom: '1rem' }}>Harvey & Mony</div>
            <h1 className="header-title">Pieces of Us</h1>
            <p className="header-subtitle">
              "A digital collection of quiet moments, handwritten scraps, and late-night soundtracks."
            </p>
          </header>

          {/* Editorial Introduction */}
          <section className="intro-section">
            <div className="intro-content">
              <p className="intro-quote script-text" style={{ fontSize: '2.45rem', color: 'var(--highlight)', marginBottom: '1.5rem' }}>
                "We collect these quiet fragments so we don't forget how the morning light felt..."
              </p>
              <p className="chapter-paragraph" style={{ margin: '0 auto', textAlign: 'center', fontSize: '1.1rem' }}>
                This website is an act of preservation. An archive of the small, unnoticed beats of our lives together—the songs we replayed until they wore thin, the coffee corners we claimed, the ticket stubs we couldn't throw away, and the late-night kitchen talks.
              </p>
            </div>
          </section>

          {/* CHAPTER 1 PREVIEW: THE SOUNDTRACK */}
          <hr className="chapter-divider" />
          <section className="chapter-section">
            <div className="chapter-grid">
              
              <div className="chapter-image-container">
                <div className="polaroid">
                  <div className="polaroid-img-frame">
                    <img 
                      src={soundtrackImg} 
                      alt="The Soundtrack - Record Player" 
                      className="chapter-cover-img" 
                    />
                  </div>
                  <div className="polaroid-caption">August '24 — dashboard dusk</div>
                </div>
              </div>

              <div className="chapter-text-container">
                <div className="label-caps">SOUNDTRACK</div>
                <h2 className="chapter-title">Songs We Played in the Dark</h2>
                
                <div className="accent-card">
                  <span className="script-text" style={{ color: 'var(--highlight)', display: 'block', marginBottom: '0.5rem' }}>
                    "And in that quiet beat, we found our rhythm..."
                  </span>
                  <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--muted-text)' }}>
                    A handpicked list of tracks that defined our summers, our drives, and the silence in between.
                  </p>
                </div>

                <p className="chapter-paragraph">
                  These are the tracks that still smell like highway rain, dust dancing in warm headlights, and the quiet comfort of driving with nowhere to go. They were taped off the radio or queued up in half-asleep shifts.
                </p>
                
                <button className="cta-button" onClick={() => navigateTo('songs')}>
                  Listen in
                </button>
              </div>

            </div>
          </section>

          {/* CHAPTER 2 PREVIEW: THE COFFEE SHOP CORNER */}
          <hr className="chapter-divider" />
          <section className="chapter-section">
            <div className="chapter-grid alt">

              <div className="chapter-text-container">
                <div className="label-caps">Bitter</div>
                <h2 className="chapter-title">Hours Lost in Ceramic Mugs</h2>
                
                <div className="accent-card">
                  <span className="script-text" style={{ color: 'var(--highlight)', display: 'block', marginBottom: '0.5rem' }}>
                    "Table four, under the hanging fern, where time stood still..."
                  </span>
                  <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--muted-text)' }}>
                    We came for the espresso, but we stayed for the rain against the glass and the secrets scribbled on paper napkins.
                  </p>
                </div>

                <p className="chapter-paragraph">
                  We wrote our grandest plans on stained paper napkins using a leaking pen. It was in that cozy corner where we figured out how to slow down, watching the world stream past outside the foggy windowpane.
                </p>
                
                <button className="cta-button" onClick={() => navigateTo('chaos')}>
                  Read the napkins
                </button>
              </div>

              <div className="chapter-image-container">
                <div className="circular-collage">
                  <img 
                    src={chaosImg} 
                    alt="Chapter 2 - Chaos Moodboard" 
                    className="chapter-cover-img" 
                  />
                </div>
              </div>

            </div>
          </section>

          {/* CHAPTER 3 PREVIEW: SWEETS */}
          <hr className="chapter-divider" />
          <section className="chapter-section">
            <div className="chapter-grid">
              
              <div className="chapter-image-container">
                <div className="polaroid" style={{ transform: 'rotate(2.5deg)' }}>
                  <div className="polaroid-img-frame">
                    <img 
                      src={sweetsImg} 
                      alt="Chapter 3 - Sweets Folded Notes Jar" 
                      className="chapter-cover-img" 
                    />
                  </div>
                  <div className="polaroid-caption">A jar of quiet folded warmth</div>
                </div>
              </div>

              <div className="chapter-text-container">
                <div className="label-caps">SWEETS</div>
                <h2 className="chapter-title">Folded Notes & Sweet Reminders</h2>
                
                <div className="accent-card">
                  <span className="script-text" style={{ color: 'var(--highlight)', display: 'block', marginBottom: '0.5rem' }}>
                    "The smallest notes carry the most weight when they come from you..."
                  </span>
                  <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--muted-text)' }}>
                    Gentle reminders, soft compliments, and tiny gestures left behind on mirrors, napkins, and book margins.
                  </p>
                </div>

                <p className="chapter-paragraph">
                  Little scraps tucked into coat pockets, sticky notes left on the coffee machine, and folded letters meant to make rainy days softer. A jar of reminders that you are cherished.
                </p>
                
                <button className="cta-button" onClick={() => navigateTo('sweets')}>
                  Read the sweet notes
                </button>
              </div>

            </div>
          </section>

          {/* CHAPTER 4 PREVIEW: DRAFTS */}
          <hr className="chapter-divider" />
          <section className="chapter-section">
            <div className="chapter-grid alt">

              <div className="chapter-text-container">
                <div className="label-caps">DRAFTS</div>
                <h2 className="chapter-title">The Unfinished Pages</h2>
                
                <div className="accent-card">
                  <span className="script-text" style={{ color: 'var(--highlight)', display: 'block', marginBottom: '0.5rem' }}>
                    "I wanted to tell you about the rain today... how the light caught the dust dancing..."
                  </span>
                  <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--muted-text)' }}>
                    Raw, unpolished, and honest unsent letters, midnight margin thoughts, and scratchpad scribbles.
                  </p>
                </div>

                <p className="chapter-paragraph">
                  Things left unsaid, quiet reflections recorded on late journeys, and sentences abandoned halfway because the feeling was already understood between us.
                </p>
                
                <button className="cta-button" onClick={() => navigateTo('drafts')}>
                  Open the unfinished pages
                </button>
              </div>

              <div className="chapter-image-container">
                <div className="polaroid" style={{ transform: 'rotate(-2deg)' }}>
                  <div className="polaroid-img-frame">
                    <img 
                      src={draftsImg} 
                      alt="Chapter 4 - Drafts Notebook & Unsent Letters" 
                      className="chapter-cover-img" 
                    />
                  </div>
                  <div className="polaroid-caption">Unsent pages & late margins</div>
                </div>
              </div>

            </div>
          </section>
        </>
      )}

      {/* 🎵 1. INDIVIDUAL SONGS PAGE */}
      {currentPage === 'songs' && (
        <div className="songs-page-container">
          <div className="breadcrumb-container">
            <span className="breadcrumb-back" onClick={() => navigateTo('home')}>
              ← Back to Pieces of Us
            </span>
          </div>

          <div className="main-header" style={{ padding: '2rem 0 3rem 0', borderBottom: '1px dashed var(--bone)' }}>
            <div className="label-caps">Our favorite songs</div>
            <h1 className="header-title" style={{ fontSize: '3.5rem' }}>The Soundtrack</h1>
            <p className="header-subtitle">"Every moment we shared has its own groove, pressed in dusty wax."</p>
          </div>

          {/* Embedded Player Bar */}
          <div className="embedded-player-bar">
            <div className="player-track-info">
              <div className="player-album-art">
                {/* Dynamic mini SVG based on active song */}
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                  <rect width="100" height="100" fill={songPlaylist[currentSongIndex].artColor} />
                  <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="10" />
                  <circle cx="50" cy="50" r="8" fill="var(--parchment)" />
                </svg>
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--dark-text)' }}>{songPlaylist[currentSongIndex].title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>{songPlaylist[currentSongIndex].artist} • <span className="label-caps" style={{ fontSize: '0.65rem' }}>{songPlaylist[currentSongIndex].mood}</span></p>
              </div>
            </div>

            <div className="player-progress-container">
              <span>{trackTime}</span>
              <div 
                className="player-progress-bar"
                onClick={(e) => {
                  const bar = e.currentTarget
                  const rect = bar.getBoundingClientRect()
                  const percent = Math.floor(((e.clientX - rect.left) / rect.width) * 100)
                  setSongProgress(percent)
                }}
              >
                <div className="player-progress-fill" style={{ width: `${songProgress}%` }}></div>
              </div>
              <span>{songPlaylist[currentSongIndex].duration}</span>
            </div>

            <div className="player-controls">
              <button 
                className="navbar-icon-btn" 
                onClick={() => {
                  setCurrentSongIndex((prev) => (prev - 1 + songPlaylist.length) % songPlaylist.length)
                  setIsPlaying(true)
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h2v12H6zm3.5 6L18 18V6z"/>
                </svg>
              </button>
              
              <button className="play-pause-btn" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '3px' }}>
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              <button 
                className="navbar-icon-btn" 
                onClick={() => {
                  setCurrentSongIndex((prev) => (prev + 1) % songPlaylist.length)
                  setIsPlaying(true)
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 18l8.5-6L6 6zm9-12v12h2V6z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Playlist grid */}
          <div className="songs-grid">
            {songPlaylist.map((song, idx) => (
              <div 
                key={idx} 
                className={`song-card ${idx === currentSongIndex ? 'playing' : ''}`}
                onClick={() => {
                  setCurrentSongIndex(idx)
                  setIsPlaying(true)
                }}
              >
                <div className="song-card-album-art">
                  {/* Custom SVG Album Arts for beautiful visual layout */}
                  <svg viewBox="0 0 200 200" fill="none" style={{ width: '100%', height: '100%' }}>
                    <rect width="200" height="200" fill={song.artColor} />
                    
                    {song.artType === "tape" && (
                      <g stroke="var(--dark-text)" strokeWidth="4" fill="none">
                        <rect x="35" y="60" width="130" height="80" rx="8" fill="rgba(255,255,255,0.2)"/>
                        <circle cx="70" cy="100" r="15" />
                        <circle cx="130" cy="100" r="15" />
                        <line x1="70" y1="100" x2="130" y2="100" />
                      </g>
                    )}

                    {song.artType === "coffee" && (
                      <g stroke="var(--dark-text)" strokeWidth="4" fill="none">
                        <path d="M50,130 Q100,160 150,130" />
                        <path d="M70,120 C70,70 130,70 130,120" fill="rgba(255,255,255,0.2)"/>
                        <path d="M130,90 Q150,90 150,105 Q150,120 130,120" />
                        <path d="M90,50 Q100,30 95,15" strokeWidth="2"/>
                        <path d="M110,50 Q120,30 115,15" strokeWidth="2"/>
                      </g>
                    )}

                    {song.artType === "road" && (
                      <g stroke="var(--dark-text)" strokeWidth="3" fill="none">
                        <path d="M30,150 L100,50 L170,150" fill="rgba(255,255,255,0.15)"/>
                        <line x1="100" y1="50" x2="100" y2="150" strokeDasharray="6 6"/>
                        <circle cx="100" cy="50" r="8" fill="var(--highlight)"/>
                      </g>
                    )}

                    {song.artType === "moon" && (
                      <g fill="none" stroke="var(--dark-text)" strokeWidth="4">
                        <circle cx="100" cy="100" r="60" fill="rgba(255,255,255,0.1)"/>
                        <path d="M110,70 A30,30 0 1,0 130,110 A40,40 0 1,1 110,70" fill="var(--dark-text)"/>
                      </g>
                    )}

                    {song.artType === "wave" && (
                      <g stroke="var(--dark-text)" strokeWidth="4" fill="none">
                        <path d="M20,110 C50,80 80,140 110,110 C140,80 170,140 200,110" />
                        <path d="M20,130 C50,100 80,160 110,130 C140,100 170,160 200,130" opacity="0.5"/>
                        <circle cx="150" cy="60" r="18" fill="rgba(255,255,255,0.3)" stroke="none"/>
                      </g>
                    )}

                    {song.artType === "baking" && (
                      <g stroke="var(--dark-text)" strokeWidth="4" fill="none">
                        <ellipse cx="100" cy="120" rx="55" ry="25" fill="rgba(255,255,255,0.2)"/>
                        <path d="M70,110 Q100,70 130,110 Q100,120 70,110" fill="var(--almond-cream)"/>
                        <circle cx="100" cy="112" r="4" fill="var(--highlight)" />
                      </g>
                    )}
                  </svg>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="label-caps" style={{ fontSize: '0.65rem' }}>{song.mood}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted-text)', fontWeight: 'bold' }}>{song.duration}</span>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--dark-text)', marginTop: '0.25rem' }}>{song.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontStyle: 'italic' }}>by {song.artist}</p>
                  
                  <p className="song-handwritten-note script-text" style={{ fontSize: '1.35rem', color: 'var(--highlight)', lineHeight: '1.2' }}>
                    "{song.note}"
                  </p>
                </div>
                
                {idx === currentSongIndex && isPlaying && (
                  <div style={{ position: 'absolute', bottom: '15px', right: '15px', width: '20px', height: '20px', display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
                    <div style={{ width: '3px', background: 'var(--highlight)', animation: 'spin 1.2s ease-in-out infinite alternate', height: '100%' }}></div>
                    <div style={{ width: '3px', background: 'var(--highlight)', animation: 'spin 0.8s ease-in-out infinite alternate', height: '60%' }}></div>
                    <div style={{ width: '3px', background: 'var(--highlight)', animation: 'spin 1s ease-in-out infinite alternate', height: '80%' }}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🌀 2. INDIVIDUAL CHAOS PAGE */}
      {currentPage === 'chaos' && (
        <div className="songs-page-container">
          <div className="breadcrumb-container">
            <span className="breadcrumb-back" onClick={() => navigateTo('home')}>
              ← Back to Pieces of Us
            </span>
          </div>

          <div className="main-header" style={{ padding: '2rem 0 3rem 0', borderBottom: '1px dashed var(--bone)' }}>
            <div className="label-caps">Bitter Moments</div>
            <h1 className="header-title" style={{ fontSize: '3.5rem' }}>The Messy Board</h1>
            <p className="header-subtitle">"Doodles on napkins, sticky memos, overlapping paper. Chaos preserved."</p>
          </div>

          {/* Interactive Input Pin Widget */}
          <div className="pin-input-container">
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', marginBottom: '1rem', textAlign: 'center' }}>
              Pin a new scrap to the wall
            </h3>
            <form className="pin-form" onSubmit={handleAddNote}>
              <textarea 
                className="pin-textarea"
                placeholder="Write a little memory, a list item, or an unsaid thought..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                maxLength={200}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="pin-color-picker">
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--muted-text)' }}>Color:</span>
                  <span 
                    className={`color-option ${newNoteColor === 'yellow' ? 'selected' : ''}`}
                    style={{ backgroundColor: '#FAF2D5' }}
                    onClick={() => setNewNoteColor('yellow')}
                  />
                  <span 
                    className={`color-option ${newNoteColor === 'pink' ? 'selected' : ''}`}
                    style={{ backgroundColor: '#F8E1E1' }}
                    onClick={() => setNewNoteColor('pink')}
                  />
                  <span 
                    className={`color-option ${newNoteColor === 'blue' ? 'selected' : ''}`}
                    style={{ backgroundColor: '#E2ECF5' }}
                    onClick={() => setNewNoteColor('blue')}
                  />
                </div>
                <button type="submit" className="cta-button" style={{ padding: '0.5rem 1.25rem', fontSize: '0.75rem' }}>
                  Pin Thought
                </button>
              </div>
            </form>
          </div>

          {/* Collage Board */}
          <div className="chaos-board">
            <div className="cork-texture"></div>
            <div className="board-grid">
              
              {boardItems.map((item) => (
                <div 
                  key={item.id} 
                  className="board-item"
                  style={{ 
                    transform: `rotate(${item.rotation})`, 
                    width: window.innerWidth >= 768 ? item.width : '100%',
                    gridColumnEnd: item.type === 'photo' ? 'span 1' : 'auto'
                  }}
                >
                  {/* Pushpin design overlay */}
                  <div className="pushpin"></div>

                  {/* 1. STICKY NOTE ITEM */}
                  {item.type === 'sticky' && (
                    <div className={`sticky-note-item ${item.color}`}>
                      <p className="script-text sticky-note-text" style={{ fontSize: '1.5rem', lineHeight: '1.25' }}>
                        "{item.text}"
                      </p>
                      <div className="sticky-note-footer">
                        <span className="sticky-note-meta" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Scrap note</span>
                        <span className="sticky-note-meta" style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>{item.date}</span>
                      </div>
                    </div>
                  )}

                  {/* 2. PHOTO ITEM */}
                  {item.type === 'photo' && (
                    <div className="polaroid" style={{ transform: 'none', maxWidth: '100%' }}>
                      <div className="polaroid-img-frame" style={{ aspectRatio: '1.1' }}>
                        {item.svgStyle === 'lighthouse' && (
                          <svg viewBox="0 0 200 180" fill="none" style={{ width: '100%', height: '100%' }}>
                            <rect width="200" height="180" fill="#2E3740" />
                            {/* Sea */}
                            <rect x="0" y="110" width="200" height="70" fill="#1C242B" />
                            {/* Moon and light sweep */}
                            <circle cx="150" cy="50" r="14" fill="#E8DCD0" />
                            <path d="M35 80 L160 62 L160 68 Z" fill="#FFE2C4" opacity="0.25" />
                            {/* Lighthouse outline */}
                            <rect x="30" y="70" width="12" height="40" fill="#E8DCD0" />
                            <rect x="28" y="110" width="16" height="6" fill="#A94A4A" />
                            <polygon points="30,70 36,55 42,70" fill="#1C242B" />
                            {/* Light bulb */}
                            <circle cx="36" cy="64" r="3" fill="#FFE2C4" />
                          </svg>
                        )}
                      </div>
                      <div className="polaroid-caption" style={{ fontSize: '1.35rem', bottom: '0.5rem' }}>
                        {item.caption}
                      </div>
                    </div>
                  )}

                  {/* 3. DOODLE ITEM */}
                  {item.type === 'doodle' && (
                    <div className="doodle-item">
                      {item.svgStyle === 'coffee-doodle' && (
                        <svg viewBox="0 0 100 100" style={{ width: '80px', height: '80px', stroke: 'var(--highlight)', strokeWidth: '2.5', fill: 'none' }}>
                          <path d="M20,60 C20,30 80,30 80,60 Q80,80 50,85 Q20,80 20,60" />
                          <path d="M80,45 Q95,45 95,55 Q95,65 80,65" />
                          <path d="M35,25 Q40,10 38,5" />
                          <path d="M50,25 Q55,10 53,5" />
                          <path d="M65,25 Q70,10 68,5" />
                        </svg>
                      )}
                    </div>
                  )}

                  {/* 4. TORN SCRAPBOOK SCRAP */}
                  {item.type === 'scrap' && (
                    <div className="taped-scrap" style={{ transform: 'none', padding: '1.25rem', maxWidth: '100%' }}>
                      <div className="scotch-tape" style={{ width: '70px', height: '18px', top: '-10px' }}></div>
                      <p className="script-text" style={{ fontSize: '1.45rem', color: 'var(--muted-text)', textAlign: 'center' }}>
                        "{item.text}"
                      </p>
                      <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--highlight)', marginTop: '0.5rem', textTransform: 'uppercase' }}>
                        {item.date}
                      </div>
                    </div>
                  )}

                </div>
              ))}

            </div>
          </div>
        </div>
      )}

      {/* 🍭 3. INDIVIDUAL SWEETS PAGE */}
      {currentPage === 'sweets' && (
        <div className="sweets-page-container">
          <div className="breadcrumb-container">
            <span className="breadcrumb-back" onClick={() => navigateTo('home')}>
              ← Back to Pieces of Us
            </span>
          </div>

          <div className="main-header" style={{ padding: '2rem 0 3rem 0', borderBottom: '1px dashed var(--bone)' }}>
            <div className="label-caps">Sweet Moments</div>
            <h1 className="header-title" style={{ fontSize: '3.5rem' }}>The Jar of Notes</h1>
            <p className="header-subtitle">"A clean grid of folded notes, and an old jar holding quiet kindnesses."</p>
          </div>

          <div className="sweets-interactive-section">
            {/* Left: Jar Illustration & CTA to draw */}
            <div className="jar-drawing-container">
              <div style={{ width: '220px', height: '300px', position: 'relative' }}>
                {/* Vintage Jar Drawing SVG */}
                <svg viewBox="0 0 200 280" style={{ width: '100%', height: '100%' }}>
                  {/* Jar body glass outline */}
                  <rect x="30" y="50" width="140" height="210" rx="40" ry="40" fill="rgba(255,255,255,0.25)" stroke="var(--bone)" strokeWidth="4" />
                  {/* Jar neck */}
                  <rect x="60" y="25" width="80" height="25" rx="5" fill="rgba(255,255,255,0.2)" stroke="var(--bone)" strokeWidth="3" />
                  {/* Glass lid */}
                  <path d="M70,25 Q100,5 130,25 Z" fill="none" stroke="var(--bone)" strokeWidth="3" />
                  {/* Cute string wrapping */}
                  <path d="M60,38 Q100,45 140,38" fill="none" stroke="var(--highlight)" strokeWidth="2.5" />
                  <path d="M60,42 Q100,48 140,42" fill="none" stroke="var(--highlight)" strokeWidth="2.5" />
                  {/* Little folded notes visual inside jar */}
                  <rect x="50" y="140" width="45" height="25" rx="3" fill="#FAF2D5" stroke="rgba(0,0,0,0.06)" transform="rotate(15 50 140)" />
                  <rect x="110" y="160" width="45" height="25" rx="3" fill="#F8E1E1" stroke="rgba(0,0,0,0.06)" transform="rotate(-25 110 160)" />
                  <rect x="75" y="190" width="50" height="28" rx="3" fill="#E2ECF5" stroke="rgba(0,0,0,0.06)" transform="rotate(5 75 190)" />
                  <rect x="70" y="100" width="45" height="25" rx="3" fill="#FAF5EE" stroke="rgba(0,0,0,0.06)" transform="rotate(-10 70 100)" />
                  {/* Glass reflection streaks */}
                  <path d="M45,90 Q40,160 45,210" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                  <path d="M155,90 Q160,160 155,210" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
                  {/* Tag Label */}
                  <rect x="65" y="125" width="70" height="35" rx="4" fill="var(--linen)" stroke="var(--almond-silk)" strokeWidth="1.5" />
                  <text x="100" y="140" fontSize="8" fill="var(--dark-text)" textAnchor="middle" fontWeight="bold" letterSpacing="0.05em">SWEET NOTES</text>
                  <text x="100" y="152" fontSize="6" fill="var(--highlight)" textAnchor="middle" fontStyle="italic">drawer edition</text>
                </svg>
              </div>
              
              <button 
                className="cta-button"
                onClick={handleDrawNote}
                style={{ backgroundColor: 'var(--almond-silk)' }}
              >
                Draw a sweet note
              </button>
            </div>

            {/* Right: 3D Flip Card Showing Result */}
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
                <div className="flip-card-inner">
                  
                  {/* Front (Cover) */}
                  <div className="flip-card-front" onClick={handleDrawNote} style={{ cursor: 'pointer' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--highlight)" strokeWidth="1.5" style={{ marginBottom: '1rem' }}>
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', marginBottom: '0.25rem' }}>Folded Affection</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Click "Draw" to unfold a message
                    </p>
                  </div>

                  {/* Back (Revealed Note) */}
                  <div className="flip-card-back">
                    <span className="script-text" style={{ fontSize: '1.95rem', color: 'var(--flip-quote-color)', lineHeight: '1.3', textAlign: 'center' }}>
                      "{currentRandomNote}"
                    </span>
                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                      <button 
                        className="cta-button" 
                        style={{ padding: '0.4rem 1rem', fontSize: '0.7rem', backgroundColor: 'var(--bone)', color: 'var(--dark-text)' }}
                        onClick={() => setIsFlipped(false)}
                      >
                        Fold back
                      </button>
                      <button 
                        className="cta-button" 
                        style={{ padding: '0.4rem 1rem', fontSize: '0.7rem' }}
                        onClick={handleDrawNote}
                      >
                        Draw another
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '2px dotted var(--bone)', margin: '3rem 0' }}></div>

          {/* Grid of Note Cards */}
          <div className="sweets-grid">
            {sweetsMessages.map((item, index) => (
              <div key={index} className="folded-letter-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="label-caps" style={{ fontSize: '0.65rem' }}>MEMO CARD</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--highlight)', fontStyle: 'italic' }}>
                    {item.author}
                  </span>
                </div>
                <p className="script-text" style={{ fontSize: '1.55rem', lineHeight: '1.3', color: 'var(--dark-text)' }}>
                  "{item.msg}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📓 4. INDIVIDUAL DRAFTS PAGE */}
      {currentPage === 'drafts' && (
        <div className="songs-page-container">
          <div className="breadcrumb-container">
            <span className="breadcrumb-back" onClick={() => navigateTo('home')}>
              ← Back to Pieces of Us
            </span>
          </div>

          <div className="main-header" style={{ padding: '2rem 0 3rem 0', borderBottom: '1px dashed var(--bone)' }}>
            <div className="label-caps">Random Thoughts</div>
            <h1 className="header-title" style={{ fontSize: '3.5rem' }}>The Open Notebook</h1>
            <p className="header-subtitle">"Desaturated tones, scratched sentences, cut-off lines. Raw thoughts left unsent."</p>
          </div>

          {/* Open Notebook Layout Spread */}
          <div className="notebook-spread">
            <div className="notebook-spine"></div>
            <div className="notebook-page-layout">
              
              {/* Left Column (Page 1) */}
              <div className="notebook-column">
                {draftsNotebook.leftPage.map((entry, index) => (
                  <div key={index} className="notebook-entry">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="notebook-date">{entry.date}</span>
                      <span className="unsent-stamp">{entry.stamp}</span>
                    </div>
                    {/* Render text with crossed out styling intact */}
                    <p 
                      className="notebook-text"
                      dangerouslySetInnerHTML={{ __html: `"${entry.text}"` }}
                    />
                  </div>
                ))}
              </div>

              {/* Right Column (Page 2) */}
              <div className="notebook-column">
                {draftsNotebook.rightPage.map((entry, index) => (
                  <div key={index} className="notebook-entry">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="notebook-date">{entry.date}</span>
                      <span className="unsent-stamp" style={{ borderColor: entry.stamp === 'draft' ? '#8CAC9C' : '#BC8C8C', color: entry.stamp === 'draft' ? '#8CAC9C' : '#BC8C8C' }}>
                        {entry.stamp}
                      </span>
                    </div>
                    <p 
                      className="notebook-text"
                      dangerouslySetInnerHTML={{ __html: `"${entry.text}"` }}
                    />
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Consistent Footer */}
      <footer className="main-footer">
        <div className="footer-script script-text">Pieces of us</div>
        <p style={{ fontSize: '0.75rem', color: 'var(--highlight)', marginTop: '0.5rem' }}>
          Digital Memories of Harvey & Mony
        </p>
      </footer>

    </div>
  )
}

export default App

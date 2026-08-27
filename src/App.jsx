import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { supabase } from './supabaseClient'
import soundtrackImg from './images/Soundtracks.jpg'
import chaosImg from './images/Chaos.jpg'
import sweetsImg from './images/Sweets.jpg'
import draftsImg from './images/Drafts.jpg'
import track1 from './audio/flatline.mp3'
import track2 from './audio/htimylm.mp3'
import track3 from './audio/perfect.mp3'
import track4 from './audio/sweet.mp3'
import track5 from './audio/tothebone.mp3'
import track6 from './audio/untilyou.mp3'

gsap.registerPlugin(ScrollTrigger)

const songPlaylist = [
  { 
    title: "Flatline", 
    artist: "Justin Bieber", 
    audioSrc: track1,
    mood: "Nostalgic",
    note: "the song that played when we got caught in that sudden July storm. We shared a single jacket and hid under the old theater awning, completely soaked and laughing.",
    artColor: "#EAD5C5",
    artType: "tape"
  },
  { 
    title: "hate that i made you love me", 
    artist: "Ariana Grande", 
    audioSrc: track2,
    mood: "Cozy",
    note: "the track that was on repeat at table four, under the hanging fern, while the rain painted silver streaks on the glass. The coffee was lukewarm, but the room felt infinite.",
    artColor: "#D5BDAF",
    artType: "coffee"
  },
  { 
    title: "Perfect", 
    artist: "Ed Sheeran", 
    audioSrc: track3,
    mood: "Slow",
    note: "the track we played at 4 AM, driving through the empty coastal tunnel just to hear the bass rattle the dusty dashboard. Headlights pointing into the sweet unknown.",
    artColor: "#FFC2A8",
    artType: "road"
  },
  { 
    title: "Sweet", 
    artist: "Cigarettes After Sex", 
    audioSrc: track4,
    mood: "Intimate",
    note: "the soft acoustic guitar song we hummed on the kitchen floor at 2 AM, waiting for the toaster to pop and the Earl Grey to finish steeping.",
    artColor: "#B5C6C9",
    artType: "moon"
  },
  { 
    title: "To The Bone", 
    artist: "Pamungkas", 
    audioSrc: track5,
    mood: "Mellow",
    note: "the song we listened to through shared headphones on the freezing boardwalk, watching the fog swallow the lighthouse sweep and sand burying our boots.",
    artColor: "#E2CFEA",
    artType: "wave"
  },
  { 
    title: "Until You", 
    artist: "Shayne Ward", 
    audioSrc: track6,
    mood: "Sweet",
    note: "what played in the background when we burned the first batch of french toast and danced to cover up the smoke alarm.",
    artColor: "#F3D5CA",
    artType: "baking"
  }
]

const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds) || timeInSeconds === Infinity || timeInSeconds === null || timeInSeconds === undefined) return "00:00"
  const mins = Math.floor(timeInSeconds / 60)
  const secs = Math.floor(timeInSeconds % 60)
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`
}

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

  // 🔐 Auth / Session State
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loginSubmitting, setLoginSubmitting] = useState(false)
  const loginBoxRef = useRef(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ✨ GSAP: soft entrance for the login card
  useEffect(() => {
    if (!authLoading && !session && loginBoxRef.current) {
      gsap.fromTo(
        loginBoxRef.current,
        { opacity: 0, y: 20, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power2.out' }
      )
    }
  }, [authLoading, session])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError("")
    setLoginSubmitting(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword
    })
    if (error) {
      setLoginError(error.message || "Couldn't log in. Please check your email and password.")
    }
    setLoginSubmitting(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setCurrentPage('home')
  }

  // 🎵 1. Songs Page State & Playlists
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [songProgress, setSongProgress] = useState(0) // percentage
  const [trackTime, setTrackTime] = useState("00:00")
  const [audioDuration, setAudioDuration] = useState("00:00")
  const [songDurations, setSongDurations] = useState({})
  const [audioError, setAudioError] = useState(false)

  // Preload durations for song cards
  useEffect(() => {
    songPlaylist.forEach((song, idx) => {
      const audio = new Audio(song.audioSrc)
      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setSongDurations((prev) => ({
            ...prev,
            [idx]: formatTime(audio.duration)
          }))
        }
      }
    })
  }, [])

  // Handle play / pause and track switching
  useEffect(() => {
    if (!audioRef.current) return
    setAudioError(false)
    if (isPlaying) {
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Audio playback interrupted or failed:", err)
        })
      }
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, currentSongIndex])

  // Audio Event Handlers
  const handleTimeUpdate = () => {
    if (!audioRef.current) return
    const current = audioRef.current.currentTime
    const dur = audioRef.current.duration
    if (dur && !isNaN(dur) && dur > 0) {
      setSongProgress((current / dur) * 100)
    }
    setTrackTime(formatTime(current))
  }

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return
    const dur = audioRef.current.duration
    if (dur && !isNaN(dur)) {
      const formatted = formatTime(dur)
      setAudioDuration(formatted)
      setSongDurations((prev) => ({
        ...prev,
        [currentSongIndex]: formatted
      }))
    }
  }

  const handleSongEnded = () => {
    setCurrentSongIndex((prev) => (prev + 1) % songPlaylist.length)
    setIsPlaying(true)
  }

  const handleAudioError = () => {
    setAudioError(true)
    setIsPlaying(false)
  }

  const handleProgressClick = (e) => {
    if (!audioRef.current) return
    const bar = e.currentTarget
    const rect = bar.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width
    if (width <= 0) return
    const percentage = Math.max(0, Math.min(1, clickX / width))
    const dur = audioRef.current.duration
    if (dur && !isNaN(dur) && isFinite(dur)) {
      const newTime = percentage * dur
      audioRef.current.currentTime = newTime
      setSongProgress(percentage * 100)
      setTrackTime(formatTime(newTime))
    }
  }

  // 🌀 2. Chaos Page State & Board Items
  const [boardItems, setBoardItems] = useState([])
  const [chaosLoading, setChaosLoading] = useState(true)
  const [deletingIds, setDeletingIds] = useState([])
  const [newNoteText, setNewNoteText] = useState("")
  const [newNoteColor, setNewNoteColor] = useState("yellow")

  // Fetch chaos notes once logged in
  useEffect(() => {
    if (!session) return

    const fetchChaosNotes = async () => {
      setChaosLoading(true)
      try {
        const { data, error } = await supabase
          .from('chaos_notes')
          .select('*')
          .order('created_at', { ascending: true })

        if (error) throw error

        const mapped = (data || []).map((row) => ({
          id: row.id,
          type: 'sticky',
          shape: row.shape_variant || 'classic',
          color: row.color || 'yellow',
          rotation: row.rotation || '0deg',
          width: row.width || '220px',
          text: row.text,
          date: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: '2-digit' })
        }))

        setBoardItems(mapped)
      } catch (err) {
        console.error("Failed to fetch chaos notes:", err)
      } finally {
        setChaosLoading(false)
      }
    }

    fetchChaosNotes()
  }, [session])

  // ✨ GSAP: stagger the board in once it finishes loading
  useEffect(() => {
    if (!chaosLoading && boardItems.length > 0) {
      gsap.fromTo(
        '.board-item',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaosLoading])

  const handleDeleteNote = async (id) => {
    setDeletingIds((prev) => [...prev, id])
    setTimeout(async () => {
      setBoardItems((prev) => prev.filter((item) => item.id !== id))
      setDeletingIds((prev) => prev.filter((delId) => delId !== id))
      try {
        const { error } = await supabase.from('chaos_notes').delete().eq('id', id)
        if (error) throw error
      } catch (err) {
        console.error("Failed to delete chaos note:", err)
      }
    }, 250)
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!newNoteText.trim()) return

    const shapeVariants = ['classic', 'torn', 'taped']
    const randomShape = shapeVariants[Math.floor(Math.random() * shapeVariants.length)]
    const randomWidth = `${Math.floor(Math.random() * (260 - 190 + 1)) + 190}px`
    const randomAngle = (Math.random() * 13 - 6.5).toFixed(1)
    const randomRotation = `${randomAngle === '0.0' ? '2.5' : randomAngle}deg`

    const optimisticId = `temp-${Date.now()}`
    const optimisticNote = {
      id: optimisticId,
      type: 'sticky',
      shape: randomShape,
      color: newNoteColor,
      rotation: randomRotation,
      width: randomWidth,
      text: newNoteText,
      date: "Just Now"
    }
    setBoardItems([optimisticNote, ...boardItems])
    setNewNoteText("")

    // ✨ GSAP: little pop-in for the newly pinned note
    requestAnimationFrame(() => {
      const el = document.querySelector('.board-item')
      if (el) {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.7 },
          { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.8)' }
        )
      }
    })

    try {
      const { data, error } = await supabase
        .from('chaos_notes')
        .insert({
          text: optimisticNote.text,
          color: optimisticNote.color,
          rotation: optimisticNote.rotation,
          width: optimisticNote.width,
          shape_variant: optimisticNote.shape
        })
        .select()
        .single()

      if (error) throw error

      // Swap the optimistic temp id for the real Supabase id
      setBoardItems((prev) =>
        prev.map((item) => (item.id === optimisticId ? { ...item, id: data.id, date: "Just Now" } : item))
      )
    } catch (err) {
      console.error("Failed to save chaos note:", err)
    }
  }

  // 🍭 3. Sweets Page State & Jar Quotes
  const [isFlipped, setIsFlipped] = useState(false)
  const [currentRandomNote, setCurrentRandomNote] = useState("Tap the jar to draw a little fold of warmth...")
  const [jarNotes, setJarNotes] = useState([])
  const [newSweetNote, setNewSweetNote] = useState("")
  const [isDroppingNote, setIsDroppingNote] = useState(false)
  const [dropSuccessMsg, setDropSuccessMsg] = useState("")
  const jarCounterRef = useRef(null)

  useEffect(() => {
    if (!session) return

    const fetchSweets = async () => {
      try {
        const { data, error } = await supabase
          .from('sweets_jar_notes')
          .select('*')
          .order('created_at', { ascending: true })

        if (error) throw error

        setJarNotes((data || []).map((row) => row.text))
      } catch (err) {
        console.error("Failed to fetch sweets data:", err)
      }
    }

    fetchSweets()
  }, [session])

  // ✨ GSAP: gentle pulse on the jar counter whenever it changes
  useEffect(() => {
    if (jarCounterRef.current) {
      gsap.fromTo(
        jarCounterRef.current,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      )
    }
  }, [jarNotes.length])

  const handleDrawNote = () => {
    setIsFlipped(true)
    setTimeout(() => {
      if (jarNotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * jarNotes.length)
        setCurrentRandomNote(jarNotes[randomIndex])
      } else {
        setCurrentRandomNote("The jar is empty for now...")
      }
    }, 150)
  }

  const handleSaveSweetNote = async (e) => {
    e.preventDefault()
    const trimmed = newSweetNote.trim()
    if (!trimmed) return

    setIsDroppingNote(true)
    try {
      const { data, error } = await supabase
        .from('sweets_jar_notes')
        .insert({ text: trimmed })
        .select()
        .single()

      if (error) throw error

      // Immediately add to the jar pool so it can be drawn right away
      setJarNotes((prev) => [...prev, data.text])
      setNewSweetNote("")
      setDropSuccessMsg("Dropped into the jar ✦")
      setTimeout(() => setDropSuccessMsg(""), 2500)
    } catch (err) {
      console.error("Failed to save sweet note:", err)
      setDropSuccessMsg("Something went wrong... try again.")
      setTimeout(() => setDropSuccessMsg(""), 2500)
    } finally {
      setIsDroppingNote(false)
    }
  }

  // 📓 4. Drafts Page — Drawing Canvas State
  const sketchCanvasRef = useRef(null)
  const isDrawingRef = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const [drawingTool, setDrawingTool] = useState('pen') // 'pen' | 'eraser'
  const [brushColor, setBrushColor] = useState('#2E2A27')
  const [brushSize, setBrushSize] = useState(3)
  const [canvasHistory, setCanvasHistory] = useState([]) // array of imageData URLs for undo

  const [savedSketches, setSavedSketches] = useState([])
  const [sketchesLoading, setSketchesLoading] = useState(true)
  const [savingSketch, setSavingSketch] = useState(false)

  useEffect(() => {
    if (!session) return

    const fetchSketches = async () => {
      setSketchesLoading(true)
      try {
        const { data, error } = await supabase
          .from('drafts_entries')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        const mapped = (data || []).map((row) => ({
          id: row.id,
          dataUrl: row.text,
          date: row.date_label
        }))

        setSavedSketches(mapped)
      } catch (err) {
        console.error("Failed to fetch saved sketches:", err)
      } finally {
        setSketchesLoading(false)
      }
    }

    fetchSketches()
  }, [session])

  // ✨ GSAP: stagger saved sketches in once they finish loading
  useEffect(() => {
    if (!sketchesLoading && savedSketches.length > 0) {
      gsap.fromTo(
        '.sketch-item',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sketchesLoading])

  const PALETTE_COLORS = [
    { label: 'Charcoal Ink', value: '#2E2A27' },
    { label: 'Almond Rose', value: '#B59C8D' },
    { label: 'Terracotta', value: '#A0522D' },
    { label: 'Indigo', value: '#4A5568' },
    { label: 'Olive', value: '#6B7B3A' },
    { label: 'Sunset Blush', value: '#C4857A' },
    { label: 'Cream White', value: '#F5EBE0' },
  ]

  const BRUSH_SIZES = [
    { label: 'Fine', value: 1.5 },
    { label: 'Medium', value: 3 },
    { label: 'Bold', value: 6 },
    { label: 'Marker', value: 14 },
  ]

  const getCanvasPos = (canvas, e) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    }
  }

  const snapshotCanvas = () => {
    const canvas = sketchCanvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL()
    setCanvasHistory(prev => [...prev.slice(-19), dataUrl]) // Keep last 20 states
  }

  const startDrawing = (e) => {
    e.preventDefault()
    const canvas = sketchCanvasRef.current
    if (!canvas) return
    snapshotCanvas()
    isDrawingRef.current = true
    lastPosRef.current = getCanvasPos(canvas, e)
  }

  const draw = (e) => {
    e.preventDefault()
    if (!isDrawingRef.current) return
    const canvas = sketchCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const pos = getCanvasPos(canvas, e)

    ctx.beginPath()
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = drawingTool === 'eraser' ? '#FFFFFF' : brushColor
    ctx.lineWidth = drawingTool === 'eraser' ? brushSize * 5 : brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalCompositeOperation = drawingTool === 'eraser' ? 'destination-out' : 'source-over'
    ctx.stroke()

    lastPosRef.current = pos
  }

  const stopDrawing = (e) => {
    if (e) e.preventDefault()
    isDrawingRef.current = false
  }

  const handleUndo = () => {
    const canvas = sketchCanvasRef.current
    if (!canvas || canvasHistory.length === 0) return
    const ctx = canvas.getContext('2d')
    const prev = canvasHistory[canvasHistory.length - 1]
    setCanvasHistory(h => h.slice(0, -1))
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = 'source-over'
      ctx.drawImage(img, 0, 0)
    }
    img.src = prev
  }

  const handleClearCanvas = () => {
    const canvas = sketchCanvasRef.current
    if (!canvas) return
    snapshotCanvas()
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleSaveSketch = async () => {
    const canvas = sketchCanvasRef.current
    if (!canvas) return

    setSavingSketch(true)

    // Flatten onto white background for saving
    const offscreen = document.createElement('canvas')
    offscreen.width = canvas.width
    offscreen.height = canvas.height
    const oc = offscreen.getContext('2d')
    oc.fillStyle = '#FAF7F2'
    oc.fillRect(0, 0, offscreen.width, offscreen.height)
    oc.drawImage(canvas, 0, 0)
    const dataUrl = offscreen.toDataURL('image/jpeg', 0.8)

    const dateLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: '2-digit' })

    // Optimistic local add so it feels instant
    const optimisticId = `temp-${Date.now()}`
    setSavedSketches((prev) => [{ id: optimisticId, dataUrl, date: dateLabel }, ...prev])

    // ✨ GSAP: pop-in for the newly saved sketch
    requestAnimationFrame(() => {
      const el = document.querySelector('.sketch-item')
      if (el) {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.85 },
          { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)' }
        )
      }
    })

    // Clear the canvas right away
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setCanvasHistory([])

    try {
      const { data, error } = await supabase
        .from('drafts_entries')
        .insert({
          page: 'left', // fixed value — this view no longer splits left/right pages
          date_label: dateLabel,
          stamp: 'sketch',
          text: dataUrl
        })
        .select()
        .single()

      if (error) throw error

      // Swap the optimistic temp id for the real Supabase id
      setSavedSketches((prev) =>
        prev.map((s) => (s.id === optimisticId ? { ...s, id: data.id } : s))
      )
    } catch (err) {
      console.error("Failed to save sketch to Supabase:", err)
    } finally {
      setSavingSketch(false)
    }
  }

  const handleDeleteSketch = async (id) => {
    setSavedSketches((prev) => prev.filter((s) => s.id !== id))
    try {
      const { error } = await supabase.from('drafts_entries').delete().eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error("Failed to delete sketch:", err)
    }
  }

  // Initialize canvas on mount / when drafts page is shown
  useEffect(() => {
    if (currentPage !== 'drafts') return
    const canvas = sketchCanvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
  }, [currentPage])

  // Navigation Helper
  const navigateTo = (pageName) => {
    setCurrentPage(pageName)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ✨ GSAP: refs + effects for the homepage hero and page-level transitions
  const pageContentRef = useRef(null)
  const heroLabelRef = useRef(null)
  const heroTitleRef = useRef(null)
  const heroSubtitleRef = useRef(null)

  // Soft fade + rise whenever the visible page changes
  useEffect(() => {
    if (!session || authLoading) return
    if (pageContentRef.current) {
      gsap.fromTo(
        pageContentRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      )
    }
  }, [currentPage, session, authLoading])

  // Hero entrance, only on the homepage
  useEffect(() => {
    if (currentPage !== 'home' || !session) return
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
    tl.fromTo(heroLabelRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 })
      .fromTo(heroTitleRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55 }, '-=0.2')
      .fromTo(heroSubtitleRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
  }, [currentPage, session])

  // Scroll-reveal for each chapter section on the homepage
  useEffect(() => {
    if (currentPage !== 'home' || !session) return

    const sections = gsap.utils.toArray('.chapter-section')
    const tweens = sections.map((section) =>
      gsap.fromTo(
        section,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    )

    return () => {
      tweens.forEach((tw) => tw.scrollTrigger && tw.scrollTrigger.kill())
    }
  }, [currentPage, session])

  // Stagger the song cards in when landing on the Songs page
  useEffect(() => {
    if (currentPage !== 'songs' || !session) return
    gsap.fromTo(
      '.song-card',
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power2.out' }
    )
  }, [currentPage, session])

  // 🔐 Auth loading state — avoid flashing login screen before session check resolves
  if (authLoading) {
    return (
      <div className="scrapbook-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p className="script-text" style={{ fontSize: '1.8rem', color: 'var(--highlight)' }}>Opening the archive...</p>
      </div>
    )
  }

  // 🔐 Login Gate
  if (!session) {
    return (
      <div className="scrapbook-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
        <div ref={loginBoxRef} style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div className="label-caps" style={{ marginBottom: '1rem' }}>Private Archive</div>
          <h1 className="header-title" style={{ fontSize: '2.75rem', marginBottom: '0.5rem' }}>Pieces of Us</h1>
          <p className="header-subtitle" style={{ marginBottom: '2.5rem' }}>
            A quiet, shared space. Log in to step inside.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            <div>
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-text)', display: 'block', marginBottom: '0.4rem' }}>
                Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="pin-textarea"
                style={{ minHeight: 'unset', padding: '0.75rem 1rem' }}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-text)', display: 'block', marginBottom: '0.4rem' }}>
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="pin-textarea"
                style={{ minHeight: 'unset', padding: '0.75rem 1rem' }}
                placeholder="••••••••"
              />
            </div>

            {loginError && (
              <p style={{ color: '#BC8C8C', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>
                {loginError}
              </p>
            )}

            <button type="submit" className="cta-button" disabled={loginSubmitting} style={{ marginTop: '0.5rem' }}>
              {loginSubmitting ? "Opening..." : "Enter"}
            </button>
          </form>
        </div>
      </div>
    )
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

          <button
            className="navbar-icon-btn"
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
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

      {/* ✨ GSAP: wrapping page content so it can fade/rise on every navigation */}
      <div ref={pageContentRef} key={currentPage}>

      {/* 🏡 0. HOMEPAGE SCREEN */}
      {currentPage === 'home' && (
        <>
          <header className="main-header">
            <div ref={heroLabelRef} className="label-caps" style={{ marginBottom: '1rem' }}>Harvey & Mony</div>
            <h1 ref={heroTitleRef} className="header-title">Pieces of Us</h1>
            <p ref={heroSubtitleRef} className="header-subtitle">
              "A digital collection of quiet moments, handwritten scraps, and late-night soundtracks."
            </p>
          </header>

          {/* Editorial Introduction */}
          <section className="intro-section">
            <div className="intro-content">
              <p className="intro-quote script-text" style={{ fontSize: '2.45rem', color: 'var(--highlight)', marginBottom: '1.5rem' }}>
                "A quiet home for the things we couldn't throw away."
              </p>
              <p className="chapter-paragraph" style={{ margin: '0 auto', textAlign: 'center', fontSize: '1.1rem' }}>
                This space holds the beats of our life together. The songs that defined our moments, the sweet times worth keeping, the arguments that taught us lessons, and the raw drafts of our thoughts.
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
                <h2 className="chapter-title">Songs We Sang</h2>
                
                <div className="accent-card">
                  <span className="script-text" style={{ color: 'var(--highlight)', display: 'block', marginBottom: '0.5rem' }}>
                    "Singing along without a care..."
                  </span>
                  <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--muted-text)' }}>
                    Loud choruses, late-night drives, and shared headphones.
                  </p>
                </div>

                <p className="chapter-paragraph">
                  Every song here carries a memory. They are the tunes we played until we knew every word and sang together whenever they came on.
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
                <h2 className="chapter-title">Cold Coffee & Hard Silence</h2>
                
                <div className="accent-card">
                  <span className="script-text" style={{ color: 'var(--highlight)', display: 'block', marginBottom: '0.5rem' }}>
                    " When things got heavy.... " 
                  </span>
                  <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--muted-text)' }}>
                    The arguments that left a mark.
                  </p>
                </div>

                <p className="chapter-paragraph">
                  A real record of us—the bad times, the misunderstandings, and the bitter moments we eventualy outgrew.
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
                  Not every sweet moment needs a big gesture. Sometimes it’s just a folded napkin, a favorite book quote, or a quick note left before leaving the house. This jar holds all those little written pieces of us.
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
          <audio
            ref={audioRef}
            src={songPlaylist[currentSongIndex].audioSrc}
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleSongEnded}
            onError={handleAudioError}
            style={{ display: 'none' }}
          />

          <div className="breadcrumb-container">
            <span className="breadcrumb-back" onClick={() => navigateTo('home')}>
              ← Back to Pieces of Us
            </span>
          </div>

          <div className="main-header" style={{ padding: '2rem 0 3rem 0', borderBottom: '1px dashed var(--bone)' }}>
            <div className="label-caps">Our favorite songs</div>
            <h1 className="header-title" style={{ fontSize: '3.5rem' }}>The Soundtrack</h1>
            <p className="header-subtitle">"Press play to go back to how it felt."</p>
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
                {audioError && (
                  <span style={{ fontSize: '0.75rem', color: '#BC8C8C', fontStyle: 'italic', display: 'block', marginTop: '2px' }}>
                    Audio unavailable
                  </span>
                )}
              </div>
            </div>

            <div className="player-progress-container">
              <span>{trackTime}</span>
              <div 
                className="player-progress-bar"
                onClick={handleProgressClick}
              >
                <div className="player-progress-fill" style={{ width: `${songProgress}%` }}></div>
              </div>
              <span>{audioError ? "--:--" : (songDurations[currentSongIndex] || audioDuration || "--:--")}</span>
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
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted-text)', fontWeight: 'bold' }}>
                      {songDurations[idx] || "--:--"}
                    </span>
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
            <p className="header-subtitle">"Because saving our story means keeping the imperfect parts, too."</p>
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

            {chaosLoading ? (
              <div className="board-empty-state">
                <div className="empty-state-card">
                  <p className="script-text empty-state-text">Loading the board...</p>
                </div>
              </div>
            ) : boardItems.length === 0 ? (
              <div className="board-empty-state">
                <div className="empty-state-card">
                  <div className="pushpin"></div>
                  <p className="script-text empty-state-text">
                    "The board is empty. Pin your first thought above."
                  </p>
                  <span className="empty-state-subtext">
                    Scattered thoughts, memories, and scrap notes will appear here.
                  </span>
                </div>
              </div>
            ) : (
              <div className="board-grid">
                {boardItems.map((item) => {
                  const isDeleting = deletingIds.includes(item.id)
                  return (
                    <div 
                      key={item.id} 
                      className={`board-item ${isDeleting ? 'deleting' : ''}`}
                      style={{ 
                        transform: `rotate(${item.rotation})`, 
                        maxWidth: item.width || '240px',
                        width: '100%',
                        gridColumnEnd: item.type === 'photo' ? 'span 1' : 'auto'
                      }}
                    >
                      {/* Delete button per note */}
                      <button 
                        className="note-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteNote(item.id)
                        }}
                        title="Remove scrap"
                        aria-label="Remove scrap"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>

                      {/* Pushpin design overlay (not used for taped shape) */}
                      {item.shape !== 'taped' && <div className="pushpin"></div>}

                      {/* 1. STICKY NOTE ITEM */}
                      {item.type === 'sticky' && (
                        <div className={`sticky-note-item ${item.color || 'yellow'} shape-${item.shape || 'classic'}`}>
                          {item.shape === 'taped' && <div className="note-washi-tape"></div>}
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
                  )
                })}

              </div>
            )}
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

          {/* Sweet Note Drop Form */}
          <div className="sweet-note-container">
            <div className="label-caps" style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Write a sweet note</div>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted-text)', textAlign: 'center', marginBottom: '1.5rem', fontStyle: 'italic' }}>
              Tuck a little warmth into the jar — it will be drawn randomly later.
            </p>
            <form className="sweet-note-form" onSubmit={handleSaveSweetNote}>
              <textarea
                className="sweet-note-textarea"
                placeholder="Write something sweet here... a reminder, a little love note, a memory..."
                value={newSweetNote}
                onChange={(e) => setNewSweetNote(e.target.value)}
                maxLength={300}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <span ref={jarCounterRef} className="sweet-jar-counter">
                  {jarNotes.length > 0
                    ? `${jarNotes.length} note${jarNotes.length === 1 ? '' : 's'} in the jar`
                    : 'The jar is empty — be the first to drop one in'}
                </span>
                <button
                  type="submit"
                  className="cta-button"
                  disabled={isDroppingNote || !newSweetNote.trim()}
                  style={{ backgroundColor: 'var(--almond-silk)' }}
                >
                  {isDroppingNote ? 'Dropping...' : 'Save & drop to jar'}
                </button>
              </div>
            </form>
            {dropSuccessMsg && (
              <div className="drop-toast">
                <span className="script-text" style={{ fontSize: '1.35rem' }}>{dropSuccessMsg}</span>
              </div>
            )}
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
            <p className="header-subtitle">"Draw your thoughts on the page. Scratch them out. Let them breathe."</p>
          </div>

          {/* Drawing Canvas Area */}
          <div className="sketch-canvas-container">

            {/* Drawing Toolbar */}
            <div className="drawing-toolbar">

              {/* Tool: Pen / Eraser */}
              <div className="toolbar-group">
                <button
                  className={`tool-button ${drawingTool === 'pen' ? 'active' : ''}`}
                  onClick={() => setDrawingTool('pen')}
                  title="Pen"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                  <span>Pen</span>
                </button>
                <button
                  className={`tool-button ${drawingTool === 'eraser' ? 'active' : ''}`}
                  onClick={() => setDrawingTool('eraser')}
                  title="Eraser"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 20H7L3 16l11-11 6 6z"/><line x1="6" y1="14" x2="14" y2="6"/>
                  </svg>
                  <span>Eraser</span>
                </button>
              </div>

              {/* Color Palette */}
              <div className="toolbar-group">
                {PALETTE_COLORS.map((c) => (
                  <button
                    key={c.value}
                    className={`palette-swatch ${brushColor === c.value && drawingTool === 'pen' ? 'selected' : ''}`}
                    style={{ backgroundColor: c.value, border: c.value === '#F5EBE0' ? '1.5px solid var(--bone)' : 'none' }}
                    onClick={() => { setBrushColor(c.value); setDrawingTool('pen') }}
                    title={c.label}
                  />
                ))}
              </div>

              {/* Brush Sizes */}
              <div className="toolbar-group">
                {BRUSH_SIZES.map((b) => (
                  <button
                    key={b.value}
                    className={`brush-size-btn ${brushSize === b.value ? 'active' : ''}`}
                    onClick={() => setBrushSize(b.value)}
                    title={b.label}
                  >
                    <span style={{ width: `${Math.min(b.value * 2.5, 14)}px`, height: `${Math.min(b.value * 2.5, 14)}px`, borderRadius: '50%', backgroundColor: 'currentColor', display: 'block' }} />
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="toolbar-group" style={{ marginLeft: 'auto' }}>
                <button
                  className="tool-button"
                  onClick={handleUndo}
                  disabled={canvasHistory.length === 0}
                  title="Undo"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
                  </svg>
                  <span>Undo</span>
                </button>
                <button
                  className="tool-button"
                  onClick={handleClearCanvas}
                  title="Clear page"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                  <span>Clear</span>
                </button>
                <button
                  className="tool-button save-btn"
                  onClick={handleSaveSketch}
                  disabled={savingSketch}
                  title="Save to Notebook"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                  </svg>
                  <span>{savingSketch ? 'Saving...' : 'Save to Notebook'}</span>
                </button>
              </div>

            </div>

            {/* The actual drawing canvas */}
            <canvas
              ref={sketchCanvasRef}
              className="sketch-canvas"
              style={{ cursor: drawingTool === 'eraser' ? 'cell' : 'crosshair' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />

          </div>

          {/* Saved Sketches in Notebook Spread */}
          <div style={{ borderTop: '2px dotted var(--bone)', margin: '3rem 0' }}></div>
          <div className="label-caps" style={{ textAlign: 'center', marginBottom: '2rem' }}>Saved sketches</div>

          {sketchesLoading ? (
            <p className="script-text" style={{ textAlign: 'center', fontSize: '1.3rem', color: 'var(--highlight)' }}>
              Loading the notebook...
            </p>
          ) : savedSketches.length === 0 ? (
            <p className="script-text" style={{ textAlign: 'center', fontSize: '1.3rem', color: 'var(--muted-text)' }}>
              "This notebook is still blank... draw something above."
            </p>
          ) : (
            <div className="sketch-grid">
              {savedSketches.map((sketch) => (
                <div key={sketch.id} className="sketch-item">
                  <button
                    className="note-delete-btn"
                    onClick={() => handleDeleteSketch(sketch.id)}
                    title="Remove sketch"
                    aria-label="Remove sketch"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                  <img src={sketch.dataUrl} alt="Saved sketch" className="sketch-img" />
                  <div className="sketch-stamp">{sketch.date}</div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      </div>
      {/* end ✨ page-content wrapper */}


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

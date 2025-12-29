import './App.css'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { StickyNote, Calendar, Plus, X, Settings, ExternalLink } from 'lucide-react'

interface UrlCard {
  id: string
  name: string
  url: string
  icon: string
}

function App() {
  const [time, setTime] = useState('')
  const [period, setPeriod] = useState('')
  const [date, setDate] = useState('')
  const [backgroundImage, setBackgroundImage] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [cards, setCards] = useState<UrlCard[]>([
    { id: '1', name: 'Notion', url: 'https://www.notion.so/', icon: 'StickyNote' },
    { id: '2', name: 'Calendar', url: 'https://calendar.google.com/calendar/u/0', icon: 'Calendar' },
  ])

  useEffect(() => {
    // Load saved cards from localStorage
    const savedCards = localStorage.getItem('urlCards')
    if (savedCards) {
      setCards(JSON.parse(savedCards))
    }

    // Load random background from assets folder
    const loadRandomBackground = async () => {
      try {
        const images = import.meta.glob('/src/assets/**/*.{png,jpg,jpeg,webp}')
        const imagePaths = Object.keys(images)

        if (imagePaths.length > 0) {
          const randomImage = imagePaths[Math.floor(Math.random() * imagePaths.length)]
          const imageModule = await images[randomImage]() as { default: string }
          setBackgroundImage(imageModule.default)
        }
      } catch (error) {
        console.log('No background images found')
      }
    }

    loadRandomBackground()

    // Update time in IST with 12-hour format
    const updateTime = () => {
      const now = new Date()
      const istOffset = 5.5 * 60 * 60 * 1000
      const istTime = new Date(now.getTime() + istOffset)

      let hours = istTime.getUTCHours()
      const minutes = istTime.getUTCMinutes()

      const ampm = hours >= 12 ? 'PM' : 'AM'
      hours = hours % 12
      hours = hours ? hours : 12

      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      setTime(timeString)
      setPeriod(ampm)

      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
      }
      setDate(istTime.toLocaleDateString('en-US', options))
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  const openUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const renderIcon = (iconName: string) => {
    const iconProps = { className: "w-7 h-7 text-white/70", strokeWidth: 1.5 }

    switch (iconName) {
      case 'StickyNote':
        return <StickyNote {...iconProps} />
      case 'Calendar':
        return <Calendar {...iconProps} />
      case 'ExternalLink':
        return <ExternalLink {...iconProps} />
      default:
        return <ExternalLink {...iconProps} />
    }
  }

  const deleteCard = (id: string) => {
    const updatedCards = cards.filter(card => card.id !== id)
    setCards(updatedCards)
    localStorage.setItem('urlCards', JSON.stringify(updatedCards))
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Background Image */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            filter: 'brightness(0.55) contrast(1.1) saturate(1.1)',
          }}
        />
      )}

      {/* Blue Gradient Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top right, rgba(0, 73, 209, 0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(0, 73, 209, 0.08) 0%, transparent 50%)',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 h-full">
        {/* Top Left - Time Widget */}
        <div className="absolute top-8 left-8">
          <div
            className="glass rounded-2xl px-5 py-3 backdrop-blur-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div className="flex items-baseline gap-1.5">
              <div className="text-4xl font-light tracking-tight text-white">
                {time}
              </div>
              <div className="text-lg font-medium text-white/50">
                {period}
              </div>
            </div>
            <div className="text-[11px] font-medium tracking-wide text-white/40 mt-0.5">
              {date}
            </div>
          </div>
        </div>

        {/* Top Right - Settings Button */}
        <div className="absolute top-8 right-8">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="glass rounded-full p-3 backdrop-blur-2xl hover:bg-white/10 transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Settings className="w-5 h-5 text-white/70" strokeWidth={1.5} />
          </button>
        </div>

        {/* Bottom Right - URL Cards */}
        <div className="absolute bottom-8 right-8">
          <div className="flex flex-wrap gap-3 justify-end max-w-md">
            {cards.map((card) => (
              <div key={card.id} className="relative group">
                <Card
                  onClick={() => openUrl(card.url)}
                  className="w-24 h-24 p-0 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all duration-200"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0, 73, 209, 0.1)'
                  }}
                >
                  <div className="mb-1.5">{renderIcon(card.icon)}</div>
                  <span className="text-[10px] font-medium tracking-wide text-white/60">
                    {card.name}
                  </span>
                </Card>
                {showSettings && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteCard(card.id)
                    }}
                    className="absolute -top-2 -right-2 bg-red-500/90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" strokeWidth={2.5} />
                  </button>
                )}
              </div>
            ))}

            {showSettings && (
              <Card
                onClick={() => {
                  const name = prompt('Enter name:')
                  const url = prompt('Enter URL:')
                  if (name && url) {
                    const newCard: UrlCard = {
                      id: Date.now().toString(),
                      name,
                      url,
                      icon: 'ExternalLink'
                    }
                    const updatedCards = [...cards, newCard]
                    setCards(updatedCards)
                    localStorage.setItem('urlCards', JSON.stringify(updatedCards))
                  }
                }}
                className="w-24 h-24 p-0 flex items-center justify-center cursor-pointer hover:scale-105 transition-all duration-200"
                style={{
                  background: 'rgba(0, 73, 209, 0.15)',
                  border: '1.5px dashed rgba(0, 73, 209, 0.4)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <Plus className="w-8 h-8 text-blue-400/70" strokeWidth={1.5} />
              </Card>
            )}
          </div>
        </div>

        {/* Bottom - Subtle Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <div className="w-1 h-1 rounded-full" style={{ background: '#0049D1', opacity: 0.3 }} />
          <div className="w-1 h-1 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  )
}

export default App

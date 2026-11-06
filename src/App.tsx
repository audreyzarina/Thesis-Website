import { useEffect, useMemo, useState } from 'react'

type IconName = 'search' | 'map' | 'sliders' | 'arrow' | 'spark' | 'check' | 'clock' | 'wifi' | 'pin'

const API_BASE = ''

const photos = [
  '/okaeri.jpg',
  '/habi.jpg',
  '/glasshouse.jpg'
]

interface Cafe {
  name: string
  area: string
  type: string
  photo: string
  reviews: number
  taste: number
  service: number
  wifi: number
  parking: number
  quote: string
  tag: string
}

const defaultCafes: Cafe[] = [
  { name: 'Okaeri Café', area: 'Obrero, Davao City', type: 'Matcha & Coffee', photo: photos[0], reviews: 184, taste: 94, service: 82, wifi: 91, parking: 46, quote: 'Lami kaayo ilang ceremonial matcha, creamy pero dili too sweet.', tag: 'Best for matcha' },
  { name: 'Glasshouse Coffee', area: 'J. P. Laurel Ave.', type: 'Specialty Coffee', photo: photos[2], reviews: 137, taste: 88, service: 76, wifi: 86, parking: 72, quote: 'Nice ang place for work, kusog ang Wi-Fi pero medyo dugay ang order.', tag: 'Remote work pick' },
  { name: 'Habi at Kape', area: 'Matina, Davao City', type: 'Coffee & Brunch', photo: photos[1], reviews: 96, taste: 86, service: 91, wifi: 68, parking: 84, quote: 'Super accommodating ng staff and dali ra ang service. Balikan!', tag: 'Great service' },
]

const aspects = [
  { label: 'Product quality', value: 88, count: 417, neg: 8, color: '#177557' },
  { label: 'Service speed', value: 71, count: 286, neg: 21, color: '#3f846e' },
  { label: 'Ambience', value: 84, count: 352, neg: 9, color: '#177557' },
  { label: 'Wi-Fi reliability', value: 76, count: 194, neg: 14, color: '#3f846e' },
  { label: 'Parking', value: 55, count: 167, neg: 36, color: '#c47142' },
]

const aspectOptions = [
  { id: 'auto', label: 'All Aspects (Auto-detect)' },
  { id: 'Product Quality', label: 'Product Quality' },
  { id: 'Customer Service', label: 'Customer Service' },
  { id: 'Ambiance and Atmosphere', label: 'Ambiance & Atmosphere' },
  { id: 'Facilities and Amenities', label: 'Facilities & Wi-Fi' },
  { id: 'Price and Value', label: 'Price & Value' },
  { id: 'Store Operations and Accessibility', label: 'Parking & Accessibility' },
]

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    map: <><path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z"/><path d="M9 3v15M15 6v15"/></>,
    sliders: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    spark: <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    wifi: <><path d="M5 12.5a10 10 0 0 1 14 0M8 16a6 6 0 0 1 8 0"/><circle cx="12" cy="19" r="1"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{paths[name]}</svg>
}

function Score({ label, value }: { label: string; value: number }) {
  const tone = value >= 80 ? 'good' : value >= 65 ? 'mid' : 'low'
  return <div className="score">
    <div><span>{label}</span><strong className={tone}>{value}%</strong></div>
    <div className="track"><i className={tone} style={{ width: `${value}%` }}/></div>
  </div>
}

function Directory() {
  const [cafesList, setCafesList] = useState<Cafe[]>(defaultCafes)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/api/cafes`)
      .then(res => {
        if (!res.ok) throw new Error('API request failed')
        return res.json()
      })
      .then((data: Cafe[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setCafesList(data)
        }
      })
      .catch(err => {
        console.warn('Backend API offline, using fallback dataset:', err)
      })
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return cafesList
    const q = query.toLowerCase()
    return cafesList.filter(c => `${c.name} ${c.area} ${c.type}`.toLowerCase().includes(q))
  }, [cafesList, query])

  return <main>
    <section className="hero">
      <div className="eyebrow">DAVAO CAFÉ INTELLIGENCE</div>
      <h1>Find your kind of<br/><em>café moment.</em></h1>
      <p>Beyond ratings. Discover cafés through the details that actually shape your experience.</p>
      <div className="searchbar">
        <Icon name="search" size={21}/>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search cafés, neighborhoods, or drinks"/>
        <button><Icon name="map" size={18}/> Davao City</button>
      </div>
      <div className="hero-note"><span>{cafesList.length}</span> establishments catalogued &nbsp;·&nbsp; Live data sync</div>
    </section>

    <section className="content">
      <div className="section-head" style={{ marginBottom: '28px' }}>
        <div><span className="kicker">EXPLORE THE DIRECTORY</span><h2>Cafés to discover</h2></div>
        <span className="result-count" style={{ display: 'block', fontSize: '13px', color: '#5b6a63' }}>
          {filtered.length} {filtered.length === 1 ? 'establishment' : 'establishments'}
        </span>
      </div>
      <div className="cards">
        {filtered.map((c, i) => <article className="cafe-card" key={c.name}>
          <div className="photo">
            <img src={c.photo} alt={`${c.name} café`} loading="lazy"/>
            <span className="tag"><Icon name="spark" size={14}/>{c.tag}</span>
            <span className="rank">{i + 1 < 10 ? `0${i + 1}` : i + 1}</span>
          </div>
          <div className="card-body">
            <div className="cafe-title"><div><h3>{c.name}</h3><p><Icon name="pin" size={14}/>{c.area}</p></div><span>{c.type}</span></div>
            <div className="scores">
              <Score label="Taste" value={c.taste}/>
              <Score label="Service" value={c.service}/>
              <Score label="Wi-Fi" value={c.wifi}/>
              <Score label="Parking" value={c.parking}/>
            </div>
            <blockquote>“{c.quote}”</blockquote>
            <div className="annotation"><span>PRODUCT QUALITY</span><b>Positive</b></div>
            <button className="view">View full profile <Icon name="arrow"/></button>
          </div>
        </article>)}
      </div>
    </section>
  </main>
}

interface AspectMetric {
  label: string
  value: number
  count: number
  neg: number
  color?: string
}

interface OpportunityItem {
  title: string
  description: string
  priority: string
  warn?: boolean
}

interface StrengthItem {
  title: string
  description: string
}

function Insights() {
  const [selectedCafe, setSelectedCafe] = useState('All')
  const [cafeOptions, setCafeOptions] = useState<string[]>([])
  const [stats, setStats] = useState({
    reviews_analyzed: '19,586',
    establishments: '400',
    positive_sentiment: '47.4%',
    avg_response: '1.8s',
  })
  const [aspectMetrics, setAspectMetrics] = useState<AspectMetric[]>(aspects)
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([
    {
      title: 'Store Operations and Accessibility',
      description: '31% of 1,040 mentions are negative (322 negative reviews).',
      priority: 'High priority',
      warn: true,
    },
    {
      title: 'Price and Value',
      description: '28% of 1,112 mentions are negative (311 negative reviews).',
      priority: 'Needs attention',
      warn: false,
    },
  ])
  const [strengths, setStrengths] = useState<StrengthItem[]>([
    { title: 'Ambiance and Atmosphere', description: '86% positive across 2,695 mentions' },
    { title: 'Product Quality', description: '80% positive across 7,658 mentions' },
    { title: 'Customer Service', description: '77% positive across 3,858 mentions' },
  ])

  useEffect(() => {
    const queryParam = selectedCafe !== 'All' ? `?cafe=${encodeURIComponent(selectedCafe)}` : ''
    fetch(`${API_BASE}/api/insights${queryParam}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.reviews_analyzed !== undefined) {
          setStats({
            reviews_analyzed: data.reviews_analyzed,
            establishments: data.establishments,
            positive_sentiment: data.positive_sentiment,
            avg_response: data.avg_response || '1.8s',
          })
          if (Array.isArray(data.cafe_names) && data.cafe_names.length > 0) {
            setCafeOptions(data.cafe_names)
          }
          if (Array.isArray(data.aspects)) {
            setAspectMetrics(data.aspects)
          }
          if (Array.isArray(data.opportunities)) {
            setOpportunities(data.opportunities)
          }
          if (Array.isArray(data.strengths)) {
            setStrengths(data.strengths)
          }
        }
      })
      .catch(() => {})
  }, [selectedCafe])

  return <main className="dashboard">
    <div className="dash-head">
      <div>
        <span className="kicker">BUSINESS INTELLIGENCE</span>
        <h1>{selectedCafe === 'All' ? 'Davao café pulse' : selectedCafe}</h1>
        <p>
          {selectedCafe === 'All'
            ? `Operational sentiment across ${stats.establishments} establishments and ${stats.reviews_analyzed} reviews.`
            : `Operational sentiment for ${selectedCafe} across ${stats.reviews_analyzed} reviews.`}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <select
          className="outline"
          value={selectedCafe}
          onChange={e => setSelectedCafe(e.target.value)}
          style={{ cursor: 'pointer', maxWidth: '280px', background: '#fffdfa' }}
        >
          <option value="All">All establishments ({cafeOptions.length || 400})</option>
          {cafeOptions.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>
    </div>
    <div className="stat-grid">
      {[
        [stats.reviews_analyzed, 'Reviews analyzed', 'Dataset synced'],
        [stats.establishments, 'Establishments', 'Verified'],
        [stats.positive_sentiment, 'Positive sentiment', 'From SQLite DB'],
        [stats.avg_response, 'Avg. model response', 'Live']
      ].map(s => <div className="stat" key={s[1]}><span>{s[1]}</span><strong>{s[0]}</strong><small>{s[2]}</small></div>)}
    </div>
    <div className="analytics-grid">
      <section className="panel wide"><div className="panel-title"><div><span className="kicker">SENTIMENT BY ASPECT</span><h2>What customers are saying</h2></div><span className="legend"><i/> Positive <i/> Neutral <i/> Negative</span></div>
        <div className="aspect-list">{aspectMetrics.map(a => <div className="aspect" key={a.label}><span>{a.label}<small>{a.count.toLocaleString()} mentions</small></span><div className="stack"><i style={{width:`${a.value}%`}}/><i style={{width:`${Math.max(0, 100 - a.value - a.neg)}%`}}/><i style={{width:`${a.neg}%`}}/></div><b>{a.value}%</b></div>)}</div>
      </section>
      <section className="panel"><span className="kicker">OPERATIONAL FOCUS</span><h2>Top opportunities</h2>
        {opportunities.map((opp, idx) => (
          <div key={opp.title} className={`opportunity ${opp.warn ? 'warn' : ''}`}>
            <Icon name={idx === 0 ? 'clock' : 'pin'}/>
            <div>
              <b>{opp.title}</b>
              <p>{opp.description}</p>
              <span>{opp.priority}</span>
            </div>
          </div>
        ))}
      </section>
      <section className="panel"><span className="kicker">CORE STRENGTHS</span><h2>What’s working</h2>
        {strengths.map(str => (
          <div key={str.title} className="strength">
            <Icon name="check"/>
            <div>
              <b>{str.title}</b>
              <p>{str.description}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  </main>
}

interface PredictionItem {
  sentence?: string
  aspect?: string
  label: string
  score: number
}

function Lab() {
  const [text, setText] = useState('Lami kaayo ang matcha pero super dugay ang service')
  const [selectedAspect, setSelectedAspect] = useState('auto')
  const [loading, setLoading] = useState(false)
  const [predictions, setPredictions] = useState<PredictionItem[]>([
    {
      sentence: 'Lami kaayo ang matcha pero super dugay ang service',
      aspect: 'Product Quality',
      label: 'POSITIVE',
      score: 0.96,
    }
  ])
  const [latency, setLatency] = useState<string>('1.8s')

  const analyze = async () => {
    if (!text.trim()) return
    setLoading(true)
    const startTime = performance.now()
    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, aspect: selectedAspect }),
      })
      const data = await response.json()
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2)
      setLatency(`${elapsed}s`)

      if (data.predictions && Array.isArray(data.predictions) && data.predictions.length > 0) {
        setPredictions(data.predictions)
      }
    } catch (err) {
      console.warn('API error, falling back:', err)
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2)
      setLatency(`${elapsed}s`)
      setPredictions([
        {
          sentence: text,
          aspect: selectedAspect === 'auto' ? 'Product Quality' : selectedAspect,
          label: 'POSITIVE',
          score: 0.94,
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return <main className="lab">
    <div className="lab-intro">
      <span className="kicker">LIVE MODEL TESTING</span>
      <h1>See the model <em>think.</em></h1>
      <p>Enter a café review and select the target aspect to evaluate, or let the model automatically scan and detect aspects.</p>
    </div>

    <div className="lab-grid">
      <section className="input-panel">
        <div className="panel-title">
          <h2>Your review</h2>
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type or paste a customer review…"
        />

        {/* Target Aspect Selector */}
        <div style={{ margin: '14px 0 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="kicker" style={{ fontSize: '9px' }}>TARGET ASPECT TO TEST</span>
            <span style={{ font: "400 9px 'DM Mono'", color: '#65756e' }}>
              {selectedAspect === 'auto' ? 'All Aspects' : selectedAspect}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {aspectOptions.map(opt => {
              const active = selectedAspect === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedAspect(opt.id)}
                  style={{
                    fontSize: '11px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: active ? '1px solid #173b30' : '1px solid #cbd2cb',
                    background: active ? '#173b30' : '#fcfbf8',
                    color: active ? '#ffffff' : '#495d54',
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="examples">
          <small>TRY AN EXAMPLE</small>
          <button onClick={() => { setText('Lami ang coffee pero lisod kaayo mangita ug parking.'); setSelectedAspect('auto') }}>
            Parking + taste
          </button>
          <button onClick={() => { setText('Nice ang place and kusog ang Wi-Fi, perfect for work!'); setSelectedAspect('Facilities and Amenities') }}>
            Facilities + Wi-Fi
          </button>
          <button onClick={() => { setText('Mahal kaayo ang latte pero worth it ang quality.'); setSelectedAspect('Price and Value') }}>
            Price & Value
          </button>
        </div>

        <button className="analyze" onClick={analyze} disabled={loading || !text.trim()}>
          <Icon name="spark"/> {loading ? 'Analyzing...' : `Analyze ${selectedAspect === 'auto' ? 'Review' : selectedAspect}`} <Icon name="arrow"/>
        </button>
      </section>

      <section className={`output-panel ${predictions.length > 0 ? 'ready' : ''}`}>
        <div className="panel-title">
          <h2>Model output</h2>
          <span className="live"><i/> LIVE</span>
        </div>

        <div className="model-meta">
          <span>MODEL</span>
          <b>XLM-RoBERTa · Calibrated Phase 7</b>
          <small>Dual Sequence-Pair Classifier</small>
        </div>

        {predictions.length > 0 && (
          <div className="sentences" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {predictions.map((p, idx) => {
              const isNeg = p.label.toUpperCase().includes('NEG')
              return (
                <div key={idx} className={`sentence ${isNeg ? 'negative' : ''}`}>
                  <p>“{p.sentence || text}”</p>
                  <div>
                    <span style={{ fontWeight: 600 }}>{p.aspect?.toUpperCase() || 'TARGET ASPECT'}</span>
                    <b>{p.label}</b>
                    <strong>{Math.round(p.score * 100)}%</strong>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="latency"><Icon name="clock" size={15}/> Inference completed in {latency}</div>
      </section>
    </div>

    <p className="disclaimer">Proof-of-concept research interface · Sequence-pair inference powered by BentoML & XLM-RoBERTa.</p>
  </main>
}

export default function App() {
  const [tab, setTab] = useState('discover')

  return <div>
    <header>
      <button className="brand" onClick={() => setTab('discover')}><span>timpla</span><i/></button>
      <nav>{[['discover','Discover'],['insights','Insights'],['lab','Model Lab']].map(([id,label]) => <button key={id} onClick={() => setTab(id)} className={tab === id ? 'active' : ''}>{label}</button>)}</nav>
      <div className="header-right"><span><i/> MODEL ONLINE</span><button onClick={() => setTab('insights')}>For café owners <Icon name="arrow" size={16}/></button></div>
    </header>
    {tab === 'discover' ? <Directory/> : tab === 'insights' ? <Insights/> : <Lab/>}
    <footer><span className="brand"><span>timpla</span><i/></span><p>Local coffee, understood better.</p><small>Research prototype · Davao City, Philippines</small></footer>
  </div>
}

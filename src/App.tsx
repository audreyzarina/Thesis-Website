import { useMemo, useState } from 'react'



type IconName = 'search' | 'map' | 'sliders' | 'arrow' | 'spark' | 'check' | 'clock' | 'wifi' | 'pin'



const photos = [

  '/okaeri.jpg',
  '/habi.jpg',
  '/glasshouse.jpg'
]



const cafes = [

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

  const [query, setQuery] = useState('')

  const [filter, setFilter] = useState('All')

  const filtered = useMemo(() => cafes.filter(c => {

    const matches = `${c.name} ${c.area} ${c.type}`.toLowerCase().includes(query.toLowerCase())

    if (filter === 'Wi-Fi') return matches && c.wifi >= 80

    if (filter === 'Parking') return matches && c.parking >= 70

    if (filter === 'Taste') return matches && c.taste >= 88

    return matches

  }), [query, filter])



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

      <div className="hero-note"><span>1,248</span> local reviews analyzed &nbsp;·&nbsp; Updated today</div>

    </section>



    <section className="content">

      <div className="section-head">

        <div><span className="kicker">EXPLORE THE DIRECTORY</span><h2>Cafés worth knowing</h2></div>

        <button className="outline"><Icon name="sliders"/> All filters</button>

      </div>

      <div className="filter-row">

        {['All', 'Taste', 'Wi-Fi', 'Parking'].map(x => <button key={x} onClick={() => setFilter(x)} className={filter === x ? 'active' : ''}>{x === 'All' ? 'All cafés' : `High ${x}`}</button>)}

        <span className="result-count">{filtered.length} establishments</span>

      </div>

      <div className="cards">

        {filtered.map((c, i) => <article className="cafe-card" key={c.name}>

          <div className="photo">

            <img src={c.photo} alt={`${c.name} café`}/>

            <span className="tag"><Icon name="spark" size={14}/>{c.tag}</span>

            <span className="rank">0{i + 1}</span>

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



function Insights() {

  return <main className="dashboard">

    <div className="dash-head"><div><span className="kicker">BUSINESS INTELLIGENCE</span><h1>Davao café pulse</h1><p>Operational sentiment across 32 establishments and 1,248 reviews.</p></div><button className="outline">Last 90 days</button></div>

    <div className="stat-grid">

      {[['1,248','Reviews analyzed','+12.4%'],['32','Establishments','+4 new'],['78%','Positive sentiment','+3.1%'],['4.6s','Avg. model response','Live']].map(s => <div className="stat" key={s[1]}><span>{s[1]}</span><strong>{s[0]}</strong><small>{s[2]}</small></div>)}

    </div>

    <div className="analytics-grid">

      <section className="panel wide"><div className="panel-title"><div><span className="kicker">SENTIMENT BY ASPECT</span><h2>What customers are saying</h2></div><span className="legend"><i/> Positive <i/> Neutral <i/> Negative</span></div>

        <div className="aspect-list">{aspects.map(a => <div className="aspect" key={a.label}><span>{a.label}<small>{a.count} mentions</small></span><div className="stack"><i style={{width:`${a.value}%`}}/><i style={{width:`${100-a.value-a.neg}%`}}/><i style={{width:`${a.neg}%`}}/></div><b>{a.value}%</b></div>)}</div>

      </section>

      <section className="panel"><span className="kicker">OPERATIONAL FOCUS</span><h2>Top opportunities</h2>

        <div className="opportunity warn"><Icon name="clock"/><div><b>Service wait time</b><p>Negative mentions rose 18% this month, concentrated on weekends.</p><span>High priority</span></div></div>

        <div className="opportunity"><Icon name="pin"/><div><b>Parking clarity</b><p>36% of parking mentions are negative. Add directions before arrival.</p><span>Needs attention</span></div></div>

      </section>

      <section className="panel"><span className="kicker">CORE STRENGTHS</span><h2>What’s working</h2>

        <div className="strength"><Icon name="check"/><div><b>Matcha quality</b><p>92% positive across 186 mentions</p></div></div>

        <div className="strength"><Icon name="check"/><div><b>Staff friendliness</b><p>88% positive across 241 mentions</p></div></div>

        <div className="strength"><Icon name="check"/><div><b>Work atmosphere</b><p>84% positive across 157 mentions</p></div></div>

      </section>

    </div>

  </main>

}



function Lab() {

  const [text, setText] = useState('Lami kaayo ang matcha pero super dugay ang service')

  const [result, setResult] = useState(true)

  const analyze = () => setResult(false) || setTimeout(() => setResult(true), 350)

  return <main className="lab">

    <div className="lab-intro"><span className="kicker">LIVE MODEL TESTING</span><h1>See the model <em>think.</em></h1><p>Enter a natural Taglish or Bislish café review. Our fine-tuned XLM-RoBERTa model identifies aspects and sentiment in real time.</p></div>

    <div className="lab-grid">

      <section className="input-panel"><div className="panel-title"><h2>Your review</h2><span>TAGLISH · BISLISH</span></div><textarea value={text} onChange={e => setText(e.target.value)} placeholder="Type or paste a customer review…"/><div className="examples"><small>TRY AN EXAMPLE</small><button onClick={() => setText('Lami ang coffee pero lisod kaayo mangita ug parking.')}>Parking + taste</button><button onClick={() => setText('Nice ang place and kusog ang Wi-Fi, perfect for work!')}>Wi-Fi + ambience</button></div><button className="analyze" onClick={analyze} disabled={!text.trim()}><Icon name="spark"/> Analyze review <Icon name="arrow"/></button></section>

      <section className={`output-panel ${result ? 'ready' : ''}`}><div className="panel-title"><h2>Model output</h2><span className="live"><i/> LIVE</span></div>

        <div className="model-meta"><span>MODEL</span><b>XLM-RoBERTa · ABSA v1.4</b><small>Confidence threshold 0.75</small></div>

        {result && <div className="sentences">

          <div className="sentence"><p>“Lami kaayo ang matcha”</p><div><span>PRODUCT QUALITY</span><b>Positive</b><strong>96%</strong></div></div>

          <div className="connector">BUT / PERO <i/></div>

          <div className="sentence negative"><p>“super dugay ang service”</p><div><span>SERVICE SPEED</span><b>Negative</b><strong>94%</strong></div></div>

        </div>}

        <div className="latency"><Icon name="clock" size={15}/> Inference completed in 1.8s</div>

      </section>

    </div>

    <p className="disclaimer">Proof-of-concept research interface · Predictions are generated for demonstration purposes.</p>

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
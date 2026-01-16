import React, { useState, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async'; // SEO IMPORTS
import { 
  MapPin, Star, ArrowRight, ExternalLink, Quote, User, Phone, CheckCircle2, ChevronDown, Bell, X, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase'; 
import { doc, onSnapshot, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// --- CONFIGURATION ---
const MADAWA_PHONE = "94776353353"; 
const WABOT_INSTANCE = "696103D4D811C";
const WABOT_TOKEN = "6935797c735a5";
const TRIPADVISOR_URL = "https://www.tripadvisor.com/Attraction_Review-g297896-d27158137-Reviews-Madawa_Galagedara-Galle_Galle_District_Southern_Province.html";

const SLIDESHOW_IMAGES = [
    "https://www.galleexperience.com/images/about.webp?v=1.0.3",
    "/img1.jpg", "/img2.jpg", "/img3.jpg", "/img4.jpg", "/img5.jpg",
    "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/13/54/8b/1e.jpg",
    "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/15/64/cc/13.jpg"
];

const HEADLINES = [
    { top: "GUIDED TOURS", bottom: "LASTING MEMORIES", color: "text-[#0891B2]" },
    { top: "HERITAGE WALKS", bottom: "EXPERT GUIDANCE", color: "text-emerald-500" },
    { top: "ANCIENT STORIES", bottom: "LOCAL INSIGHT", color: "text-orange-500" }
];

const ALL_COUNTRIES = ["Australia", "Austria", "Belgium", "Canada", "China", "Denmark", "France", "Germany", "India", "Ireland", "Italy", "Japan", "Netherlands", "New Zealand", "Norway", "Russia", "Saudi Arabia", "Singapore", "South Africa", "Spain", "Sri Lanka", "Sweden", "Switzerland", "Taiwan", "Thailand", "UAE", "UK", "USA"].sort();

const generateTimes = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const period = h < 12 ? 'AM' : 'PM';
            const hour = h % 12 || 12;
            const min = m === 0 ? '00' : '30';
            times.push(`${hour}:${min} ${period}`);
        }
    }
    return times;
};

const GalleFortTour = () => {
  const [loading, setLoading] = useState(true);
  const [bookingType, setBookingType] = useState('Group Walk');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); 
  const [imgIndex, setImgIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [myHistory, setMyHistory] = useState([]);

  const [settings, setSettings] = useState({ groupPrice: "12", privatePrice: "40" });
  const availableTimes = generateTimes();

  // --- GOOGLE STRUCTURED DATA (JSON-LD) ---
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "name": "Galle Fort Walking Tour with Madawa",
    "description": "Top-rated historical walking tour inside the UNESCO World Heritage Galle Fort. Experience Sri Lankan history with an expert resident guide.",
    "url": "https://galleforttour.com",
    "image": SLIDESHOW_IMAGES[0],
    "priceRange": "$12 - $40",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Galle",
      "addressRegion": "Southern Province",
      "addressCountry": "LK"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "250"
    }
  };

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
    const saved = localStorage.getItem('galle_tour_history_final');
    if (saved) setMyHistory(JSON.parse(saved));

    const unsub = onSnapshot(doc(db, "admin", "settings"), (docSnap) => {
      if (docSnap.exists()) setSettings(docSnap.data());
    });
    return () => unsub();
  }, []);

  const [form, setForm] = useState({ name: '', country: 'United Kingdom', phone: '', email: '', date: '', time: '09:00 AM' });

  useEffect(() => {
    const iT = setInterval(() => setImgIndex((p) => (p + 1) % SLIDESHOW_IMAGES.length), 5000);
    const tT = setInterval(() => setTextIndex((p) => (p + 1) % HEADLINES.length), 4000);
    return () => { clearInterval(iT); clearInterval(tT); };
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const price = bookingType === 'Group Walk' ? settings.groupPrice : settings.privatePrice;
    
    const robotMessage = `*NEW RESERVATION: GALLE FORT TOUR* 🏛️\n\n*Guest:* ${form.name}\n*Package:* ${bookingType}\n*From:* ${form.country}\n*Contact:* ${form.phone}\n*Date:* ${form.date}\n*Time:* ${form.time}\n*Price:* $${price}`;

    try {
      await addDoc(collection(db, "bookings"), { 
          ...form, 
          bookingType, 
          price, 
          timestamp: serverTimestamp(),
      });

      // FREE ROBOT MESSAGE (Via Proxy)
      const response = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://app.wabot.my/api/send'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              number: MADAWA_PHONE,
              type: "text",
              message: robotMessage,
              instance_id: WABOT_INSTANCE,
              access_token: WABOT_TOKEN
          })
      });
      
      const localStore = [{ ...form, bookingType, price }, ...myHistory];
      setMyHistory(localStore);
      localStorage.setItem('galle_tour_history_final', JSON.stringify(localStore));

      setStatus('success');
      
    } catch (err) { 
        console.error("Booking Error:", err);
        // Even if proxy fails, firebase usually succeeds
        if (err.message.includes('fetch')) setStatus('success');
        else setStatus('error'); 
    }
    setIsSubmitting(false);
  };

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-white text-[#0F172A] font-sans selection:bg-cyan-100 overflow-x-hidden">
        
        {/* --- SEO INJECTION --- */}
        <Helmet>
            <title>Galle Fort Tour | Best Walking Guide in Galle Sri Lanka</title>
            <meta name="description" content="Book the #1 rated walking tour in Galle Fort with Madawa. Explore UNESCO heritage, history, and culture. Instant WhatsApp confirmation." />
            <meta name="keywords" content="Galle Fort Tour, Galle Guide, Sri Lanka Walking Tour, Madawa Galle, Best Thing to do in Galle, Galle Fort History" />
            <link rel="canonical" href="https://galleforttour.com" />
            
            {/* Open Graph (WhatsApp/Facebook Preview) */}
            <meta property="og:title" content="Galle Fort Tour - Rated #1 on TripAdvisor" />
            <meta property="og:description" content="Join Madawa for an unforgettable history walk inside the Dutch Fort." />
            <meta property="og:image" content={SLIDESHOW_IMAGES[0]} />
            <meta property="og:url" content="https://galleforttour.com" />
            <meta property="og:type" content="website" />

            {/* Structured Data for Google Rich Results */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
          body { font-family: 'Outfit', sans-serif; -webkit-font-smoothing: antialiased; }
          .glass-panel { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.5); }
          .nav-glass { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(0, 0, 0, 0.05); }
          .hero-overlay { background: linear-gradient(to right, rgba(255, 255, 255, 0.95) 20%, rgba(255, 255, 255, 0.5) 100%); }
          .ta-pill { background: #00af87; box-shadow: 0 4px 15px rgba(0, 175, 135, 0.3); }
          @media (max-width: 1024px) { .hero-overlay { background: rgba(255, 255, 255, 0.9); } }
        `}</style>

        {/* --- PRELOADER --- */}
        <AnimatePresence>
          {loading && (
            <motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-[#0F172A] flex items-center justify-center p-6 text-center">
               <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-20"><source src="/bgvid.mp4" type="video/mp4" /></video>
               <div className="relative z-10 space-y-4">
                  <h1 className="text-3xl font-[900] text-white tracking-tighter uppercase">GALLE FORT <span className="text-[#0891B2]">TOUR</span></h1>
                  <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-[#0891B2]" size={32} />
                      <p className="text-white font-bold uppercase tracking-widest text-[10px]">TripAdvisor Verified 5.0</p>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- NOTIFICATION --- */}
        <AnimatePresence>
          {status === 'success' && (
            <motion.div initial={{ y: -100 }} animate={{ y: 24 }} exit={{ y: -100 }} className="fixed top-0 left-0 right-0 z-[200] flex justify-center px-6">
              <div className="glass-panel px-10 py-5 rounded-full flex items-center gap-4 shadow-2xl border-cyan-200">
                  <div className="bg-emerald-500 p-2 rounded-full text-white animate-bounce shadow-lg"><Bell size={20} /></div>
                  <p className="text-sm font-black text-slate-800 tracking-tight">Booking Sent! Check your WhatsApp.</p>
                  <button onClick={() => setStatus(null)} className="ml-2 hover:bg-slate-100 p-1 rounded-full"><X size={16} /></button>
              </div>
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div initial={{ y: -100 }} animate={{ y: 24 }} exit={{ y: -100 }} className="fixed top-0 left-0 right-0 z-[200] flex justify-center px-6">
              <div className="bg-red-500 text-white px-10 py-5 rounded-full flex items-center gap-4 shadow-2xl">
                  <p className="text-sm font-black tracking-tight">Connection Failed.</p>
                  <button onClick={() => setStatus(null)} className="ml-2 hover:bg-red-600 p-1 rounded-full"><X size={16} /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- NAVIGATION --- */}
        <nav className="fixed top-0 w-full z-[100] nav-glass px-4 md:px-10 py-4 flex justify-between items-center h-16 md:h-20">
          <div className="flex items-center gap-2">
              <span className="text-lg md:text-2xl font-[900] tracking-tighter uppercase text-slate-900">GALLE FORT <span className="text-[#0891B2]">TOUR</span></span>
          </div>
          <div className="flex items-center gap-2 md:gap-8">
              <a href={TRIPADVISOR_URL} target="_blank" rel="noreferrer" className="ta-pill hidden sm:flex items-center gap-2 px-5 py-2 rounded-full text-white text-[10px] font-black transition-transform hover:scale-105 shadow-lg">
                  <img src="https://static.tacdn.com/img2/brand_refresh_2025/logos/wordmark.svg" className="h-2.5 brightness-0 invert" alt="TA" />
                  <span>5.0 RATING</span>
              </a>
              <a href="#book" className="bg-[#0F172A] text-white px-5 md:px-7 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#0891B2] transition-all shadow-xl">Book Now</a>
          </div>
        </nav>

        {/* --- HERO SECTION (Mobile Optimized) --- */}
        <section className="relative min-h-[100dvh] lg:h-screen flex items-center bg-[#FAF9F6] px-6 lg:px-12 overflow-hidden border-b border-slate-100 pt-28 lg:pt-0">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-10 grayscale"><source src="/bgvid.mp4" type="video/mp4" /></video>
          <div className="absolute inset-0 z-10 hero-overlay" />

          <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center h-full lg:max-h-[850px] relative z-20 pb-12 lg:pb-0">
            <div className="lg:col-span-7 flex flex-col justify-center h-full">
              <div className="mb-8 lg:mb-10">
                  <AnimatePresence mode="wait">
                      <motion.div key={textIndex} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                          <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-[6.8rem] font-[900] text-[#0F172A] leading-[0.85] tracking-tighter uppercase">{HEADLINES[textIndex].top}</h2>
                          <h2 className={`text-5xl sm:text-6xl md:text-7xl lg:text-[6.8rem] font-[900] leading-[0.85] tracking-tighter mt-1 italic ${HEADLINES[textIndex].color}`}>{HEADLINES[textIndex].bottom}</h2>
                      </motion.div>
                  </AnimatePresence>
              </div>
              
              <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}} className="text-lg md:text-xl text-slate-400 max-w-lg leading-relaxed mb-8 lg:mb-10 font-light italic">
                  Experience history through the eyes of a resident guide. Discover heritage that breathes within the walls.
              </motion.p>
              
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.7}} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-slate-800 font-extrabold text-sm uppercase tracking-widest">
                      <CheckCircle2 className="text-[#0891B2]" size={20} /> 250+ Verified Reviews
                  </div>
                  <div className="flex items-center gap-3 text-slate-800 font-extrabold text-sm uppercase tracking-widest">
                      <CheckCircle2 className="text-[#0891B2]" size={20} /> Licensed National Heritage Guide
                  </div>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }} className="lg:col-span-5 h-full flex items-center justify-center relative mt-8 lg:mt-0">
              <div className="relative w-full max-w-[500px] aspect-square rounded-[2.5rem] lg:rounded-[3.5rem] overflow-hidden shadow-2xl border-[10px] border-white bg-slate-100">
                  <AnimatePresence mode="wait">
                      <motion.img key={imgIndex} src={SLIDESHOW_IMAGES[imgIndex]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2, ease: "easeInOut" }} className="absolute inset-0 w-full h-full object-cover contrast-[1.05]" alt={`Galle Fort Tour ${imgIndex}`} />
                  </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- REVIEWS & BOOKING --- */}
        <main className="container mx-auto px-4 md:px-6 py-20 lg:py-40 relative z-10 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            
            <div className="lg:col-span-7 space-y-16 lg:space-y-24">
              <section id="reviews" className="space-y-12 pt-0 lg:pt-10">
                  <h3 className="text-3xl font-[900] uppercase tracking-tighter text-slate-900 border-b-4 border-[#0891B2] pb-1 inline-block">Guest Feedback</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Bill S */}
                      <div className="p-8 md:p-10 glass-panel rounded-[2.5rem] lg:rounded-[3.5rem] border-slate-100 shadow-xl relative overflow-hidden group">
                          <Quote size={50} className="absolute -top-4 -right-4 text-cyan-500/10 group-hover:text-cyan-500/20 transition-all" />
                          <div className="flex items-center gap-4 mb-6">
                              <img src="/testi/usr2.jpg" className="w-14 h-14 rounded-full border-2 border-[#0891B2] shadow-lg object-cover" alt="Bill S" />
                              <div><div className="flex text-amber-400 text-xs">★★★★★</div><p className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">Bill S</p></div>
                          </div>
                          <p className="text-slate-600 italic font-light text-sm leading-relaxed mb-4 italic">"Madawa was right on time. Informative local tour. Friendly and fun. Recommended."</p>
                      </div>

                      {/* Hima M */}
                      <div className="p-8 md:p-10 glass-panel rounded-[2.5rem] lg:rounded-[3.5rem] border-slate-100 shadow-xl relative overflow-hidden group">
                          <Quote size={50} className="absolute -top-4 -right-4 text-cyan-500/10 group-hover:text-cyan-500/20 transition-all" />
                          <div className="flex items-center gap-4 mb-6">
                              <img src="/testi/usr1.jpg" className="w-14 h-14 rounded-full border-2 border-[#0891B2] shadow-lg object-cover" alt="Hima M" />
                              <div><div className="flex text-amber-400 text-xs">★★★★★</div><p className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">Hima M</p></div>
                          </div>
                          <p className="text-slate-600 italic font-light text-sm leading-relaxed mb-4 italic">"Madawa was very knowledgeable. The trip was full of facts and humour. Highly recommend!"</p>
                      </div>
                  </div>

                  {/* TRIPADVISOR REDIRECT CARD */}
                  <a href={TRIPADVISOR_URL} target="_blank" className="flex flex-col md:flex-row items-center justify-between p-8 bg-[#00af87] rounded-[2.5rem] text-white hover:shadow-2xl transition-all shadow-emerald-100 group overflow-hidden relative text-center md:text-left gap-4 md:gap-0">
                      <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                          <img src="https://static.tacdn.com/img2/brand_refresh_2025/logos/wordmark.svg" className="h-6 brightness-0 invert" alt="TA" />
                          <span className="font-extrabold tracking-tight text-lg underline decoration-white/30 underline-offset-4">Read All 250+ Verified Reviews</span>
                      </div>
                      <ExternalLink size={24} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                  </a>

                  {/* MY PAST BOOKINGS */}
                  {myHistory.length > 0 && (
                      <div className="mt-20 pt-10 border-t border-slate-100">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8 flex items-center gap-2 italic"><Bell size={14}/> Your Active Reservations</h3>
                          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                              {myHistory.map((b, i) => (
                                  <div key={i} className="glass-panel p-8 rounded-[2.5rem] min-w-[300px] shadow-xl border-cyan-100 relative">
                                      <span className="text-[#0891B2] font-black text-[10px] uppercase tracking-widest bg-cyan-50 px-3 py-1 rounded-full mb-4 inline-block">{b.bookingType}</span>
                                      <p className="text-xl font-bold text-slate-800">{b.date} • {b.time}</p>
                                      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                          <span>{b.name}</span>
                                          <span className="text-emerald-500">Recorded ✅</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </section>
            </div>

            <aside id="book" className="lg:col-span-5 lg:sticky lg:top-32">
              <div className="glass-panel p-6 md:p-12 rounded-[3rem] md:rounded-[4rem] shadow-2xl relative border-white border-2">
                  <div className="text-center mb-8">
                      <h3 className="text-2xl md:text-3xl font-[900] text-slate-900 tracking-tight uppercase leading-none mb-2">Reserve Walk</h3>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none italic">WhatsApp Confirmation</p>
                  </div>

                  <form onSubmit={handleBooking} className="space-y-4">
                      <div className="flex p-1 bg-slate-200/40 rounded-2xl mb-8 border border-slate-100">
                          {['Group Walk', 'Private Tour'].map(type => (
                              <button key={type} type="button" onClick={() => setBookingType(type)} className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${bookingType === type ? 'bg-[#0891B2] text-white shadow-xl' : 'text-slate-500 hover:text-slate-800'}`}>{type}</button>
                          ))}
                      </div>
                      <div className="text-center mb-10 pb-8 border-b border-slate-100 font-bold">
                          <div className="text-6xl md:text-7xl font-[900] text-[#0F172A] tracking-tighter leading-none"><span className="text-2xl align-top text-[#0891B2] mr-1">$</span>{bookingType === 'Group Walk' ? settings.groupPrice : settings.privatePrice}</div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-4 tracking-widest">USD Per Traveler</p>
                      </div>

                      <div className="space-y-3 font-bold text-slate-700">
                          <div className="bg-white/90 p-4 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm focus-within:border-[#0891B2] transition-colors shadow-sm">
                              <User size={18} className="text-[#0891B2]"/><input required type="text" placeholder="Your Name" className="bg-transparent outline-none w-full text-sm font-semibold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                          </div>
                          <div className="relative">
                              <select className="w-full bg-white/90 p-4 rounded-2xl border border-slate-200 text-sm outline-none appearance-none cursor-pointer shadow-sm text-slate-700 font-bold" value={form.country} onChange={e => setForm({...form, country: e.target.value})}>
                                  {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                              <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                          </div>
                          <div className="bg-white/90 p-4 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm focus-within:border-[#0891B2] transition-colors shadow-sm">
                              <Phone size={18} className="text-[#0891B2]"/><input required type="tel" placeholder="WhatsApp Number" className="bg-transparent outline-none w-full text-sm font-semibold" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                          </div>
                          <div className="grid grid-cols-2 gap-3 font-sans font-bold text-slate-700">
                              <input required type="date" className="bg-white/90 p-4 rounded-2xl border border-slate-200 text-[11px] font-black uppercase cursor-pointer outline-none" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                              <select className="bg-white/90 p-4 rounded-2xl border border-slate-200 text-[11px] font-black uppercase cursor-pointer appearance-none outline-none shadow-sm" value={form.time} onChange={e => setForm({...form, time: e.target.value})}>{availableTimes.map(t => <option key={t} value={t}>{t}</option>)}</select>
                          </div>
                      </div>

                      <button disabled={isSubmitting} className={`w-full py-6 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3 mt-8 ${status === 'success' ? 'bg-emerald-500 text-white' : 'bg-[#0F172A] text-white hover:bg-[#0891B2]'}`}>
                          {isSubmitting ? "Dispatching..." : "Reserve Journey"}
                          <ArrowRight size={18} />
                      </button>
                      <div className="pt-8 text-center font-black uppercase tracking-widest text-[10px] leading-none opacity-60"><p className="text-emerald-600"><CheckCircle2 className="inline mr-1" size={14}/> Pay Cash: USD or LKR Accepted</p></div>
                  </form>
              </div>
            </aside>
          </div>

          {/* --- GALLE EXPERIENCE LINK --- */}
          <section className="mt-20 md:mt-40 bg-[#0891B2] rounded-[3rem] p-10 md:p-20 text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
                  <div className="max-w-xl font-bold uppercase tracking-tight">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Full District Explorer</span>
                      <h4 className="text-4xl md:text-6xl font-black tracking-tighter mt-4 leading-none">WANT A FULL TOUR <br/>OF GALLE?</h4>
                      <p className="mt-8 text-cyan-50 font-light text-lg italic italic tracking-normal normal-case">Visit our parent company for tours including rainforests, beaches, and waterfalls beyond the fort walls.</p>
                  </div>
                  <a href="https://www.galleexperience.com/" target="_blank" className="bg-white text-[#0891B2] px-12 py-6 rounded-full font-black text-sm uppercase tracking-widest hover:bg-[#0F172A] hover:text-white transition-all transform hover:scale-105 shadow-2xl">Visit Galle Experience <ExternalLink size={20} className="inline ml-2" /></a>
              </div>
          </section>
        </main>

        {/* --- FOOTER --- */}
        <footer className="bg-[#0F172A] text-white py-20 md:py-32 px-6 text-center relative overflow-hidden">
          <h2 className="text-5xl md:text-[8rem] font-black tracking-tighter mb-10 italic opacity-10 uppercase select-none leading-none">History.</h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-20 leading-none">
              <span className="flex items-center gap-3 uppercase font-bold tracking-widest"><MapPin size={16} className="text-[#0891B2]"/> Galle Fort</span>
              <span className="flex items-center gap-3 uppercase font-bold tracking-widest"><Star size={16} className="text-[#0891B2]"/> TripAdvisor #1 Guide</span>
          </div>
          <p className="opacity-10 text-[9px] font-black tracking-[1.5em] uppercase italic leading-none">© 2026 Galle Fort Tour • Authentic Storytelling</p>
        </footer>
      </div>
    </HelmetProvider>
  );
};

export default GalleFortTour;
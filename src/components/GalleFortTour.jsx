import React, { useState, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async'; 
import { 
  Star, ArrowRight, ExternalLink, Quote, User, Phone, CheckCircle2, ChevronDown, Bell, X, Loader2, Plus, Trash2, Clock, Globe, LogOut, Ticket, Users, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '../firebase'; 
import { doc, onSnapshot, collection, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const MADAWA_PHONE = "94776353353"; 
const WABOT_INSTANCE = "696103D4D811C";
const WABOT_TOKEN = "6935797c735a5";
const TRIPADVISOR_URL = "https://www.tripadvisor.com/Attraction_Review-g297896-d27158137-Reviews-Madawa_Galagedara-Galle_Galle_District_Southern_Province.html";
const STARTING_TIMES = ["7:30 AM", "9:00 AM", "11:00 AM", "4:30 PM", "6:00 PM"];
const ALL_COUNTRIES = ["Australia", "Austria", "Belgium", "Canada", "China", "Denmark", "France", "Germany", "India", "Ireland", "Italy", "Japan", "Netherlands", "New Zealand", "Norway", "Russia", "Saudi Arabia", "Singapore", "South Africa", "Spain", "Sri Lanka", "Sweden", "Switzerland", "Taiwan", "Thailand", "UAE", "UK", "USA"].sort();
const BACKGROUND_SLIDES = ["/slides/1.jpg", "/slides/2.jpg", "/slides/3.jpg"];
const TOUR_GALLERY = ["/img1.jpg", "/img2.jpg", "/img3.jpg", "/img4.jpg", "/img5.jpg"];

const ROTATING_HEADLINES = [
    { top: "GALLE FORT", bottom: "WALKING TOUR", color: "from-cyan-400 to-blue-500" },
    { top: "ANCIENT PATHS", bottom: "LOCAL STORIES", color: "from-emerald-400 to-teal-500" },
    { top: "HERITAGE PATHS", bottom: "EXPERT GUIDANCE", color: "from-orange-400 to-red-500" }
];

const GalleFortTour = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [bookingType, setBookingType] = useState('Group Walk');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); 
  const [participants, setParticipants] = useState(['']); 
  const [settings, setSettings] = useState({ groupPrice: "12", privatePrice: "40" });
  const [form, setForm] = useState({ name: '', country: 'United Kingdom', phone: '', date: '', time: '9:00 AM' });
  const [slideIndex, setSlideIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [myBookings, setMyBookings] = useState([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    const timer = setTimeout(() => setLoading(false), 2000);
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
          setForm(prev => ({ ...prev, name: currentUser.displayName }));
          const q = query(collection(db, "bookings"), where("userId", "==", currentUser.uid));
          onSnapshot(q, (snapshot) => setMyBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
      }
      setLoading(false);
    });
    onSnapshot(doc(db, "admin", "settings"), (docSnap) => docSnap.exists() && setSettings(docSnap.data()));
    const sT = setInterval(() => setSlideIndex((p) => (p + 1) % BACKGROUND_SLIDES.length), 3500);
    const tT = setInterval(() => setTextIndex((p) => (p + 1) % ROTATING_HEADLINES.length), 4500);
    return () => { unsubAuth(); clearInterval(sT); clearInterval(tT); clearTimeout(timer); window.removeEventListener('scroll', handleScroll); };
  }, []);

  const handleGoogleAction = async () => {
    const provider = new GoogleAuthProvider();
    try { await signInWithPopup(auth, provider); } catch (err) { console.error(err); }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) { await handleGoogleAction(); return; }
    setIsSubmitting(true);
    const price = bookingType === 'Group Walk' ? settings.groupPrice : settings.privatePrice;
    const participantList = participants.map((p, i) => `${i + 1}. ${p || 'Guest'}`).join('\n');
    const robotMessage = `*NEW VERIFIED BOOKING*\n\n*Guest:* ${form.name}\n*Package:* ${bookingType}\n*Date:* ${form.date} @ ${form.time}\n\n*Participants:*\n${participantList}`;
    try {
      await addDoc(collection(db, "bookings"), { ...form, bookingType, price, participants, userId: user.uid, userEmail: user.email, timestamp: serverTimestamp() });
      await fetch('https://corsproxy.io/?' + encodeURIComponent('https://app.wabot.my/api/send'), {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ number: MADAWA_PHONE, type: "text", message: robotMessage, instance_id: WABOT_INSTANCE, access_token: WABOT_TOKEN })
      });
      setStatus('success');
      setParticipants(['']);
    } catch (err) { setStatus('error'); }
    setIsSubmitting(false);
  };

  if (loading) return <div className="h-screen flex flex-col items-center justify-center bg-[#0F172A]"><Loader2 className="animate-spin text-[#0891B2]" size={40}/><p className="text-[10px] font-black uppercase text-slate-500 mt-4 tracking-[0.4em]">Galle Walk</p></div>;

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-white text-[#0F172A] font-sans selection:bg-cyan-100 overflow-x-hidden">
        <Helmet><title>Galle Fort Walking Tour | #1 TripAdvisor Guide</title></Helmet>
        
        <style>{`
          .glass-nav { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(40px); border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
          .hero-gradient { background: linear-gradient(to bottom, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%); }
          .ken-burns { animation: zoom 12s infinite alternate ease-in-out; }
          @keyframes zoom { from { transform: scale(1); } to { transform: scale(1.04); } }
          .ta-pill { background: #00af87; box-shadow: 0 4px 15px rgba(0, 175, 135, 0.3); }
          .text-outline { -webkit-text-stroke: 1px white; color: transparent; letter-spacing: 0.05em; text-shadow: 0 4px 15px rgba(0,0,0,0.3); }
          @media (min-width: 768px) { .text-outline { -webkit-text-stroke: 1.5px white; } }
          .high-vis-text { text-shadow: 0 2px 10px rgba(0,0,0,0.6); }
        `}</style>

        <nav className={`fixed top-0 w-full z-[100] transition-all duration-700 px-4 md:px-16 flex justify-between items-center ${scrolled ? 'h-16 md:h-20 glass-nav shadow-lg' : 'h-24 md:h-28 bg-transparent'}`}>
          <div className={`${!scrolled ? 'high-vis-text' : ''}`}>
             <span className={`text-base md:text-xl font-[950] tracking-tighter uppercase leading-none transition-colors duration-500 ${scrolled ? 'text-slate-900' : 'text-white'}`}>
                GALLE FORT <span className="text-[#0891B2]">WALKING TOUR</span>
             </span>
          </div>

          <div className="flex items-center gap-3 md:gap-8">
              {user ? (
                  <div className="text-right flex flex-col items-end">
                    <p className={`text-[9px] md:text-[11px] font-[950] uppercase tracking-widest leading-none ${scrolled ? 'text-slate-900' : 'text-white'}`}>{user.displayName.split(' ')[0]}</p>
                    <button onClick={() => signOut(auth)} className="text-[8px] md:text-[9px] font-black text-red-500 uppercase tracking-tighter mt-1 hover:text-red-400 transition-colors">Logout</button>
                  </div>
              ) : (
                <div className="flex items-center gap-3">
                  <a href={TRIPADVISOR_URL} target="_blank" className="ta-pill flex items-center gap-1.5 px-3 md:px-5 py-2 rounded-full text-white text-[8px] md:text-[10px] font-black transition-transform hover:scale-105">
                    <img src="https://static.tacdn.com/img2/brand_refresh_2025/logos/wordmark.svg" className="h-2 brightness-0 invert" alt="TA" />
                    <Star size={8} fill="currentColor"/> 5.0
                  </a>
                  <button onClick={handleGoogleAction} className={`px-4 md:px-8 py-2 md:py-3 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${scrolled ? 'bg-[#0F172A] text-white shadow-xl' : 'bg-white text-[#0F172A]'}`}>Sign In</button>
                </div>
              )}
          </div>
        </nav>

        <section className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-[#0F172A]">
            <div className="absolute inset-0 z-0">
                <AnimatePresence initial={false}>
                    <motion.img key={slideIndex} src={BACKGROUND_SLIDES[slideIndex]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2, ease: "easeInOut" }} className="absolute inset-0 w-full h-full object-cover ken-burns" />
                </AnimatePresence>
                <div className="absolute inset-0 hero-gradient z-10" />
            </div>

            <div className="relative z-20 text-center px-4 w-full max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}>
                    <span className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-2xl px-4 md:px-6 py-2 rounded-full text-[8px] md:text-[10px] font-[900] uppercase tracking-[0.5em] text-white border border-white/10 mb-8 md:mb-10 shadow-2xl high-vis-text">
                        <Clock size={12} className="text-[#0891B2]"/> 90 Min Story
                    </span>
                </motion.div>

                <div className="h-[100px] md:h-[200px] flex flex-col justify-center mb-4 md:mb-6">
                    <AnimatePresence mode="wait">
                        <motion.div key={textIndex} initial={{ opacity: 0, filter: "blur(20px)", scale: 0.9 }} animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }} exit={{ opacity: 0, filter: "blur(20px)", scale: 1.1 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
                            <h2 className="text-3xl sm:text-5xl md:text-[5rem] font-[950] text-outline leading-tight uppercase mb-1">{ROTATING_HEADLINES[textIndex].top}</h2>
                            <h2 className={`text-3xl sm:text-5xl md:text-[5rem] font-[950] leading-none tracking-tighter uppercase italic bg-gradient-to-r ${ROTATING_HEADLINES[textIndex].color} bg-clip-text text-transparent drop-shadow-2xl`}>{ROTATING_HEADLINES[textIndex].bottom}</h2>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.8 }} className="text-white/80 text-sm md:text-xl font-medium max-w-2xl mx-auto mt-8 md:mt-12 leading-relaxed tracking-wide high-vis-text px-4">
                    Step inside the living history of the Dutch Fort with <span className="text-white font-[950]">Madawa</span>, <br className="hidden md:block"/> the most recommended local resident guide.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.2 }} className="mt-10 md:mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8">
                    <a href="#book" className="w-full sm:w-auto bg-[#0891B2] text-white px-10 md:px-14 py-3.5 md:py-4 rounded-full font-[900] uppercase text-[10px] md:text-[11px] tracking-widest shadow-[0_0_50px_rgba(8,145,178,0.5)] hover:bg-white hover:text-[#0891B2] transition-all transform hover:-translate-y-1">Book Your Walk</a>
                    <a href={TRIPADVISOR_URL} target="_blank" className="w-full sm:w-auto bg-white/5 backdrop-blur-2xl text-white border border-white/20 px-10 md:px-12 py-3.5 md:py-4 rounded-full font-[900] uppercase text-[10px] md:text-[11px] tracking-widest hover:bg-white/30 transition-all">TripAdvisor Feed</a>
                </motion.div>
            </div>
        </section>

        <main className="container mx-auto px-4 md:px-6 py-16 md:py-24 max-w-7xl">
            <div className="grid lg:grid-cols-12 gap-16 md:gap-20">
                <div className="lg:col-span-7 space-y-20 md:space-y-24">
                    <section className="space-y-10 md:space-y-12">
                        <h3 className="text-2xl md:text-3xl font-[950] uppercase tracking-tighter text-slate-900 border-b-[6px] md:border-b-[8px] border-[#0891B2] pb-1 inline-block">Feedback</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            {[{ n: "Bill S.", t: "Highly recommended resident guide. Friendly and fun tour!" }, { n: "Hima M.", t: "Knowledgeable. The trip was full of facts and humour." }].map((fb, i) => (
                                <div key={i} className="p-8 md:p-10 bg-slate-50 rounded-[2rem] md:rounded-[2.5rem] relative group border border-slate-100/50">
                                    <Quote size={30} className="absolute -top-2 -right-2 text-[#0891B2]/5" />
                                    <p className="text-slate-600 italic text-sm md:text-base leading-relaxed mb-6">"{fb.t}"</p>
                                    <p className="text-[9px] md:text-[10px] font-[900] uppercase tracking-widest text-[#0891B2]">Guest: {fb.n}</p>
                                </div>
                            ))}
                        </div>
                        
                        <a href={TRIPADVISOR_URL} target="_blank" className="flex items-center justify-between p-8 md:p-10 bg-[#00af87] rounded-[2.5rem] md:rounded-[3rem] text-white shadow-lg hover:shadow-xl transition-all group mb-10">
                            <div className="flex items-center gap-6 md:gap-8">
                                <img src="https://static.tacdn.com/img2/brand_refresh_2025/logos/wordmark.svg" className="h-6 md:h-8 brightness-0 invert" alt="TA" />
                                <span className="font-black text-base md:text-xl underline decoration-white/20 underline-offset-[8px]">250+ Reviews</span>
                            </div>
                            <ArrowRight size={24} className="group-hover:translate-x-3 transition-transform" />
                        </a>

                        {/* TOUR GALLERY SECTION */}
                        <div className="space-y-6">
                            <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400"><Camera size={16} className="text-[#0891B2]"/> Moments From Our Walks</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                {TOUR_GALLERY.map((img, i) => (
                                    <motion.div key={i} whileHover={{ scale: 1.02 }} className={`relative rounded-2xl md:rounded-[2rem] overflow-hidden shadow-md group ${i === 0 ? 'col-span-2 md:col-span-1 md:row-span-2' : ''}`}>
                                        <img src={img} alt={`Tour Moment ${i+1}`} className="w-full h-full object-cover aspect-square md:aspect-auto" />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {user && myBookings.length > 0 && (
                        <section className="pt-10 border-t border-slate-100">
                            <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8">Active Bookings</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {myBookings.map((b) => (
                                    <div key={b.id} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm">
                                        <p className="text-[8px] md:text-[9px] font-black uppercase text-[#0891B2] mb-3">{b.bookingType}</p>
                                        <h4 className="text-xl md:text-2xl font-[950] text-slate-900 leading-none mb-1">{b.date}</h4>
                                        <p className="text-[10px] md:text-xs font-bold text-slate-400 mb-6">{b.time}</p>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-[10px] font-black uppercase text-emerald-500">Confirmed ✅</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <aside id="book" className="lg:col-span-5">
                    <div className="bg-white p-8 md:p-10 rounded-[3rem] md:rounded-[4rem] shadow-[0_40px_80px_rgba(0,0,0,0.06)] border border-slate-100 sticky top-24 md:top-32 transition-all">
                        <div className="flex justify-between items-end mb-8 md:mb-10">
                            <h3 className="text-xl md:text-2xl font-[950] uppercase tracking-tighter">Book</h3>
                            <div className="text-right">
                                <span className="text-3xl md:text-4xl font-[950] text-slate-900 tracking-tighter">${bookingType === 'Group Walk' ? settings.groupPrice : settings.privatePrice}</span>
                                <p className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 mt-1 tracking-widest">per person</p>
                            </div>
                        </div>

                        <form onSubmit={handleBooking} className="space-y-4">
                            <div className="flex p-1 bg-slate-100 rounded-[1.5rem] mb-6">
                                {['Group Walk', 'Private Tour'].map(t => (
                                    <button key={t} type="button" onClick={() => setBookingType(t)} className={`flex-1 py-2.5 md:py-3 rounded-[1.2rem] font-[900] text-[8px] md:text-[9px] uppercase tracking-widest transition-all ${bookingType === t ? 'bg-[#0891B2] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <input required className="bg-slate-50 w-full p-3.5 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 text-sm font-bold outline-none focus:bg-white focus:shadow-md transition-all" placeholder="Guest Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                                <div className="relative">
                                    <select className="w-full p-3.5 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100 text-sm font-bold outline-none appearance-none cursor-pointer focus:bg-white" value={form.country} onChange={e => setForm({...form, country: e.target.value})}>
                                        {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                </div>
                                <input required className="bg-slate-50 w-full p-3.5 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 text-sm font-bold outline-none focus:bg-white" placeholder="WhatsApp / Telegram" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />

                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                    <div className="bg-slate-50 p-3.5 md:p-4 rounded-xl md:rounded-2xl border border-slate-100">
                                        <label className="block text-[7px] md:text-[8px] font-black text-slate-400 uppercase mb-1">Date</label>
                                        <input required type="date" className="bg-transparent w-full text-[11px] md:text-xs font-black outline-none uppercase" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                                    </div>
                                    <div className="bg-slate-50 p-3.5 md:p-4 rounded-xl md:rounded-2xl border border-slate-100">
                                        <label className="block text-[7px] md:text-[8px] font-black text-slate-400 uppercase mb-1">Time</label>
                                        <select className="bg-transparent w-full text-[11px] md:text-xs font-black outline-none appearance-none" value={form.time} onChange={e => setForm({...form, time: e.target.value})}>
                                            {STARTING_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">Participants (Max 20)</label>
                                        <button type="button" onClick={() => setParticipants([...participants, ''])} disabled={participants.length >= 20} className="text-[#0891B2] p-1.5 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors"><Plus size={18}/></button>
                                    </div>
                                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                                        {participants.map((p, idx) => (
                                            <div key={idx} className="flex gap-3 items-center">
                                                <input required className="flex-1 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs font-bold outline-none focus:bg-white" placeholder={`Guest ${idx + 1}`} value={p} onChange={(e) => { const a = [...participants]; a[idx] = e.target.value; setParticipants(a); }} />
                                                {participants.length > 1 && (
                                                    <button type="button" onClick={() => setParticipants(participants.filter((_, i) => i !== idx))}><Trash2 size={16} className="text-red-300 hover:text-red-500"/></button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button disabled={isSubmitting} className="w-full py-4 bg-[#0F172A] text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-lg mt-6 hover:bg-[#0891B2] transition-all transform active:scale-95 disabled:opacity-50">
                                {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20}/> : user ? "Confirm Book" : "Login with Google to Book"}
                            </button>
                        </form>
                    </div>
                </aside>
            </div>
        </main>

        <section className="container mx-auto px-4 md:px-6 mb-20 md:mb-24 max-w-7xl">
            <div className="bg-[#0891B2] rounded-[2.5rem] md:rounded-[4rem] p-10 md:p-20 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden group">
                <div className="max-w-xl relative z-10 text-center md:text-left">
                    <h2 className="text-2xl md:text-5xl font-[950] tracking-tighter leading-none mb-6 uppercase">WANT OTHER <br/>EXPERIENCES?</h2>
                    <p className="text-cyan-50 text-base md:text-lg italic opacity-90 mb-0">Discover boat safaris and rainforest treks beyond the fort walls.</p>
                </div>
                <a href="https://www.galleexperience.com/" target="_blank" rel="noreferrer" className="w-full md:w-auto bg-white text-[#0891B2] px-10 md:px-12 py-4 rounded-full font-black uppercase text-[10px] md:text-[11px] tracking-widest shadow-xl hover:bg-[#0F172A] hover:text-white transition-all transform hover:-translate-y-2 relative z-10 flex items-center justify-center gap-3">
                    Galle Experience <ExternalLink size={16} />
                </a>
            </div>
        </section>

        <footer className="bg-[#0F172A] py-16 md:py-24 text-center text-white/20 border-t border-white/5 uppercase text-[10px] md:text-[12px] tracking-[1.5em] font-black px-4 leading-relaxed">HERITAGE • STORYTELLING • GALLE</footer>

        <AnimatePresence>
            {status === 'success' && (
                <motion.div initial={{y:-100}} animate={{y:24}} className="fixed top-0 left-0 right-0 z-[300] flex justify-center px-4">
                    <div className="bg-white px-6 md:px-10 py-4 md:p-5 rounded-full shadow-2xl flex items-center gap-4 md:gap-6 border border-emerald-100">
                        <div className="bg-emerald-500 text-white p-2 rounded-full"><CheckCircle2 size={20}/></div>
                        <span className="text-xs md:text-sm font-[900] uppercase text-slate-800">Booking Confirmed!</span>
                        <button onClick={() => setStatus(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={18}/></button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </HelmetProvider>
  );
};

export default GalleFortTour;
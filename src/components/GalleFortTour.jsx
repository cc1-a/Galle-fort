import React, { useState, useEffect, useRef } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import SeoHead from './SeoHead';
import { Star, ArrowRight, ExternalLink, Quote, User, Phone, CheckCircle2, ChevronDown, X, Loader2, Plus, Trash2, Clock, Globe, Ticket, Users, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '../firebase';
import { doc, onSnapshot, collection, addDoc, serverTimestamp, query, where, updateDoc, increment, setDoc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const MADAWA_PHONE = import.meta.env.VITE_MADAWA_PHONE;
const WABOT_INSTANCE = import.meta.env.VITE_WABOT_INSTANCE;
const WABOT_TOKEN = import.meta.env.VITE_WABOT_TOKEN;
const TRIPADVISOR_URL = "https://www.tripadvisor.com/Attraction_Review-g297896-d27158137-Reviews-Madawa_Galagedara-Galle_Galle_District_Southern_Province.html";
const GOOGLE_ICON = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJg75LWB1zIJt1VTZO7O68yKciaDSkk3KMdw&s";

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
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [bookingType, setBookingType] = useState('Group Walk');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState(null);
    const [settings, setSettings] = useState({ groupPrice: "12", privatePrice: "40" });
    const [form, setForm] = useState({ name: '', country: 'United Kingdom', phone: '', date: '', time: '9:00 AM', peopleCount: 1 });
    const [slideIndex, setSlideIndex] = useState(0);
    const [textIndex, setTextIndex] = useState(0);
    const [myBookings, setMyBookings] = useState([]);
    const bookingsRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', handleScroll);
        const timer = setTimeout(() => setLoading(false), 2000); // Keep existing timer

        // Track Visits
        const trackVisit = async () => {
            try {
                await setDoc(doc(db, "admin", "stats"), { visits: increment(1) }, { merge: true });
            } catch (err) {
                console.error("Tracking Error:", err);
            }
        };
        trackVisit();

        const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                setShowLoginPrompt(false);
                setForm(prev => ({ ...prev, name: currentUser.displayName }));
                const q = query(collection(db, "bookings"), where("userId", "==", currentUser.uid));
                onSnapshot(q, (snapshot) => setMyBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
            } else {
                setTimeout(() => setShowLoginPrompt(true), 4000);
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
        const adminMsg = `*DETAILED BOOKING* 🏛️\nGuest: ${form.name}\nEmail: ${user.email}\nPhone: ${form.phone}\nCountry: ${form.country}\nPackage: ${bookingType}\nPeople: ${form.peopleCount}\nDate: ${form.date} @ ${form.time}`;
        const clientMsg = `Hi Madawa! I just confirmed my booking for the Galle Fort Walking Tour. 🏛️\n\nDetails:\nGuest: ${form.name}\nPeople: ${form.peopleCount}\nDate: ${form.date} @ ${form.time}`;

        try {
            await addDoc(collection(db, "bookings"), { ...form, bookingType, price, userId: user.uid, userEmail: user.email, timestamp: serverTimestamp() });
            fetch('https://corsproxy.io/?' + encodeURIComponent('https://app.wabot.my/api/send'), {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ number: MADAWA_PHONE, type: "text", message: adminMsg, instance_id: WABOT_INSTANCE, access_token: WABOT_TOKEN })
            }).catch(() => { });
            window.open(`https://wa.me/${MADAWA_PHONE}?text=${encodeURIComponent(clientMsg)}`, "_blank");
            setStatus('success');
            setTimeout(() => bookingsRef.current?.scrollIntoView({ behavior: 'smooth' }), 800);
        } catch (err) { setStatus('error'); }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-white text-[#0F172A] font-sans selection:bg-cyan-100 overflow-x-hidden">
            <SeoHead />
            <style>{`
          .glass-nav { background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(40px); border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
          .hero-gradient { background: linear-gradient(to bottom, rgba(15, 23, 42, 0.3) 0%, rgba(15, 23, 42, 0.9) 100%); }
          .ken-burns { animation: zoom 15s infinite alternate ease-in-out; }
          @keyframes zoom { from { transform: scale(1); } to { transform: scale(1.04); } }
          .ta-pill { background: #00af87; box-shadow: 0 4px 15px rgba(0, 175, 135, 0.3); }
          .text-outline { -webkit-text-stroke: 1px white; color: transparent; letter-spacing: 0.05em; text-shadow: 0 4px 15px rgba(0,0,0,0.3); }
          .high-vis-text { text-shadow: 0 2px 10px rgba(0,0,0,0.6); }
          .wa-float { position: fixed; bottom: 30px; right: 30px; z-index: 200; background: #25d366; color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(37, 211, 102, 0.4); }
        `}</style>

            <a href={`https://wa.me/${MADAWA_PHONE}`} target="_blank" className="wa-float" aria-label="Chat WhatsApp">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .01 5.403.006 12.039a11.81 11.81 0 001.602 6.04L0 24l6.102-1.6c1.869 1.019 3.978 1.556 6.126 1.558h.005c6.637 0 12.041-5.403 12.046-12.04a11.85 11.85 0 00-3.486-8.512z" /></svg>
            </a>

            <nav className={`fixed top-0 w-full z-[100] transition-all duration-700 px-8 md:px-16 flex justify-between items-center ${scrolled ? 'h-20 glass-nav shadow-lg' : 'h-28 bg-transparent'}`}>
                <span className={`text-lg md:text-xl font-[950] tracking-tighter uppercase leading-none transition-colors duration-500 ${scrolled ? 'text-slate-900' : 'text-white'}`}>GALLE FORT <span className="text-[#0891B2]">WALKING TOUR</span></span>
                <div className="flex items-center gap-8">
                    {user ? (
                        <div className="text-right flex flex-col items-end">
                            <p className={`text-[10px] font-[950] uppercase tracking-widest leading-none ${scrolled ? 'text-slate-900' : 'text-white'}`}>{user.displayName}</p>
                            <button onClick={() => signOut(auth)} className="text-[9px] font-black text-red-500 uppercase mt-1">Logout</button>
                        </div>
                    ) : (
                        <button onClick={handleGoogleAction} className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase transition-all shadow-xl ${scrolled ? 'bg-[#0F172A] text-white' : 'bg-white text-slate-900'}`}>
                            <img src={GOOGLE_ICON} className="w-4 h-4 rounded-full" /> Google Login
                        </button>
                    )}
                </div>
            </nav>

            <section className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-[#0F172A]">
                <div className="absolute inset-0 z-0">
                    <AnimatePresence initial={false}>
                        <motion.img key={slideIndex} src={BACKGROUND_SLIDES[slideIndex]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="absolute inset-0 w-full h-full object-cover ken-burns" />
                    </AnimatePresence>
                    <div className="absolute inset-0 hero-gradient z-10" />
                </div>
                <div className="relative z-20 text-center px-6 w-full max-w-7xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <span className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-2xl px-6 py-2.5 rounded-full text-[10px] font-[900] uppercase tracking-[0.5em] text-white border border-white/10 mb-10 shadow-2xl"><Clock size={14} className="text-[#0891B2]" /> 90 Minute Guided Story</span>
                    </motion.div>
                    <div className="h-[120px] md:h-[200px] flex flex-col justify-center mb-6">
                        <AnimatePresence mode="wait">
                            <motion.div key={textIndex} initial={{ opacity: 0, filter: "blur(20px)", scale: 0.9 }} animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }} exit={{ opacity: 0, filter: "blur(20px)", scale: 1.1 }} transition={{ duration: 1.2 }}>
                                <h1 className="text-4xl sm:text-6xl md:text-[5.4rem] font-[950] text-outline leading-tight uppercase mb-1">{ROTATING_HEADLINES[textIndex].top}</h1>
                                <h2 className={`text-4xl sm:text-6xl md:text-[5.4rem] font-[950] leading-none tracking-tighter uppercase italic bg-gradient-to-r ${ROTATING_HEADLINES[textIndex].color} bg-clip-text text-transparent`}>{ROTATING_HEADLINES[textIndex].bottom}</h2>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl mx-auto mt-12 leading-relaxed high-vis-text">Explore the living history of the Dutch Fort with <span className="text-white font-[950]">Madawa</span>, the most recommended resident local guide.</p>
                    <div className="mt-14 flex flex-wrap justify-center gap-8">
                        <a href="#book" className="bg-[#0891B2] text-white px-12 py-4 rounded-full font-[900] text-[11px] uppercase shadow-2xl hover:bg-white hover:text-[#0891B2] transition-all transform hover:-translate-y-1">Book Walk</a>
                        <a href={TRIPADVISOR_URL} target="_blank" className="bg-white/5 backdrop-blur-2xl text-white border border-white/20 px-12 py-4 rounded-full font-[900] text-[11px] uppercase">TripAdvisor</a>
                    </div>
                </div>
            </section>

            <main className="container mx-auto px-6 py-24 max-w-7xl">
                <div className="grid lg:grid-cols-12 gap-20">
                    <div className="lg:col-span-7 space-y-24">
                        <section className="space-y-12">
                            <h3 className="text-3xl font-[950] uppercase tracking-tighter text-slate-900 border-b-[8px] border-[#0891B2] pb-1 inline-block">The Experience</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {[{ n: "Bill S.", t: "Highly recommended resident guide. Friendly and fun tour!" }, { n: "Hima M.", t: "The trip was full of facts and humour. Best way to see Galle." }].map((fb, i) => (
                                    <div key={i} className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100/50">
                                        <p className="text-slate-600 italic text-base leading-relaxed mb-6">"{fb.t}"</p>
                                        <p className="text-[10px] font-[900] uppercase text-[#0891B2]">Guest: {fb.n}</p>
                                    </div>
                                ))}
                            </div>
                            <a href={TRIPADVISOR_URL} target="_blank" className="flex items-center justify-between p-8 bg-[#00af87] rounded-[2.5rem] text-white shadow-lg transition-all hover:scale-[1.02]">
                                <div className="flex items-center gap-6"><img src="https://static.tacdn.com/img2/brand_refresh_2025/logos/wordmark.svg" className="h-6 brightness-0 invert" alt="TA" /><span className="font-black text-xl underline decoration-white/20 underline-offset-[8px]">250+ Verified Reviews</span></div>
                                <ArrowRight size={24} />
                            </a>
                            <div className="space-y-6">
                                <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400"><Camera size={16} className="text-[#0891B2]" /> Moments From Our Walks</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {TOUR_GALLERY.map((img, i) => (<div key={i} className="rounded-2xl overflow-hidden shadow-md"><img src={img} alt="Moment" className="w-full h-full object-cover aspect-square" /></div>))}
                                </div>
                            </div>
                        </section>
                        <div ref={bookingsRef}>
                            {user && myBookings.length > 0 && (
                                <section className="pt-10 border-t border-slate-100">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8">Active Bookings</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {myBookings.map((b) => (
                                            <div key={b.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"><p className="text-[8px] font-black uppercase text-[#0891B2] mb-3">{b.bookingType}</p><h4 className="text-2xl font-[950] text-slate-900 leading-none mb-1">{b.date}</h4><p className="text-xs font-bold text-slate-400 mb-6">{b.time}</p><div className="flex items-center justify-between pt-4 border-t border-slate-50 text-[10px] font-black uppercase text-emerald-500">Confirmed ✅</div></div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    <aside id="book" className="lg:col-span-5">
                        <div className="bg-white p-10 md:p-12 rounded-[4rem] shadow-[0_40px_80px_rgba(0,0,0,0.06)] border border-slate-100 sticky top-32">
                            <div className="flex justify-between items-end mb-10"><h3 className="text-2xl font-[950] uppercase leading-none">Book</h3><div className="text-right"><span className="text-4xl font-[950]">${bookingType === 'Group Walk' ? settings.groupPrice : settings.privatePrice}</span><p className="text-[9px] font-black uppercase text-slate-400">per person</p></div></div>
                            <form onSubmit={handleBooking} className="space-y-4">
                                <div className="flex p-1 bg-slate-100 rounded-[1.8rem] mb-8">
                                    {['Group Walk', 'Private Tour'].map(t => (<button key={t} type="button" onClick={() => setBookingType(t)} className={`flex-1 py-3 rounded-[1.4rem] font-[900] text-[9px] uppercase tracking-widest ${bookingType === t ? 'bg-[#0891B2] text-white shadow-xl' : 'text-slate-400'}`}>{t}</button>))}
                                </div>
                                <input required className="bg-slate-50 w-full p-4 rounded-2xl border border-slate-100 text-sm font-bold outline-none" placeholder="Lead Guest Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                <div className="relative"><select className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold appearance-none outline-none" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}>{ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}</select><ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" /></div>
                                <input required className="bg-slate-50 w-full p-4 rounded-2xl border border-slate-100 text-sm font-bold outline-none" placeholder="WhatsApp / Telegram" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                <div className="grid grid-cols-2 gap-4"><div className="bg-slate-50 p-4 rounded-xl"><label className="block text-[8px] font-black text-slate-400 uppercase mb-2">Date</label><input required type="date" className="bg-transparent w-full text-xs font-black outline-none" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div><div className="bg-slate-50 p-4 rounded-xl"><label className="block text-[8px] font-black text-slate-400 uppercase mb-2">Time</label><select className="bg-transparent w-full text-xs font-black outline-none appearance-none cursor-pointer" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}>{STARTING_TIMES.map(t => <option key={t} value={t}>{t}</option>)}</select></div></div>
                                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100"><label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Number of People</label><div className="flex items-center justify-between"><button type="button" onClick={() => setForm(f => ({ ...f, peopleCount: Math.max(1, f.peopleCount - 1) }))} className="w-10 h-10 rounded-full bg-white border flex items-center justify-center font-bold shadow-sm">-</button><span className="text-xl font-black text-[#0891B2]">{form.peopleCount}</span><button type="button" onClick={() => setForm(f => ({ ...f, peopleCount: Math.min(20, f.peopleCount + 1) }))} className="w-10 h-10 rounded-full bg-white border flex items-center justify-center font-bold shadow-sm">+</button></div></div>
                                <button disabled={isSubmitting} className="w-full py-5 bg-[#0F172A] text-white rounded-[2rem] font-[900] uppercase text-[10px] shadow-lg mt-10 hover:bg-[#0891B2] transition-all flex items-center justify-center gap-3">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : user ? "Book Now" : <><img src={GOOGLE_ICON} className="w-4 h-4 rounded-full" /> Google Login to Book</>}
                                </button>
                            </form>
                        </div>
                    </aside>
                </div>
            </main>

            <section className="container mx-auto px-6 mb-24 max-w-7xl">
                <div className="bg-[#0891B2] rounded-[4rem] p-12 md:p-20 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden group">
                    <div className="max-w-xl relative z-10 text-center md:text-left"><h2 className="text-3xl md:text-5xl font-[950] tracking-tighter mb-6 uppercase leading-none">WANT OTHER <br />EXPERIENCES?</h2><p className="text-cyan-50 text-lg italic opacity-90 mb-0">Discover boat safaris and rainforest treks beyond the fort walls.</p></div>
                    <a href="https://www.galleexperience.com/" target="_blank" className="bg-white text-[#0891B2] px-10 py-5 rounded-full font-black uppercase text-[11px] tracking-widest shadow-xl flex items-center gap-3">Galle Experience <ExternalLink size={16} /></a>
                </div>
            </section>
            <footer className="bg-[#0F172A] py-16 text-center text-white/20 border-t border-white/5 uppercase text-[10px] tracking-[1.5em] font-black px-4 leading-relaxed">HERITAGE • STORYTELLING • GALLE</footer>
            <AnimatePresence>{status === 'success' && (<motion.div initial={{ y: -100 }} animate={{ y: 24 }} className="fixed top-0 left-0 right-0 z-[300] flex justify-center px-4"><div className="bg-white px-10 py-5 rounded-full shadow-2xl flex items-center gap-6 border border-emerald-100"><div className="bg-emerald-500 text-white p-2.5 rounded-full"><CheckCircle2 size={24} /></div><span className="text-sm font-[900] uppercase">Booking Confirmed!</span><button onClick={() => setStatus(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} /></button></div></motion.div>)}</AnimatePresence>
        </div>
    );
};

export default GalleFortTour;
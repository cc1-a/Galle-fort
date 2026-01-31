import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot, collection, query, orderBy, deleteDoc, updateDoc } from 'firebase/firestore';
import { Trash2, Save, LogOut, Calendar, Clock, Phone, User, Users, Search, ChevronDown, CheckCircle, XCircle, AlertCircle, BarChart3, Wallet, Eye, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPanel = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [settings, setSettings] = useState({ groupPrice: "12", privatePrice: "40" });
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ visits: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, name, price
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, bookings, settings

  const handleAuth = (e) => {
    e.preventDefault();
    if (password === "galleadmin2026") setIsAuthorized(true);
    else alert("Access Denied");
  };

  useEffect(() => {
    if (!isAuthorized) return;

    // Fetch Settings
    onSnapshot(doc(db, "admin", "settings"), (docSnap) => {
      if (docSnap.exists()) setSettings(docSnap.data());
    });

    // Fetch Stats
    onSnapshot(doc(db, "admin", "stats"), (docSnap) => {
      if (docSnap.exists()) setStats(docSnap.data());
    });

    // Fetch Bookings
    const q = query(collection(db, "bookings"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [isAuthorized]);

  const updateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "bookings", id), { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Derived Data
  const totalRevenue = bookings.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
  const filteredBookings = bookings
    .filter(b =>
      b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "newest") return b.timestamp - a.timestamp;
      if (sortBy === "oldest") return a.timestamp - b.timestamp;
      if (sortBy === "price") return parseFloat(b.price) - parseFloat(a.price);
      if (sortBy === "name") return a.name?.localeCompare(b.name);
      return 0;
    });

  const statusColors = {
    'pending': 'bg-amber-100 text-amber-700 border-amber-200',
    'confirmed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'completed': 'bg-blue-100 text-blue-700 border-blue-200',
    'cancelled': 'bg-red-100 text-red-700 border-red-200'
  };

  if (!isAuthorized) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0F172A] p-6">
        <motion.form
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          onSubmit={handleAuth} className="bg-white/10 backdrop-blur-xl p-12 rounded-[3rem] shadow-2xl w-full max-w-md border border-white/20">
          <h1 className="text-3xl font-black mb-8 text-center uppercase tracking-tighter text-white">Admin Command</h1>
          <input type="password" placeholder="System Key" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl mb-6 font-bold text-white outline-none placeholder:text-white/30 focus:bg-white/10 transition-all" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="w-full py-5 bg-[#0891B2] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white hover:text-[#0891B2] transition-all shadow-lg hover:shadow-[#0891B2]/50">Unlock System</button>
        </motion.form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 selection:bg-cyan-100">
      {/* Sidebar */}
      <aside className="w-20 lg:w-72 bg-[#0F172A] text-white fixed h-full flex flex-col items-center lg:items-start p-6 z-50">
        <div className="mb-12 hidden lg:block">
          <h2 className="text-2xl font-black tracking-tighter italic">GALLE FORT</h2>
          <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#0891B2]">Admin Portal</h3>
        </div>
        <div className="flex-1 space-y-4 w-full">
          {[
            { id: 'dashboard', icon: BarChart3, label: 'Overview' },
            { id: 'bookings', icon: Users, label: 'Bookings' },
            { id: 'settings', icon: Wallet, label: 'Pricing' },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-center lg:justify-start gap-4 p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-[#0891B2] text-white shadow-lg shadow-cyan-900/50' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <item.icon size={24} />
              <span className="hidden lg:block font-bold text-sm uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => window.location.reload()} className="mt-auto w-full flex items-center justify-center lg:justify-start gap-4 p-4 text-red-400 hover:bg-red-500/10 rounded-2xl transition-colors">
          <LogOut size={24} />
          <span className="hidden lg:block font-bold text-sm uppercase tracking-wider">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-20 lg:ml-72 p-8 lg:p-12 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto space-y-12">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-[900] tracking-tighter uppercase mb-2">Dashboard</h1>
              <p className="text-slate-400 font-medium">Welcome back, Administrator.</p>
            </div>
            <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">System Online</span>
            </div>
          </div>

          {/* Stats Grid */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-4 text-slate-400">
                  <div className="p-3 bg-cyan-50 rounded-2xl text-[#0891B2]"><Eye size={24} /></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">Total Visits</h3>
                </div>
                <p className="text-5xl font-[900] tracking-tighter">{stats.visits || 0}</p>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-4 text-slate-400">
                  <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><Wallet size={24} /></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">Est. Revenue</h3>
                </div>
                <p className="text-5xl font-[900] tracking-tighter">${totalRevenue}</p>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-4 text-slate-400">
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Users size={24} /></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">Total Bookings</h3>
                </div>
                <p className="text-5xl font-[900] tracking-tighter">{bookings.length}</p>
              </div>
            </div>
          )}

          {/* Bookings Management */}
          {(activeTab === 'dashboard' || activeTab === 'bookings') && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b pb-6">
                <h2 className="text-2xl font-[900] uppercase tracking-tighter">Recent Bookings</h2>
                <div className="flex gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-slate-200 font-bold text-sm outline-none focus:border-[#0891B2] transition-colors" placeholder="Search guests..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                  <div className="relative">
                    <select className="appearance-none bg-white pl-6 pr-10 py-3 rounded-xl border border-slate-200 font-bold text-sm outline-none cursor-pointer" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price">Highest Price</option>
                      <option value="name">Guest Name</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <AnimatePresence>
                  {filteredBookings.map(b => (
                    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={b.id} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 group hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">

                        {/* Left Info */}
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-xl text-[#0891B2] uppercase select-none">{b.name?.charAt(0)}</div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-black text-lg text-slate-900 leading-none">{b.name}</h3>
                              {/* Status Badge */}
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] uppercase font-black tracking-wider border ${statusColors[b.status || 'pending']}`}>
                                {b.status || 'Pending'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-slate-400 uppercase tracking-wide">
                              <span className="flex items-center gap-1"><Calendar size={12} /> {b.date}</span>
                              <span className="flex items-center gap-1"><Clock size={12} /> {b.time}</span>
                              <span className="flex items-center gap-1 text-[#0891B2]"><Users size={12} /> {b.bookingType} ({b.peopleCount})</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-4 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0 mt-2 lg:mt-0 justify-between lg:justify-end">
                          <div className="text-right mr-4 hidden md:block">
                            <span className="block text-xl font-black">${b.price}</span>
                            <span className="text-[10px] font-black uppercase text-slate-300">Total</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Status Actions */}
                            <div className="relative group/status">
                              <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"><Check size={18} /></button>
                              <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden hidden group-hover/status:block z-10 p-1">
                                {['confirmed', 'completed', 'cancelled'].map(s => (
                                  <button key={s} onClick={() => updateStatus(b.id, s)} className="w-full text-left px-3 py-2 text-[10px] font-black uppercase hover:bg-slate-50 rounded-lg">{s}</button>
                                ))}
                              </div>
                            </div>

                            <button onClick={() => deleteDoc(doc(db, "bookings", b.id))} className="p-3 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all text-red-500"><Trash2 size={18} /></button>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Details */}
                      <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-[10px]">
                          <span className="block font-black text-slate-300 uppercase mb-1">Contact</span>
                          <span className="font-bold text-slate-600">{b.phone}</span>
                        </div>
                        <div className="text-[10px]">
                          <span className="block font-black text-slate-300 uppercase mb-1">Email</span>
                          <span className="font-bold text-slate-600 truncate">{b.userEmail}</span>
                        </div>
                        <div className="text-[10px]">
                          <span className="block font-black text-slate-300 uppercase mb-1">Country</span>
                          <span className="font-bold text-slate-600">{b.country}</span>
                        </div>
                        <div className="text-[10px]">
                          <span className="block font-black text-slate-300 uppercase mb-1">Booked On</span>
                          <span className="font-bold text-slate-600">{b.timestamp?.toDate ? b.timestamp.toDate().toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filteredBookings.length === 0 && (
                  <div className="text-center py-20 opacity-50">
                    <AlertCircle className="mx-auto mb-4 text-slate-300" size={48} />
                    <p className="font-bold text-slate-400">No bookings found matching your criteria.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Panel */}
          {activeTab === 'settings' && (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 max-w-2xl">
              <h3 className="text-xl font-[900] uppercase tracking-tighter mb-8">Pricing Configuration</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 block mb-2 tracking-widest">Group Walk Price ($)</label>
                  <input className="w-full p-5 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 ring-[#0891B2]/20 transition-all" value={settings.groupPrice} onChange={e => setSettings({ ...settings, groupPrice: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 block mb-2 tracking-widest">Private Tour Price ($)</label>
                  <input className="w-full p-5 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 ring-[#0891B2]/20 transition-all" value={settings.privatePrice} onChange={e => setSettings({ ...settings, privatePrice: e.target.value })} />
                </div>
                <button onClick={() => setDoc(doc(db, "admin", "settings"), settings)} className="w-full py-5 bg-[#0F172A] text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-[#0891B2] transition-all"><Save size={18} /> Save System Settings</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
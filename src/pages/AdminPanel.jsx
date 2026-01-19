import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc, onSnapshot, collection, query, orderBy, deleteDoc } from 'firebase/firestore';
import { Trash2, Save, LogOut, Calendar, Clock, Phone, User, Users } from 'lucide-react';

const AdminPanel = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [settings, setSettings] = useState({ groupPrice: "12", privatePrice: "40" });
  const [bookings, setBookings] = useState([]);

  const handleAuth = (e) => {
    e.preventDefault();
    if (password === "galleadmin2026") setIsAuthorized(true);
    else alert("Access Denied");
  };

  useEffect(() => {
    if (!isAuthorized) return;
    onSnapshot(doc(db, "admin", "settings"), (docSnap) => {
      if (docSnap.exists()) setSettings(docSnap.data());
    });
    const q = query(collection(db, "bookings"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [isAuthorized]);

  if (!isAuthorized) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0F172A]">
        <form onSubmit={handleAuth} className="bg-white p-12 rounded-[3rem] shadow-2xl w-[400px]">
          <h1 className="text-2xl font-black mb-8 text-center uppercase tracking-tighter">Admin Portal</h1>
          <input type="password" placeholder="System Key" className="w-full p-4 bg-slate-100 rounded-xl mb-4 font-bold outline-none" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="w-full py-4 bg-[#0F172A] text-white rounded-xl font-black uppercase tracking-widest hover:bg-[#0891B2] transition-all">Unlock</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex justify-between items-center border-b pb-8">
            <h2 className="text-3xl font-[900] tracking-tighter uppercase italic">Tour Management</h2>
            <button onClick={() => window.location.reload()} className="flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold uppercase text-[10px] tracking-widest transition-colors"><LogOut size={16}/> Logout</button>
        </header>

        <div className="grid lg:grid-cols-3 gap-10">
            {/* Price Controls */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl space-y-6 h-fit border border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Price Controls</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Group Walk ($)</label>
                        <input className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" value={settings.groupPrice} onChange={e => setSettings({...settings, groupPrice: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Private Tour ($)</label>
                        <input className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" value={settings.privatePrice} onChange={e => setSettings({...settings, privatePrice: e.target.value})} />
                    </div>
                    <button onClick={() => setDoc(doc(db, "admin", "settings"), settings)} className="w-full py-4 bg-[#0891B2] text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg"><Save size={16}/> Save Prices</button>
                </div>
            </div>

            {/* Booking Feed */}
            <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Live Feed ({bookings.length})</h3>
                <div className="space-y-4">
                    {bookings.map(b => (
                        <div key={b.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative group">
                            <button onClick={() => deleteDoc(doc(db, "bookings", b.id))} className="absolute top-4 right-4 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center font-black text-[#0891B2] border border-slate-100 uppercase">{b.name?.charAt(0)}</div>
                                        <div>
                                            <p className="font-black text-slate-900 leading-none">{b.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{b.userEmail || 'Guest'}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase"><Calendar size={14}/> {b.date}</div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase"><Clock size={14}/> {b.time}</div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase"><Phone size={14}/> {b.phone}</div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase"><Users size={14}/> {b.bookingType}</div>
                                    </div>
                                    {b.participants && (
                                        <div className="mt-4 pt-4 border-t border-slate-50">
                                            <p className="text-[9px] font-black text-slate-300 uppercase mb-2">Participant List:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {b.participants.map((p, i) => (
                                                    <span key={i} className="bg-slate-50 px-3 py-1 rounded-full text-[10px] font-bold text-slate-600 border border-slate-100">{p}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="md:w-24 flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-4">
                                    <span className="text-2xl font-black">${b.price}</span>
                                    <p className="text-[8px] font-black text-slate-400 uppercase">Paid Cash</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
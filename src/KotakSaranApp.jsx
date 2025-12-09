import React, { useState, useEffect } from "react";

// Kotak Saran - Single-file React app (use inside a create-react-app / Vite project)
// Tailwind CSS assumed available. Recharts used for simple chart.

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const ROLES = { STUDENT: "mahasiswa", ADMIN: "admin", LEADER: "pimpinan" };

const STORAGE_KEYS = {
  SUGGESTIONS: "ks_suggestions_v1",
  USERS: "ks_users_v1",
};

// Simple seeded admin user
const seedUsers = () => [
  { id: 1, name: "Admin Fakultas", username: "admin", password: "admin123", role: ROLES.ADMIN },
  { id: 2, name: "Pimpinan Fakultas", username: "pimpinan", password: "pimpinan123", role: ROLES.LEADER },
];

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

export default function KotakSaranApp() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(() => loadFromStorage(STORAGE_KEYS.USERS, seedUsers()));
  const [suggestions, setSuggestions] = useState(() => loadFromStorage(STORAGE_KEYS.SUGGESTIONS, []));
  const [view, setView] = useState("home");

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USERS, users);
  }, [users]);
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SUGGESTIONS, suggestions);
  }, [suggestions]);

  const logout = () => {
    setUser(null);
    setView("home");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-2xl p-6">
        <Header user={user} onLogout={logout} setView={setView} />

        <main className="mt-6">
          {view === "home" && (
            <Home setView={setView} user={user} />
          )}

          {view === "submit" && (
            <SubmitForm
                setView={setView}
                onSubmit={(s) =>
                    setSuggestions((prev) => [{ ...s, id: Date.now() }, ...prev])
                }
            />
        )}

          {view === "login" && (
  <Login
    users={users}
    setView={setView}
    onLogin={(u) => {
      setUser(u);
      setView("dashboard");
    }}
  />
)}


          {view === "dashboard" && user && (user.role === ROLES.ADMIN ? (
            <AdminDashboard
              suggestions={suggestions}
              setSuggestions={setSuggestions}
              users={users}
              setUsers={setUsers}
            />
          ) : user.role === ROLES.LEADER ? (
            <LeaderDashboard suggestions={suggestions} />
          ) : (
            <p className="text-sm text-gray-600">Dashboard tidak tersedia untuk peran ini.</p>
          ))}
        </main>

        <footer className="mt-8 text-center text-xs text-gray-500">Kotak Saran Mahasiswa — Prototype</footer>
      </div>
    </div>
  );
}

function Header({ user, onLogout, setView }) {
  return (
    <div className="flex items-center justify-between p-4 mb-6 bg-white shadow-md rounded-xl">

      {/* KIRI = JUDUL + EMOJI */}
      <div className="flex items-center gap-3">
        <div className="text-indigo-600 text-3xl">🎓</div>

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Kotak Saran Mahasiswa
          </h1>
          <p className="text-sm text-gray-500">Sampaikan aspirasi kampus Anda</p>
        </div>
      </div>

      {/* KANAN = USER + LOGO */}
      <div className="flex items-center gap-4">

        {/* User info jika login */}
        {user && (
          <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-xl">
            {user.name} ({user.role})
          </span>
        )}

        {/* Tombol Logout */}
        {user && (
          <button
            onClick={onLogout}
            className="px-3 py-1 border rounded-xl shadow-sm hover:bg-gray-50 transition"
          >
            Logout
          </button>
        )}

        {/* Logo Kampus */}
        <img
          src="/logo.png"
          alt="Logo Kampus"
          className="w-12 h-12 object-contain"
        />
      </div>

    </div>
  );
}

function Home({ setView, user }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">

      <h1 className="text-3xl font-semibold text-gray-800 mb-8">
        Selamat Datang di Kotak Saran Mahasiswa
      </h1>

      <div className="flex flex-col gap-4 w-full max-w-sm">

        {/* Tombol Kirim Aspirasi */}
        <button
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-lg shadow hover:bg-indigo-700 transition"
          onClick={() => setView("submit")}
        >
          Kirim Aspirasi
        </button>

        {/* Jika belum login, tampilkan tombol Login */}
        {!user && (
          <button
            className="px-6 py-3 bg-white border rounded-xl text-lg shadow hover:bg-gray-50 transition"
            onClick={() => setView("login")}
          >
            Login Admin / Pimpinan
          </button>
        )}

        {/* Jika sudah login, tampilkan tombol Dashboard */}
        {user && (
          <button
            className="px-6 py-3 bg-white border rounded-xl text-lg shadow hover:bg-gray-50 transition"
            onClick={() => setView("dashboard")}
          >
            Buka Dashboard
          </button>
        )}

      </div>
    </div>
  );
}


function SubmitForm({ onSubmit, setView }) {
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("Fasilitas");
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [anon, setAnon] = useState(true);
  const [message, setMessage] = useState(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (!judul.trim() || !isi.trim()) {
      setMessage({ type: "error", text: "Judul dan isi wajib diisi." });
      return;
    }

    const payload = {
      nama: anon ? "Anonim" : nama || "Anonim",
      kategori,
      judul,
      isi,
      status: "baru",
      tanggal: new Date().toISOString(),
    };

    onSubmit(payload);
    setMessage({ type: "success", text: "Aspirasi berhasil dikirim!" });

    setNama("");
    setKategori("Fasilitas");
    setJudul("");
    setIsi("");
    setAnon(true);
  };

  return (
    <form className="space-y-4 card max-w-xl mx-auto" onSubmit={handleSend}>

      <h2 className="text-xl font-semibold text-gray-900">
        Formulir Pengajuan Aspirasi
      </h2>

      {/* Mode Pengiriman */}
      <div>
        <label className="block text-sm font-medium">Mode pengiriman</label>
        <div className="flex gap-4 mt-1 text-sm">
          <label>
            <input type="radio" checked={anon} onChange={() => setAnon(true)} /> Anonim
          </label>
          <label>
            <input type="radio" checked={!anon} onChange={() => setAnon(false)} /> Terdaftar
          </label>
        </div>
      </div>

      {/* Nama */}
      {!anon && (
        <div>
          <label className="block text-sm font-medium">Nama</label>
          <input className="input" value={nama} onChange={(e) => setNama(e.target.value)} />
        </div>
      )}

      {/* Kategori */}
      <div>
        <label className="block text-sm font-medium">Kategori</label>
        <select
          className="select"
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
        >
          <option>Fasilitas</option>
          <option>Akademik</option>
          <option>Administrasi</option>
          <option>Umum</option>
        </select>
      </div>

      {/* Judul */}
      <div>
        <label className="block text-sm font-medium">Judul</label>
        <input className="input" value={judul} onChange={(e) => setJudul(e.target.value)} />
      </div>

      {/* Isi */}
      <div>
        <label className="block text-sm font-medium">Isi Aspirasi</label>
        <textarea
          className="input"
          rows={6}
          value={isi}
          onChange={(e) => setIsi(e.target.value)}
        />
      </div>

      {/* Tombol Aksi */}
      <div className="flex flex-wrap gap-3">
        <button className="btn-primary">Kirim</button>

        <button
          type="button"
          onClick={() => {
            setNama("");
            setKategori("Fasilitas");
            setJudul("");
            setIsi("");
            setAnon(true);
          }}
          className="btn-secondary"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={() => setView("home")}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl shadow transition"
        >
          ← Kembali ke Beranda
        </button>
      </div>

      {/* Pesan */}
      {message && (
        <p
          className={
            "text-sm mt-2 " +
            (message.type === "error" ? "text-red-600" : "text-green-600")
          }
        >
          {message.text}
        </p>
      )}
    </form>
  );
}

function Login({ users, onLogin, setView }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);

  const handle = (e) => {
    e.preventDefault();
    const u = users.find(
      (x) => x.username === username && x.password === password
    );
    if (!u) {
      setErr("Username atau password salah.");
      return;
    }
    onLogin(u);
  };

  return (
    <form onSubmit={handle} className="max-w-sm">
      <h2 className="text-lg font-medium">Login Admin / Pimpinan</h2>

      <div>
        <label className="block text-sm">Username</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm">Password</label>
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded">
          Login
        </button>

        {/* Tombol kembali ke beranda */}
        <button
          type="button"
          onClick={() => setView("home")}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded shadow"
        >
          ← Kembali ke Beranda
        </button>
      </div>

      {err && <p className="text-red-600 text-sm mt-2">{err}</p>}
    </form>
  );
}

function AdminDashboard({ suggestions, setSuggestions, users, setUsers }) {
  const [filter, setFilter] = useState("all");

  const updateStatus = (id, status) => {
    setSuggestions((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
  };
  const remove = (id) => setSuggestions((prev) => prev.filter((s) => s.id !== id));

  const exportCSV = () => {
    const header = ["id","nama","kategori","judul","isi","status","tanggal"];
    const rows = suggestions.map(s => header.map(h => JSON.stringify(s[h] ?? "")).join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'laporan_aspirasi.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const stats = suggestions.reduce((acc, cur) => { acc[cur.kategori] = (acc[cur.kategori]||0)+1; return acc; }, {});
  const chartData = Object.keys(stats).map(k => ({ name: k, value: stats[k] }));

  const filtered = suggestions.filter(s => filter === 'all' ? true : s.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Dashboard Admin</h2>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="px-3 py-1 border rounded">Ekspor CSV</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-3 border rounded">
          <h3 className="font-semibold">Rekap Kategori</h3>
          <div style={{ height: 200 }} className="mt-3">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-3 border rounded">
          <h3 className="font-semibold">Filter & Statistik</h3>
          <div className="mt-3 flex items-center gap-3">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded px-2 py-1">
              <option value="all">Semua</option>
              <option value="baru">Baru</option>
              <option value="diproses">Diproses</option>
              <option value="selesai">Selesai</option>
            </select>
            <div className="text-sm text-gray-600">Total aspirasi: {suggestions.length}</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Nama</th>
              <th className="p-2 text-left">Kategori</th>
              <th className="p-2 text-left">Judul</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b">
                <td className="p-2">{s.id}</td>
                <td className="p-2">{s.nama}</td>
                <td className="p-2">{s.kategori}</td>
                <td className="p-2">{s.judul}</td>
                <td className="p-2">{s.status}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(s.id, 'diproses')} className="px-2 py-1 border rounded text-xs">Proses</button>
                    <button onClick={() => updateStatus(s.id, 'selesai')} className="px-2 py-1 border rounded text-xs">Selesai</button>
                    <button onClick={() => remove(s.id)} className="px-2 py-1 border rounded text-xs">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeaderDashboard({ suggestions }) {
  // Statistik kategori (tetap dipakai)
  const stats = suggestions.reduce((acc, cur) => {
    acc[cur.kategori] = (acc[cur.kategori] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">

      {/* Judul */}
      <div>
        <h2 className="text-xl font-semibold">Dashboard Pimpinan Fakultas</h2>
        <p className="text-sm text-gray-600">
          Ringkasan dan daftar aspirasi mahasiswa.
        </p>
      </div>

      {/* Rekap kategori */}
      <div className="grid md:grid-cols-3 gap-4">
        {Object.entries(stats).map(([k, v]) => (
          <div key={k} className="p-4 border rounded-xl bg-white shadow-sm">
            <h3 className="font-semibold text-gray-800">{k}</h3>
            <div className="text-3xl font-bold text-indigo-600">{v}</div>
          </div>
        ))}
      </div>

      {/* TABEL ASPIRASI (READ ONLY) */}
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full border text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Nama</th>
              <th className="p-2 text-left">Kategori</th>
              <th className="p-2 text-left">Judul</th>
              <th className="p-2 text-left">Isi</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Tanggal</th>
            </tr>
          </thead>

          <tbody>
            {suggestions.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  Belum ada aspirasi.
                </td>
              </tr>
            ) : (
              suggestions.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-2">{s.nama}</td>
                  <td className="p-2">{s.kategori}</td>
                  <td className="p-2">{s.judul}</td>
                  <td className="p-2">{s.isi}</td>
                  <td className="p-2 capitalize">{s.status}</td>
                  <td className="p-2 text-xs">
                    {new Date(s.tanggal).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
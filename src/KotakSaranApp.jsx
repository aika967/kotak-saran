// src/KotakSaranApp.jsx (VERSI SUPABASE)
import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Impor Supabase Client
import { supabase } from "./supabaseClient";

const ROLES = {
  STUDENT: "mahasiswa",
  ADMIN: "admin",
  LEADER: "pimpinan",
};

export default function KotakSaranApp() {
  const [user, setUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [view, setView] = useState("home");
  const [loading, setLoading] = useState(false); // Tambah state loading

  // akun demo
  const [users] = useState([
    {
      id: 1,
      name: "Admin Fakultas",
      username: "admin",
      password: "admin123",
      role: ROLES.ADMIN,
    },
    {
      id: 2,
      name: "Pimpinan Fakultas",
      username: "pimpinan",
      password: "pimpinan123",
      role: ROLES.LEADER,
    },
  ]);

  /* ---------------------------
      SUPABASE HANDLER (Menggantikan LOCAL STORAGE)
  --------------------------- */

  // FUNGSI MENGAMBIL DATA DARI SUPABASE
  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    // Mengambil semua data dari tabel 'saran'. Diurutkan berdasarkan 'tanggal' (atau 'created_at' jika Anda menggunakannya).
    const { data, error } = await supabase
      .from('saran')
      .select('*')
      .order('tanggal', { ascending: false }); // Sesuaikan dengan kolom tanggal di Supabase

    if (error) {
      console.error("Gagal memuat saran dari Supabase:", error);
    } else {
      // Pastikan data yang diambil sesuai dengan format yang diharapkan: id, nama, kategori, judul, isi, status, tanggal
      setSuggestions(data);
    }
    setLoading(false);
  }, []);

  // FUNGSI UNTUK MENGIRIM / MENGUPDATE DATA (dipakai oleh Admin)
  // Catatan: SubmitForm akan memiliki logikanya sendiri untuk INSERT data baru
  async function updateSuggestionData(updatedList) {
    setSuggestions(updatedList);
    // Untuk admin, kita hanya perlu memuat ulang data atau mengirimkan perubahan spesifik.
    // Tapi untuk kesederhanaan, kita hanya memuat ulang daftar.
    await fetchSuggestions();
  }

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const logout = () => {
    setUser(null);
    setView("home");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-2xl p-6">
        <Header user={user} onLogout={logout} setView={setView} />

        <main className="mt-6">
          {view === "home" && <Home setView={setView} user={user} />}

          {view === "submit" && (
            <SubmitForm
              setView={setView}
              // Setelah berhasil SUBMIT ke Supabase, panggil fetchSuggestions untuk update data di state utama
              onSubmitSuccess={fetchSuggestions} 
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

          {view === "dashboard" && user && (
            <>
              {loading && <p className="text-center text-indigo-600">Memuat data...</p>}
              {!loading && user.role === ROLES.ADMIN && (
                <AdminDashboard
                  suggestions={suggestions}
                  updateSuggestionData={updateSuggestionData}
                  fetchSuggestions={fetchSuggestions}
                />
              )}

              {!loading && user.role === ROLES.LEADER && (
                <LeaderDashboard suggestions={suggestions} />
              )}
            </>
          )}
        </main>

        <footer className="mt-8 text-center text-xs text-gray-500">
          Menggunakan Vercel (Frontend) dan Supabase (Backend/Database)
        </footer>
      </div>
    </div>
  );
}

/* ---------------------------
   Header
--------------------------- */
function Header({ user, onLogout, setView }) {
  return (
    <div className="flex items-center justify-between p-4 mb-6 bg-white shadow-md rounded-xl">
      <div className="flex items-center gap-3">
        <div className="text-indigo-600 text-3xl">🎓</div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Kotak Saran Mahasiswa
          </h1>
          <p className="text-sm text-gray-500">Sampaikan aspirasi kalian!</p>
        </div>
      </div>

      <div className="flex items-center gap-4">

        {user && (
          <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-xl">
            {user.name} ({user.role})
          </span>
        )}

        {user ? (
          <button
            onClick={onLogout}
            className="px-3 py-1 border rounded-xl shadow-sm hover:bg-gray-50 transition"
          >
            Logout
          </button>
        ) : null}

        <img src="/logo.png" alt="logo" className="w-12 h-12 object-contain" />
      </div>
    </div>
  );
}


/* ---------------------------
   Home
--------------------------- */
function Home({ setView, user }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">
        Selamat Datang di Kotak Saran Mahasiswa
      </h1>

      <div className="flex flex-col gap-4 w-full max-w-sm">

        <button
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-lg shadow hover:bg-indigo-700 transition"
          onClick={() => setView("submit")}
        >
          Kirim Aspirasi
        </button>

        {!user && (
          <button
            className="px-6 py-3 bg-white border rounded-xl text-lg shadow hover:bg-gray-50 transition"
            onClick={() => setView("login")}
          >
            Login Admin / Pimpinan
          </button>
        )}

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

/* ---------------------------
   SubmitForm (LOCAL MODE)
--------------------------- */
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

    const newItem = {
      id: Date.now(),
      nama: anon ? "Anonim" : nama || "Anonim",
      kategori,
      judul,
      isi,
      status: "baru",
      tanggal: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem("suggestions") || "[]");
    const updated = [newItem, ...existing];

    localStorage.setItem("suggestions", JSON.stringify(updated));

    if (onSubmit) onSubmit(updated);

    setMessage({ type: "success", text: "Aspirasi berhasil dikirim!" });

    setNama("");
    setKategori("Fasilitas");
    setJudul("");
    setIsi("");
    setAnon(true);
  };

  return (
    <form className="space-y-4 card max-w-xl mx-auto" onSubmit={handleSend}>
      <h2 className="text-xl font-semibold">Formulir Pengajuan Aspirasi</h2>

      <div>
        <label className="block text-sm font-medium">Mode pengiriman</label>
        <div className="flex gap-4 mt-1 text-sm">
          <label>
            <input type="radio" checked={anon} onChange={() => setAnon(true)} />{" "}
            Anonim
          </label>
          <label>
            <input
              type="radio"
              checked={!anon}
              onChange={() => setAnon(false)}
            />{" "}
            Terdaftar
          </label>
        </div>
      </div>

      {!anon && (
        <div>
          <label className="block text-sm font-medium">Nama</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">Kategori</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
        >
          <option>Fasilitas</option>
          <option>Akademik</option>
          <option>Administrasi</option>
          <option>Umum</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Judul</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Isi Aspirasi</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          rows={6}
          value={isi}
          onChange={(e) => setIsi(e.target.value)}
        />
      </div>

      <div className="flex gap-3 items-center">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded">
          Kirim
        </button>

        <button
          type="button"
          className="px-4 py-2 border rounded"
          onClick={() => {
            setNama("");
            setKategori("Fasilitas");
            setJudul("");
            setIsi("");
            setAnon(true);
            setMessage(null);
          }}
        >
          Reset
        </button>

        <button
          type="button"
          onClick={() => setView("home")}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          ← Kembali
        </button>
      </div>

      {message && (
        <p
          className={
            message.type === "error" ? "text-red-600" : "text-green-600"
          }
        >
          {message.text}
        </p>
      )}
    </form>
  );
}

/* ---------------------------
   Login
--------------------------- */
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
    <form onSubmit={handle} className="max-w-sm space-y-3">
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

      <div className="flex flex-col gap-2">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded">
          Login
        </button>

        <button
          type="button"
          onClick={() => setView("home")}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          ← Kembali ke Beranda
        </button>
      </div>

      {err && <p className="text-red-600 text-sm">{err}</p>}
    </form>
  );
}

/* ---------------------------
   Admin Dashboard
--------------------------- */
function AdminDashboard({ suggestions, updateSuggestionData, fetchSuggestions }) {
  // Statistik tidak berubah
  const stats = suggestions.reduce((acc, s) => {
    acc[s.kategori] = (acc[s.kategori] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(stats).map((k) => ({
    name: k,
    value: stats[k],
  }));

  // FUNGSI UNTUK UPDATE STATUS DI SUPABASE
  async function updateStatus(id, status) {
    const { error } = await supabase
      .from('saran')
      .update({ status: status }) // Hanya update kolom status
      .eq('id', id); // Di mana id sama dengan id saran

    if (error) {
      console.error("Gagal mengupdate status:", error);
    } else {
      // Setelah berhasil update, ambil ulang data terbaru
      await fetchSuggestions(); 
    }
  }

  // FUNGSI UNTUK MENGHAPUS DI SUPABASE
  async function removeRow(id) {
    if (!window.confirm("Yakin ingin menghapus saran ini?")) return;

    const { error } = await supabase
      .from('saran')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Gagal menghapus saran:", error);
    } else {
      // Setelah berhasil hapus, ambil ulang data terbaru
      await fetchSuggestions();
    }
  }

  // export CSV (TIDAK BERUBAH)
  const exportCSV = () => {
    const header = [
      "id",
      "nama",
      "kategori",
      "judul",
      "isi",
      "status",
      "tanggal",
    ];
    const rows = suggestions.map((s) =>
      header.map((h) => JSON.stringify(s[h] ?? "")).join(",")
    );

    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "laporan_aspirasi.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Dashboard Admin</h2>

        <div className="flex gap-2">
          <button onClick={exportCSV} className="px-3 py-1 border rounded">
            Ekspor CSV
          </button>
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
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-3 border rounded">
          <h3 className="font-semibold">Statistik</h3>
          <p className="mt-3 text-sm text-gray-600">
            Total aspirasi: {suggestions.length}
          </p>
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
            {suggestions.map((s) => (
              <tr key={s.id} className="border-b">
                <td className="p-2">{s.id}</td>
                <td className="p-2">{s.nama}</td>
                <td className="p-2">{s.kategori}</td>
                <td className="p-2">{s.judul}</td>
                <td className="p-2">{s.status}</td>

                <td className="p-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(s.id, "diproses")}
                      className="px-2 py-1 border rounded text-xs"
                    >
                      Proses
                    </button>

                    <button
                      onClick={() => updateStatus(s.id, "selesai")}
                      className="px-2 py-1 border rounded text-xs"
                    >
                      Selesai
                    </button>

                    <button
                      onClick={() => removeRow(s.id)}
                      className="px-2 py-1 border rounded text-xs"
                    >
                      Hapus
                    </button>
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

/* ---------------------------
   LeaderDashboard (read-only)
--------------------------- */
function LeaderDashboard({ suggestions }) {
  const stats = suggestions.reduce((acc, s) => {
    acc[s.kategori] = (acc[s.kategori] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Dashboard Pimpinan Fakultas</h2>
      <p className="text-sm text-gray-600">
        Ringkasan dan daftar aspirasi mahasiswa.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {Object.entries(stats).map(([k, v]) => (
          <div
            key={k}
            className="p-4 border rounded-xl bg-white shadow-sm"
          >
            <h3 className="font-semibold">{k}</h3>
            <div className="text-3xl font-bold text-indigo-600">{v}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto mt-6">
        <table className="min-w-full text-sm border">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2">Nama</th>
              <th className="p-2">Kategori</th>
              <th className="p-2">Judul</th>
              <th className="p-2">Isi</th>
              <th className="p-2">Status</th>
              <th className="p-2">Tanggal</th>
            </tr>
          </thead>

          <tbody>
            {suggestions.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-4 text-center text-gray-500"
                >
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
                  <td className="p-2">{s.status}</td>
                  <td className="p-2">
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
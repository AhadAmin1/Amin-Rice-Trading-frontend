// // const API = import.meta.env.VITE_API_URL || 'https://amin-rice-trading-backend.vercel.app';
// export const API_BASE = "https://amin-rice-trading-backend.vercel.app";

// export const api = {
//   /* ================= PARTIES ================= */
//   getParties: () =>
//     fetch(`${API}/parties`).then(r => r.json()),

//   addParty: (data: any) =>
//     fetch(`${API}/parties`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data),
//     }).then(r => r.json()),

//   updateParty: (id: string, data: any) =>
//     fetch(`${API}/parties/${id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data),
//     }).then(r => r.json()),

//   deleteParty: (id: string) =>
//     fetch(`${API}/parties/${id}`, {
//       method: 'DELETE',
//     }).then(r => r.json()),

//   /* ================= STOCKS ================= */
//   // getStocks: () =>
//   //   fetch(`${API}/stocks`).then(r => r.json()),

//   updateStock: (id: string, data: any) =>
//     fetch(`${API}/stocks/${id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data),
//     }).then(r => r.json()),

//     getStocks: () =>
//   fetch(`${API}/ledger/stock`).then(r => r.json()),


//   /* ================= LEDGER ================= */
//   getLedger: (partyId: string) =>
//     fetch(`${API}/ledger/${partyId}`).then(r => r.json()),

//   addLedger: (data: any) =>
//     fetch(`${API}/ledger`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data),
//     }).then(r => r.json()),

//   updateLedger: (id: string, data: any) =>
//     fetch(`${API}/ledger/${id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data),
//     }).then(r => r.json()),

//   deleteLedger: (id: string) =>
//     fetch(`${API}/ledger/${id}`, {
//       method: 'DELETE',
//     }).then(r => r.json()),

//  /* ================= BILLS ================= */
//   getBills: () => fetch(`${API}/bills`).then(r => r.json()),
//   getBillById: (id: string) => fetch(`${API}/bills/${id}`).then(r => r.json()),
//   createBill: (data: any) =>
//     fetch(`${API}/bills`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data),
//     }).then(r => r.json()),
//   updateBill: (id: string, data: any) =>
//     fetch(`${API}/bills/${id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data),
//     }).then(r => r.json()),
//   deleteBill: (id: string) =>
//     fetch(`${API}/bills/${id}`, { method: 'DELETE' }).then(r => r.json()),
// };


// frontend/src/api.ts

export const API_BASE = import.meta.env.VITE_API_URL || "https://amin-rice-trading-backend.vercel.app/api";


async function request(url: string, options?: RequestInit) {
  try {
    const res = await fetch(`${API_BASE}${url}`, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err: any) {
    console.error("API Error:", err.message);
    throw err;
  }
}

export const api = {
  getParties: () => request("/parties"),
  addParty: (data: any) => request("/parties", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  updateParty: (id: string, data: any) => request(`/parties/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  deleteParty: (id: string) => request(`/parties/${id}`, { method: "DELETE" }),

  getStocks: () => request("/ledger/stock"),
  updateStock: (id: string, data: any) => request(`/stocks/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),

  getLedger: (partyId: string) => request(`/ledger/${partyId}`),
  addLedger: (data: any) => request("/ledger", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  updateLedger: (id: string, data: any) => request(`/ledger/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  deleteLedger: (id: string) => request(`/ledger/${id}`, { method: "DELETE" }),

  getBills: () => request("/bills"),
  getBillById: (id: string) => request(`/bills/${id}`),
  createBill: (data: any) => request("/bills", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  updateBill: (id: string, data: any) => request(`/bills/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  deleteBill: (id: string) => request(`/bills/${id}`, { method: "DELETE" }),
};
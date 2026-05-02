import React, { useEffect, useState } from "react";
import api from "../../api/api";

const AdminDashboard = () => {
  const [pendingShops, setPendingShops] = useState([]);
  const [approvedShops, setApprovedShops] = useState([]);
  const [pendingAgents, setPendingAgents] = useState([]);
  const [approvedAgents, setApprovedAgents] = useState([]);
  const [totalStats, setTotalStats] = useState({
    totalShops: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [refresh, setRefresh] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [notice, setNotice] = useState({ msg: '', type: '' });

  useEffect(() => {
    const fetchShops = async () => {
      const pending = await api.getShopsByStatus("pending");
      const approved = await api.getShopsByStatus("open");
      setPendingShops(pending);
      setApprovedShops(approved);
      setTotalStats((prev) => ({
        ...prev,
        totalShops: pending.length + approved.length,
      }));
    };

    const fetchAgents = async () => {
      const pending = await api.getAgentsByStatus("pending");
      const approved = await api.getAgentsByStatus("approved");
      setPendingAgents(pending);
      setApprovedAgents(approved);
    };

    const fetchSummary = async () => {
      if (approvedShops.length > 0) {
        const shopId = approvedShops[0].id;
        const summary = await api.getShopSalesSummary(shopId);
        setTotalStats((prev) => ({
          ...prev,
          totalOrders: summary.totalOrders,
          totalRevenue: summary.totalRevenue,
        }));
      }
    };

    fetchShops();
    fetchAgents();
    fetchSummary();
  }, [refresh, approvedShops.length]);

  const handleApproveShop = async (shopId) => {
    const ok = await api.approveShop(shopId);
    if (ok) {
      setNotice({ msg: 'Shop approved', type: 'success' });
    } else {
      setNotice({ msg: 'Failed to approve shop', type: 'error' });
    }
    setTimeout(() => setNotice({ msg: '', type: '' }), 3000);
    setRefresh((r) => !r);
  };

  const handleRejectShop = async (shopId, reason) => {
    const res = await api.rejectShop(shopId, reason || 'Not specified');
    if (res) setNotice({ msg: 'Shop rejected', type: 'info' });
    else setNotice({ msg: 'Failed to reject shop', type: 'error' });
    setTimeout(() => setNotice({ msg: '', type: '' }), 3500);
    setRefresh((r) => !r);
    setSelectedShop(null);
  };

  const handleApproveAgent = async (userId) => {
    await api.approveAgent(userId);
    setRefresh((r) => !r);
  };

  const renderList = (items, isPending, approveFn) =>
    items.length === 0 ? (
      <p className="text-gray-400 italic mb-2">
        {isPending ? "No pending items." : "No approved items."}
      </p>
    ) : (
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between bg-slate-800 px-4 py-3 rounded-xl shadow-md hover:bg-slate-700 transition"
          >
            <div className="flex items-center gap-3">
              <div className="font-medium text-gray-200">{item.name || item.email}</div>
              {item.location && <div className="text-xs text-gray-400">• {item.location}</div>}
              {item.type && <div className="text-xs text-gray-400">• {item.type}</div>}
            </div>
            <div className="flex items-center gap-2">
              {isPending ? (
                <>
                  <button
                    onClick={() => setSelectedShop(item)}
                    className="bg-slate-700 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-slate-600 transition"
                  >
                    View
                  </button>
                  <button
                    onClick={() => approveFn(item.id)}
                    className="bg-lime-600 text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-lime-700 transition"
                  >
                    Approve
                  </button>
                </>
              ) : (
                <span className="text-lime-400 font-bold">Approved</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    );

  return (
    <div className="p-6 sm:p-10 bg-slate-900 rounded-2xl shadow-2xl mt-6 sm:mt-10">
      {notice.msg ? (
        <div className={`mb-4 p-3 rounded-xl ${notice.type === 'success' ? 'bg-lime-600 text-slate-900' : notice.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
          {notice.msg}
        </div>
      ) : null}
      {/* Top Statistics */}
      <h2 className="text-3xl font-bold text-white mb-6">
        Admin Dashboard
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-slate-800 rounded-2xl shadow-md text-center transform transition hover:scale-105 duration-300">
          <h3 className="text-4xl font-extrabold text-lime-400 mb-2">
            {totalStats.totalShops}
          </h3>
          <p className="text-gray-300">Total Shops</p>
        </div>
        <div className="p-6 bg-slate-800 rounded-2xl shadow-md text-center transform transition hover:scale-105 duration-300">
          <h3 className="text-4xl font-extrabold text-lime-400 mb-2">
            {totalStats.totalOrders}
          </h3>
          <p className="text-gray-300">Total Orders</p>
        </div>
        <div className="p-6 bg-slate-800 rounded-2xl shadow-md text-center transform transition hover:scale-105 duration-300">
          <h3 className="text-4xl font-extrabold text-lime-400 mb-2">
            ${totalStats.totalRevenue}
          </h3>
          <p className="text-gray-300">Total Revenue</p>
        </div>
      </div>

      {/* Pending/Approved Shops and Agents */}
      <h3 className="text-2xl font-bold text-lime-400 mb-6">
        Review and Approve
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div>
          <h4 className="text-xl font-semibold text-white mb-3">
            Pending Shops
          </h4>
          {renderList(pendingShops, true, handleApproveShop)}
        </div>
        <div>
          <h4 className="text-xl font-semibold text-white mb-3">
            Approved Shops
          </h4>
          {renderList(approvedShops, false)}
        </div>
      </div>

      {/* Shop review modal */}
      {selectedShop ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-w-2xl w-full bg-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">Review Shop: {selectedShop.name}</h3>
                <p className="text-sm text-gray-400">Submitted: {new Date(selectedShop.created_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedShop(null)} className="text-gray-300 hover:text-white">Close</button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4">
              {selectedShop.profileImage && <img src={selectedShop.profileImage} alt="profile" className="w-48 h-32 object-cover rounded" />}
              <p className="text-gray-300"><strong>Type:</strong> {selectedShop.type || 'N/A'}</p>
              <p className="text-gray-300"><strong>Location:</strong> {selectedShop.location || 'N/A'}</p>
              <p className="text-gray-300"><strong>Description:</strong> {selectedShop.description || 'N/A'}</p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={() => handleRejectShop(selectedShop.id, 'Failed validation')} className="bg-red-600 px-4 py-2 rounded text-white font-semibold">Reject</button>
              <button onClick={() => handleApproveShop(selectedShop.id)} className="bg-lime-600 px-4 py-2 rounded text-slate-900 font-bold">Approve</button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-xl font-semibold text-white mb-3">
            Pending Agents
          </h4>
          {renderList(pendingAgents, true, handleApproveAgent)}
        </div>
        <div>
          <h4 className="text-xl font-semibold text-white mb-3">
            Approved Agents
          </h4>
          {renderList(approvedAgents, false)}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

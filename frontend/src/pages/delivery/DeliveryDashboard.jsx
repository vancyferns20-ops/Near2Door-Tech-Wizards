import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import Button from '../../components/UI/Button';
import MapTracker from '../../components/UI/MapTracker';

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMapOrder, setActiveMapOrder] = useState(null);
  const [agentLocation, setAgentLocation] = useState(null);

  const agentId = user?.id;

  // --- Track agent live location ---
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) =>
        setAgentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error('Geolocation error:', err),
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // --- Fetch assigned orders ---
  useEffect(() => {
    const fetchAssignedOrders = async () => {
      try {
        const res = await api.getAgentOrders(agentId);
        if (Array.isArray(res.data)) {
          const ordersWithEarnings = res.data.map(order => ({
            ...order,
            earning: order.earning || 50,
          }));
          setAssignedOrders(ordersWithEarnings);
        } else {
          setError('Unexpected API response format.');
          console.error('API response is not an array:', res);
        }
      } catch (e) {
        setError('Failed to fetch assigned orders.');
        console.error('Error fetching assigned orders:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignedOrders();
  }, [agentId]);

  // --- Update order status ---
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.updateDeliveryStatus(orderId, newStatus);
      setAssignedOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      if (newStatus === 'delivered' && activeMapOrder === orderId) {
        setActiveMapOrder(null);
      }
    } catch (e) {
      console.error('Failed to update order status:', e);
      console.log('Could not update order status. Please try again.');
    }
  };

  // --- Toggle map visibility ---
  const handleShowMap = (orderId) => {
    setActiveMapOrder(prev => (prev === orderId ? null : orderId));
  };

  // --- Earnings calculations ---
  const totalEarnings = assignedOrders.reduce((sum, order) => sum + (order.earning || 0), 0);
  const weeklyEarnings = assignedOrders
    .filter(order => order.status === 'delivered' && order.deliveredAt)
    .reduce((sum, order) => sum + (order.earning || 0), 0);

  if (loading) return <div className="p-10 text-center font-bold text-gray-400">Loading assigned orders...</div>;
  if (error) return <div className="p-10 text-center text-red-500 font-medium">{error}</div>;

  const currentMapOrder = assignedOrders.find(order => order.id === activeMapOrder);

  return (
    <div className="bg-slate-900 text-white min-h-[calc(100vh-140px)] py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-lime-400 drop-shadow-lg leading-tight mb-2">
            Delivery Dashboard
          </h1>
          <p className="text-lg md:text-xl text-gray-300">
            Welcome, {user?.name || 'Agent'}! Here are your assigned orders.
          </p>
        </div>

        {/* Earnings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-8 rounded-3xl shadow-xl flex items-center justify-between transition-transform duration-300 hover:scale-[1.02]">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 text-lime-600">
                {/* Wallet Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M10 12h4a2 2 0 0 0 0-4h-4v8"/></svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Total Earnings</h3>
                <p className="text-3xl font-extrabold text-lime-600">₹{totalEarnings.toFixed(2)}</p>
              </div>
            </div>
            <span className="text-gray-400 text-sm italic hidden sm:block">All-time earnings</span>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl flex items-center justify-between transition-transform duration-300 hover:scale-[1.02]">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 text-lime-600">
                {/* Calendar Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><path d="M21 17.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11.5"/><path d="M3 10h18"/><path d="m16 22 3.5-3.5L22 20"/><path d="m19 19 1.5 1.5"/></svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Weekly Earnings</h3>
                <p className="text-3xl font-extrabold text-lime-600">₹{weeklyEarnings.toFixed(2)}</p>
              </div>
            </div>
            <span className="text-gray-400 text-sm italic hidden sm:block">Earnings this week</span>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {assignedOrders.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl text-center shadow-xl">
              <p className="text-gray-600 text-xl font-medium">
                🚚 No assigned orders right now. Enjoy your break!
              </p>
            </div>
          ) : (
            assignedOrders.map(order => (
              <div
                key={order.id}
                className="bg-white p-6 md:p-8 rounded-3xl shadow-xl transition-transform duration-300 hover:scale-[1.01]"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="mb-4 md:mb-0 md:mr-6 flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Order ID: {order.id}</h3>
                    <p className="text-gray-600 text-sm md:text-base">From: <span className="font-semibold text-gray-800">{order.shopName}</span></p>
                    <p className="text-gray-600 text-sm md:text-base">To: <span className="font-semibold text-gray-800">{order.customerName}</span></p>
                    <p className="text-gray-600 text-sm md:text-base">Address: <span className="font-semibold text-gray-800">{order.customerAddress}</span></p>
                  </div>

                  <div className="flex flex-col items-start md:items-end w-full md:w-auto">
                    <p className="text-lg font-bold text-lime-600 mb-4">
                      Status: <span className="font-semibold capitalize">{order.status}</span>
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                      {order.status !== 'delivered' && (
                        <>
                          <Button onClick={() => handleUpdateStatus(order.id, 'picked up')} primary={false} className="bg-orange-500 text-white hover:bg-orange-600">Picked Up</Button>
                          <Button onClick={() => handleUpdateStatus(order.id, 'delivered')} primary={false} className="bg-green-500 text-white hover:bg-green-600">Delivered</Button>
                          <Button onClick={() => handleShowMap(order.id)} primary={false} className="bg-blue-500 text-white hover:bg-blue-600">
                            {activeMapOrder === order.id ? 'Hide Map' : 'See Map'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Map Tracker with animation */}
                {activeMapOrder === order.id &&
                  currentMapOrder?.customer_location &&
                  agentLocation && (
                    <div className="mt-6 overflow-hidden transition-all duration-300 ease-in-out">
                      <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                        <div className="aspect-[4/3] sm:aspect-[16/9]">
                          <MapTracker
                            mapId={`map-${order.id}`}
                            agentLocation={agentLocation}
                            customerLocation={currentMapOrder.customer_location}
                          />
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;

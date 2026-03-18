import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Car, CreditCard, Banknote, ArrowRight, CheckCircle2, Navigation, Search, MousePointer2 } from 'lucide-react';
import { VehicleType } from '../types';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapUpdater({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coords, map]);
  return null;
}

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function BookRide() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  
  const [formData, setFormData] = useState({
    customer: {
      name: '',
      phone: '',
      email: ''
    },
    booking: {
      pickup: '',
      dropoff: '',
      date: '',
      passengers: 1,
      vehicleTypeId: 0,
      paymentMethod: 'cash',
      price: 0
    }
  });

  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<any[]>([]);
  const [selectingFor, setSelectingFor] = useState<'pickup' | 'dropoff' | null>(null);
  const [isSearching, setIsSearching] = useState({ pickup: false, dropoff: false });

  // Haversine formula to calculate distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      const d = calculateDistance(pickupCoords[0], pickupCoords[1], dropoffCoords[0], dropoffCoords[1]);
      setDistance(d);
    } else {
      setDistance(null);
    }
  }, [pickupCoords, dropoffCoords]);

  // Geocoding logic for suggestions
  const fetchSuggestions = async (query: string, type: 'pickup' | 'dropoff') => {
    if (query.length < 3) {
      if (type === 'pickup') setPickupSuggestions([]);
      else setDropoffSuggestions([]);
      return;
    }
    
    setIsSearching(prev => ({ ...prev, [type]: true }));
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=vn`);
      const data = await res.json();
      if (type === 'pickup') setPickupSuggestions(data);
      else setDropoffSuggestions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSuggestionClick = (suggestion: any, type: 'pickup' | 'dropoff') => {
    const coords: [number, number] = [parseFloat(suggestion.lat), parseFloat(suggestion.lon)];
    const address = suggestion.display_name;
    
    setFormData(prev => ({
      ...prev,
      booking: { ...prev.booking, [type]: address }
    }));
    
    if (type === 'pickup') {
      setPickupCoords(coords);
      setPickupSuggestions([]);
    } else {
      setDropoffCoords(coords);
      setDropoffSuggestions([]);
    }
  };

  const handleMapClick = async (lat: number, lon: number) => {
    if (!selectingFor) return;
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      
      // Check if the location is in Vietnam
      if (data.address && data.address.country_code !== 'vn') {
        alert("Vui lòng chọn vị trí trong lãnh thổ Việt Nam.");
        setSelectingFor(null);
        return;
      }

      const address = data.display_name;
      
      setFormData(prev => ({
        ...prev,
        booking: { ...prev.booking, [selectingFor]: address }
      }));
      
      if (selectingFor === 'pickup') setPickupCoords([lat, lon]);
      else setDropoffCoords([lat, lon]);
      
      setSelectingFor(null);
    } catch (e) {
      console.error(e);
    }
  };

  const performManualSearch = async (type: 'pickup' | 'dropoff') => {
    const query = formData.booking[type];
    if (!query) return;
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=vn`);
      const data = await res.json();
      if (data && data[0]) {
        const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        if (type === 'pickup') setPickupCoords(coords);
        else setDropoffCoords(coords);
        
        if (type === 'pickup') setPickupSuggestions([]);
        else setDropoffSuggestions([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetch('/api/vehicle-types')
      .then(res => res.json())
      .then(data => {
        setVehicleTypes(data);
        if (data.length > 0) {
          setFormData(prev => ({
            ...prev,
            booking: { ...prev.booking, vehicleTypeId: data[0].id }
          }));
        }
      });
  }, []);

  const calculatePrice = () => {
    if (!distance) return 0;
    
    const selectedType = vehicleTypes.find(t => t.id === formData.booking.vehicleTypeId);
    if (!selectedType) return 0;

    let basePrice = 0;
    let extraFee = 0;

    // Pricing based on the provided table (middle values)
    switch (selectedType.seats) {
      case 9:
        basePrice = 2600000;
        extraFee = 12000;
        break;
      case 16:
        basePrice = 2000000;
        extraFee = 9000;
        break;
      case 29:
        basePrice = 3000000;
        extraFee = 11000;
        break;
      case 45:
        basePrice = 5700000;
        extraFee = 20000;
        break;
      default:
        basePrice = 1500000;
        extraFee = 10000;
    }

    const baseDistance = 100;
    if (distance <= baseDistance) {
      return basePrice;
    } else {
      return basePrice + (distance - baseDistance) * extraFee;
    }
  };

  const handleNext = () => {
    if (step === 1) {
      setFormData(prev => ({
        ...prev,
        booking: { ...prev.booking, price: calculatePrice() }
      }));
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        navigate(`/confirmation?id=${data.bookingId}`);
      }
    } catch (error) {
      console.error('Error booking:', error);
    }
  };

  const allCoords = [pickupCoords, dropoffCoords].filter((c): c is [number, number] => c !== null);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Progress Bar */}
        <div className="mb-12 flex items-center justify-center gap-4">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {s}
              </div>
              {s < 3 && <div className={`h-1 w-12 rounded ${step > s ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
          <div className="p-8 md:p-12">
            {step === 1 && (
              <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <h2 className="text-3xl font-black text-gray-900 leading-none">Thông Tin Chuyến Đi</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="relative">
                        <InputGroup label="Điểm Đón" icon={<MapPin className="text-emerald-500" size={20} />}>
                          <div className="relative group">
                            <input 
                              type="text" 
                              placeholder="Nhập địa chỉ đón"
                              className={`w-full py-4 pl-5 pr-24 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium ${selectingFor === 'pickup' ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-gray-100'}`}
                              value={formData.booking.pickup}
                              onChange={e => {
                                setFormData({...formData, booking: {...formData.booking, pickup: e.target.value}});
                                fetchSuggestions(e.target.value, 'pickup');
                              }}
                              onFocus={() => setSelectingFor('pickup')}
                              onKeyDown={e => e.key === 'Enter' && performManualSearch('pickup')}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                              {formData.booking.pickup && (
                                <button 
                                  onClick={() => {
                                    setFormData({...formData, booking: {...formData.booking, pickup: ''}});
                                    setPickupCoords(null);
                                    setPickupSuggestions([]);
                                  }}
                                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <Search size={16} className="rotate-45" />
                                </button>
                              )}
                              <button 
                                onClick={() => setSelectingFor(selectingFor === 'pickup' ? null : 'pickup')}
                                className={`p-2 rounded-xl transition-all ${selectingFor === 'pickup' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:bg-gray-100'}`}
                                title="Chọn trên bản đồ"
                              >
                                <MousePointer2 size={18} />
                              </button>
                            </div>
                          </div>
                        </InputGroup>
                        {pickupSuggestions.length > 0 && (
                          <div className="absolute z-[1001] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            {pickupSuggestions.map((s, i) => (
                              <button 
                                key={i}
                                onClick={() => handleSuggestionClick(s, 'pickup')}
                                className="w-full text-left px-5 py-4 hover:bg-emerald-50 transition-colors flex items-start gap-4 border-b border-gray-50 last:border-0"
                              >
                                <div className="mt-1 w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                  <MapPin size={16} className="text-emerald-500" />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-gray-900 line-clamp-1">{s.address?.name || s.display_name.split(',')[0]}</div>
                                  <div className="text-xs text-gray-500 line-clamp-1">{s.display_name}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <InputGroup label="Điểm Đến" icon={<MapPin className="text-red-500" size={20} />}>
                          <div className="relative group">
                            <input 
                              type="text" 
                              placeholder="Nhập địa chỉ đến"
                              className={`w-full py-4 pl-5 pr-24 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium ${selectingFor === 'dropoff' ? 'border-red-500 ring-4 ring-red-500/10' : 'border-gray-100'}`}
                              value={formData.booking.dropoff}
                              onChange={e => {
                                setFormData({...formData, booking: {...formData.booking, dropoff: e.target.value}});
                                fetchSuggestions(e.target.value, 'dropoff');
                              }}
                              onFocus={() => setSelectingFor('dropoff')}
                              onKeyDown={e => e.key === 'Enter' && performManualSearch('dropoff')}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                              {formData.booking.dropoff && (
                                <button 
                                  onClick={() => {
                                    setFormData({...formData, booking: {...formData.booking, dropoff: ''}});
                                    setDropoffCoords(null);
                                    setDropoffSuggestions([]);
                                  }}
                                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <Search size={16} className="rotate-45" />
                                </button>
                              )}
                              <button 
                                onClick={() => setSelectingFor(selectingFor === 'dropoff' ? null : 'dropoff')}
                                className={`p-2 rounded-xl transition-all ${selectingFor === 'dropoff' ? 'bg-red-500 text-white' : 'text-gray-400 hover:bg-gray-100'}`}
                                title="Chọn trên bản đồ"
                              >
                                <MousePointer2 size={18} />
                              </button>
                            </div>
                          </div>
                        </InputGroup>
                        {dropoffSuggestions.length > 0 && (
                          <div className="absolute z-[1001] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            {dropoffSuggestions.map((s, i) => (
                              <button 
                                key={i}
                                onClick={() => handleSuggestionClick(s, 'dropoff')}
                                className="w-full text-left px-5 py-4 hover:bg-red-50 transition-colors flex items-start gap-4 border-b border-gray-50 last:border-0"
                              >
                                <div className="mt-1 w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                  <MapPin size={16} className="text-red-500" />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-gray-900 line-clamp-1">{s.address?.name || s.display_name.split(',')[0]}</div>
                                  <div className="text-xs text-gray-500 line-clamp-1">{s.display_name}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    <InputGroup label="Ngày & Giờ" icon={<Calendar className="text-blue-500" size={20} />}>
                      <input 
                        type="datetime-local" 
                        className="w-full py-4 px-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                        value={formData.booking.date}
                        onChange={e => setFormData({...formData, booking: {...formData.booking, date: e.target.value}})}
                      />
                    </InputGroup>
                    <InputGroup label="Số người" icon={<Users className="text-purple-500" size={20} />}>
                      <input 
                        type="number" 
                        min="1"
                        max="100"
                        className="w-full py-4 px-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                        value={formData.booking.passengers}
                        onChange={e => setFormData({...formData, booking: {...formData.booking, passengers: parseInt(e.target.value) || 1}})}
                      />
                    </InputGroup>
                  </div>

                  {distance && (
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                          <Navigation size={20} />
                        </div>
                        <div>
                          <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Khoảng cách ước tính</div>
                          <div className="text-xl font-black text-emerald-700">{distance.toFixed(1)} km</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Giá dự kiến</div>
                        <div className="text-xl font-black text-emerald-700">{calculatePrice().toLocaleString('vi-VN')}đ</div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">Loại Xe</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {vehicleTypes.map(type => (
                        <button
                          key={type.id}
                          onClick={() => setFormData({...formData, booking: {...formData.booking, vehicleTypeId: type.id}})}
                          className={`p-5 rounded-3xl border-2 text-left transition-all ${formData.booking.vehicleTypeId === type.id ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100' : 'border-gray-50 hover:border-gray-200 bg-white'}`}
                        >
                          <Car size={28} className={formData.booking.vehicleTypeId === type.id ? 'text-emerald-500' : 'text-gray-300'} />
                          <div className="mt-3 font-black text-gray-900">{type.type_name}</div>
                          <div className="text-xs text-gray-400 font-bold">Tối đa {type.seats} chỗ</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={handleNext}
                    disabled={!formData.booking.pickup || !formData.booking.dropoff || !formData.booking.date}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-200"
                  >
                    Tiếp Theo <ArrowRight size={20} />
                  </button>
                </div>

                {/* Map View */}
                <div className="h-[400px] lg:h-auto min-h-[400px] rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-inner relative">
                  <MapContainer center={[21.0285, 105.8542]} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {pickupCoords && (
                      <Marker position={pickupCoords}>
                        <Popup>Điểm Đón</Popup>
                      </Marker>
                    )}
                    {dropoffCoords && (
                      <Marker position={dropoffCoords}>
                        <Popup>Điểm Đến</Popup>
                      </Marker>
                    )}
                    {pickupCoords && dropoffCoords && (
                      <Polyline positions={[pickupCoords, dropoffCoords]} color="#10b981" weight={4} dashArray="10, 10" />
                    )}
                    <MapUpdater coords={allCoords} />
                    <MapEvents onMapClick={handleMapClick} />
                  </MapContainer>
                  {selectingFor && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] bg-white px-6 py-3 rounded-full shadow-2xl border border-emerald-100 flex items-center gap-3 animate-bounce">
                      <MousePointer2 className={selectingFor === 'pickup' ? 'text-emerald-500' : 'text-red-500'} size={20} />
                      <span className="font-black text-sm uppercase tracking-widest text-gray-700">
                        Click vào bản đồ để chọn {selectingFor === 'pickup' ? 'điểm đón' : 'điểm đến'}
                      </span>
                    </div>
                  )}
                  {!pickupCoords && !dropoffCoords && !selectingFor && (
                    <div className="absolute inset-0 bg-gray-900/5 backdrop-blur-[2px] z-[1000] flex items-center justify-center p-8 text-center pointer-events-none">
                      <div className="bg-white p-6 rounded-3xl shadow-xl max-w-xs">
                        <Navigation className="mx-auto text-emerald-500 mb-4" size={32} />
                        <p className="text-gray-500 font-medium">Nhập địa chỉ để xem lộ trình trên bản đồ</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="max-w-2xl mx-auto space-y-8">
                <h2 className="text-3xl font-black text-gray-900">Thông Tin Liên Hệ</h2>
                <div className="space-y-6">
                  <InputGroup label="Họ và Tên">
                    <input 
                      type="text" 
                      placeholder="Nhập họ và tên"
                      className="w-full py-4 px-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                      value={formData.customer.name}
                      onChange={e => setFormData({...formData, customer: {...formData.customer, name: e.target.value}})}
                    />
                  </InputGroup>
                  <InputGroup label="Số Điện Thoại">
                    <input 
                      type="tel" 
                      placeholder="Nhập số điện thoại"
                      className="w-full py-4 px-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                      value={formData.customer.phone}
                      onChange={e => setFormData({...formData, customer: {...formData.customer, phone: e.target.value}})}
                    />
                  </InputGroup>
                  <InputGroup label="Email (Không bắt buộc)">
                    <input 
                      type="email" 
                      placeholder="Nhập email"
                      className="w-full py-4 px-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                      value={formData.customer.email}
                      onChange={e => setFormData({...formData, customer: {...formData.customer, email: e.target.value}})}
                    />
                  </InputGroup>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-5 rounded-2xl font-bold transition-all">Quay Lại</button>
                  <button 
                    onClick={handleNext}
                    disabled={!formData.customer.name || !formData.customer.phone}
                    className="flex-[2] bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-emerald-100"
                  >
                    Tiếp Theo
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="max-w-2xl mx-auto space-y-8">
                <h2 className="text-3xl font-black text-gray-900">Xác Nhận & Thanh Toán</h2>
                
                <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 shadow-inner">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-emerald-700 font-bold">Tổng cộng:</span>
                    <span className="text-3xl font-black text-emerald-600">{formData.booking.price.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="space-y-4 text-gray-700">
                    {distance && (
                      <div className="flex gap-3">
                        <Navigation className="text-emerald-500 shrink-0" size={20} />
                        <p><strong>Khoảng cách:</strong> {distance.toFixed(1)} km</p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <MapPin className="text-emerald-500 shrink-0" size={20} />
                      <p><strong>Điểm đón:</strong> {formData.booking.pickup}</p>
                    </div>
                    <div className="flex gap-3">
                      <MapPin className="text-red-500 shrink-0" size={20} />
                      <p><strong>Điểm đến:</strong> {formData.booking.dropoff}</p>
                    </div>
                    <div className="flex gap-3">
                      <Calendar className="text-blue-500 shrink-0" size={20} />
                      <p><strong>Thời gian:</strong> {new Date(formData.booking.date).toLocaleString('vi-VN')}</p>
                    </div>
                    <div className="flex gap-3">
                      <Users className="text-purple-500 shrink-0" size={20} />
                      <p><strong>Số người:</strong> {formData.booking.passengers}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">Phương Thức Thanh Toán</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setFormData({...formData, booking: {...formData.booking, paymentMethod: 'cash'}})}
                      className={`p-5 rounded-3xl border-2 flex items-center gap-3 transition-all ${formData.booking.paymentMethod === 'cash' ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100' : 'border-gray-50 hover:border-gray-200 bg-white'}`}
                    >
                      <Banknote className={formData.booking.paymentMethod === 'cash' ? 'text-emerald-500' : 'text-gray-300'} />
                      <span className="font-black text-gray-900">Tiền Mặt</span>
                    </button>
                    <button
                      onClick={() => setFormData({...formData, booking: {...formData.booking, paymentMethod: 'transfer'}})}
                      className={`p-5 rounded-3xl border-2 flex items-center gap-3 transition-all ${formData.booking.paymentMethod === 'transfer' ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100' : 'border-gray-50 hover:border-gray-200 bg-white'}`}
                    >
                      <CreditCard className={formData.booking.paymentMethod === 'transfer' ? 'text-emerald-500' : 'text-gray-300'} />
                      <span className="font-black text-gray-900">Chuyển Khoản</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-5 rounded-2xl font-bold transition-all">Quay Lại</button>
                  <button 
                    onClick={handleSubmit}
                    className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-200"
                  >
                    Xác Nhận Đặt Xe <CheckCircle2 size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, icon, children }: { label: string, icon?: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-black text-gray-700 uppercase tracking-widest">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}
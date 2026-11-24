import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken } from '../lib/api.js';
const AppContext=createContext(null);
export function AppProvider({children}){
 const [vehicles,setVehicles]=useState([]),[bookings,setBookings]=useState([]),[theme,setThemeState]=useState(()=>JSON.parse(localStorage.getItem('drivex.theme.v1')||'"dark"')),[user,setUser]=useState(null),[loading,setLoading]=useState(true);
 const refresh=async()=>{const cars=await api('/vehicles');setVehicles(cars);if(getToken()){const result=await api('/bookings');setBookings(result);}else setBookings([]);};
 useEffect(()=>{let active=true;(async()=>{try{const cars=await api('/vehicles');if(active)setVehicles(cars);if(getToken()){try{const me=await api('/auth/me');if(active)setUser(me.user);const b=await api('/bookings');if(active)setBookings(b);}catch{localStorage.removeItem('drivex.token');}}}catch(e){console.error(e);}finally{if(active)setLoading(false);}})();return()=>{active=false;};},[]);
 useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('drivex.theme.v1',JSON.stringify(theme));},[theme]);
 const setTheme=value=>setThemeState(value);
 const authenticate=async(path,payload)=>{const data=await api(path,{method:'POST',body:JSON.stringify(payload)});localStorage.setItem('drivex.token',data.token);setUser(data.user);await refresh();return data.user;};
 const login=payload=>authenticate('/auth/login',payload),register=payload=>authenticate('/auth/register',payload);
 const logout=()=>{localStorage.removeItem('drivex.token');setUser(null);setBookings([]);};
 const addBooking=async booking=>{const saved=await api('/bookings',{method:'POST',body:JSON.stringify(booking)});setBookings(current=>[saved,...current]);return saved;};
 const updateBookingStatus=async(id,status)=>{await api(`/bookings/${id}/status`,{method:'PATCH',body:JSON.stringify({status})});setBookings(current=>current.map(b=>b.id===id?{...b,status}:b));};
 const cancelBooking=async id=>{await api(`/bookings/${id}/cancel`,{method:'PATCH'});setBookings(current=>current.map(b=>b.id===id?{...b,status:'Cancelled'}:b));};
 const saveVehicle=async vehicle=>{const exists=vehicles.some(v=>v.id===vehicle.id);const saved=await api(exists?`/vehicles/${vehicle.id}`:'/vehicles',{method:exists?'PUT':'POST',body:JSON.stringify(vehicle)});setVehicles(current=>exists?current.map(v=>v.id===saved.id?saved:v):[saved,...current]);};
 const deleteVehicle=async id=>{await api(`/vehicles/${id}`,{method:'DELETE'});setVehicles(current=>current.filter(v=>v.id!==id));};
 const value=useMemo(()=>({vehicles,bookings,theme,setTheme,user,loading,login,register,logout,addBooking,updateBookingStatus,cancelBooking,saveVehicle,deleteVehicle,refresh}),[vehicles,bookings,theme,user,loading]);
 return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export function useApp(){const value=useContext(AppContext);if(!value)throw new Error('useApp must be used inside AppProvider');return value;}

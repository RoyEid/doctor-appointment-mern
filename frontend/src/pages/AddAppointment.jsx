import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext';

function AddAppointment() {

     const [doctors, setDoctors] = useState([]);
     const {user} = useContext(AuthContext)
     const [form,setForm] = useState({
        doctor:"",
        date: "",
        reason: "",
     })

     useEffect(()=>{
        const fetchDoctor = async()=>{
            const res = await fetch("http://localhost:5000/doctors/allDoctors")
            const data = await res.json()
            setDoctors(data)
        }

        fetchDoctor();
     },[])

     const handleChange=(e)=> setForm({...form,[e.target.name]: e.target.value})

     const handleSubmit= async(e)=>{
        e.preventDefault()
        
        console.log("Form data being sent:", form);
        
        const token = localStorage.getItem("token");
        console.log("Token:", token);

        try {
            const res = await fetch("http://localhost:5000/appointments/createAppointment",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            })

            console.log("Response status:", res.status);
            console.log("Response ok:", res.ok);

            const data = await res.json()
            console.log("Response data:", data);

            if(res.ok){
                alert("Appointment added successfully!");
                setForm({doctor: "", date: "", reason: "" })
            }else{
                console.error("Error response:", data);
                alert(data.message || "Failed to add appointment");
            }
        } catch (error) {
            console.error("Network or parsing error:", error);
            alert("Network error occurred. Check console for details.");
        }
     }

     // FIXED: Added return statement
     if(!user){
        return (
            <div className="flex items-center justify-center h-screen text-xl">
                You need to login to create an appointment.
            </div>
        )
     }

  return (
    <div className='flex justify-center items-center h-screen bg-gray-100'>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center">
                Add Appointment
            </h2>

            <label className="block mb-2 text-sm font-semibold">Doctor</label>
            <select 
                name='doctor'
                value={form.doctor}
                onChange={handleChange}
                required
                className="w-full mb-4 p-2 border rounded"    
            >
                <option value="">Select doctor</option>
                {doctors?.map((doc)=>(
                    <option key={doc._id} value={doc._id}>
                        {doc?.name} - {doc?.specialty}
                    </option>
                ))}
            </select>

            <label className="block mb-2 text-sm font-semibold">Date</label>      
            <input 
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="w-full mb-4 p-2 border rounded"
            />

            <label className="block mb-2 text-sm font-semibold">Reason</label>      
            <textarea 
                name="reason"
                value={form.reason}
                onChange={handleChange}
                required
                className="w-full mb-4 p-2 border rounded h-24 resize-none"
                placeholder="Describe your reason for the appointment..."
            />

            {/* FIXED: Added proper button styling */}
            <button 
                type='submit' 
                className='w-full py-2 rounded  text-white font-semibold transition duration-200'
            >
                Submit
            </button>     
        </form>
    </div>
  )
}

export default AddAppointment
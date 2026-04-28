import React, { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from "react-router-dom";

function Register() {

    const {login} = useContext(AuthContext)
    const [form,setForm] =useState({email:"",password:"",name:""})
    const navigate = useNavigate();

    const handleChange=(e)=>setForm({...form,[e.target.name]: e.target.value})


    const handleSubmit= async(e)=>{
        e.preventDefault()
        const res = await fetch("http://localhost:5000/user/register",{
             method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),

        })
        const data = await res.json()
        if(data.token){
            login(data.token)
            navigate("/")
        }

    }
  return (
   <div className="flex justify-center items-center h-screen bg-gray-100">
      <form className="bg-white p-6 rounded shadow-md w-96" onSubmit={handleSubmit}>
        <h2 className="text-2xl mb-4 text-center font-bold">Register</h2>
        <input
          type="text"
          name="name"
          placeholder="name"
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
        />
       
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
        />
        <button className="w-full text-white py-2 rounded">Register</button>
      </form>
    </div>
  )
}

export default Register
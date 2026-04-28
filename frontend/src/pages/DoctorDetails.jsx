import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';

function DoctorDetails() {

     const { id } = useParams();

     const [doctor, setDoctor] = useState(null);
    const [relatedDoctors,setRelatedDoctors] = useState([])



        useEffect(()=>{
            const fetchedDoctors = async()=>{
                try {
                    const res = await fetch(                   `http://localhost:5000/doctors/${id}`)
                    const data = await res.json()
                    if(!res.ok) throw new Error(data.message || "Failed to fetch doctors")
                    setDoctor(data)
                    fetchRelatedDoctors(data?.specialty.toLowerCase(),data?._id)
                } catch (error) {
                        console.error(error)
                }
            }


            const fetchRelatedDoctors = async(specialty,currentId) => {
                 try {
                const res = await fetch(`http://localhost:5000/doctors/doctors/bySpecialty/${specialty}`)

                 const data = await res.json();
                   if (!res.ok) throw new Error(data.message || "Failed to fetch doctors")

               const normalized = data.filter((doc) =>doc?._id !== currentId  && doc.specialty.toLowerCase()=== specialty) 
               setRelatedDoctors(normalized)    
            } catch (error)  {
            console.error("Error fetching related doctors:", error)
            }
               
            
            }

           
             fetchedDoctors();
        },[id])
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl p-8 m-auto min-h-screen'>

        <div className='md:col-span-2 flex flex-col md:flex-row items-center'>

       
        <img src={`http://localhost:5000/uploads/${doctor?.image}`} className='w-64 h-64 object-cover rounded-lg shadow-md mb-6 md:mb-0 md:mr-10'/>

         <div className='space-y-4'>
            <h2 className='text-4xl font-bold text-[#008e9b]'>{doctor?.name}</h2>
            <p className='text-xl text-gray-700'>{doctor?.specialty}</p>
            <p className='text-gray-600'>{doctor?.experienceYears} Year of Exprience</p>

            <p>{doctor?.description}</p>
            </div>  
             </div> 

          <div>
            <h3 className='text-2xl mb-3 text-[#008e9b]'>Other {doctor?.specialty} Doctors</h3>

            <div className='space-y-4'>
            {relatedDoctors.length > 0 ? (
                relatedDoctors?.map((doc)=> (
                    <Link className = "flex items-center bg-white rounded-lg shadow p-3 "  key={doc?._id} to={`/doctor/${doc?._id}`}>
                    
                    <img  className="w-16 h-16 rounded-full object-cover border mr-4" src={`http://localhost:5000/uploads/${doc?.image}`}/>
                    <div >
                    <h4>{doc?.name}</h4>
                       <p>Experience: {doc?.experienceYears} years</p> 

                    </div>
                    </Link>
                ))
            ):
             <p className="text-gray-500">No related doctors found.</p>
            }
            </div>
            </div>   
    </div>


  )
}

export default DoctorDetails
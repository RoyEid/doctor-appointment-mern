import React, { useEffect, useState } from 'react'

function Stats() {

    const [doctorsCount,setDoctorsCount] = useState(0)
    const [departmentsCount, setDepartmentsCount] = useState(0);
    useEffect(()=>{
        const fetchStats= async()=>{
            try {
                const doctorsStats= await fetch("http://localhost:5000/doctors/count")

                const departmentsStats= await fetch("http://localhost:5000/departments/count")

                const  doctorsData = await doctorsStats.json()

                 const  departmentsData = await departmentsStats.json()

                 setDoctorsCount(doctorsData.count || 0)
                 setDepartmentsCount(departmentsData.count || 0);

                 console.log("Doctors count from API:", doctorsData.count)

                  console.log("departments count from API:", departmentsData.count)

                 


            } catch (error) {
                  console.error("Error fetching stats:", error);
            }
        }
        
    fetchStats();
    },[])


    const  stats = [
        {
            icon:"fas fa-user-md", count: doctorsCount, label: "Doctors"
        },

         {
            icon:"far fa-hospital", count: departmentsCount, label: "Departments"
        },


         {
            icon:"fas fa-flask",  count: 8, label: "Research Labs" 
        },

         {
            icon:"fas fa-award", count: 150, label: "Awards" 
        },


    ]
  return (
    <section className='py-16 bg-gray-50'>
        <div className='max-w-6xl mx-auto px-4 '>
            <div className='grid lg:grid-cols-4  md:grid-cols-2 sm:grid-cols-1 gap-4'>

                {stats.map((item,index)=> (
                    <div  className=" group  cursor-pointer flex items-center justify-start space-x-4 bg-white shadow-md rounded-lg p-6 hover:shadow-lg  hover:bg-[#008e9b] transition-colors duration-300" key={index}>

                        <i className={`${item.icon} text-[#46daea] text-4xl`}></i>

                        <div>
                            <span className='text-3xl font-bold block'>{item.count}</span>

                      <p className="text-gray-600 group-hover:text-white">{item.label}</p>
                         </div>


                    </div>
                ))}

            </div>
        </div>
        
    </section>
  )
}

export default Stats
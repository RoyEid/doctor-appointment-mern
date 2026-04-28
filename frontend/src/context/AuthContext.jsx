import { createContext, useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";
export const AuthContext = createContext()


export const AuthProvider =({children})=> {
    const [user,setUser]= useState(null)

    useEffect(()=>{
        const token = localStorage.getItem("token")
        if(token){
            const decode = jwtDecode(token)
            setUser(decode)
           
        }
    },[])



const login =(token)=>{
    localStorage.setItem("token", token)
    const decode = jwtDecode(token)
    setUser(decode);
}

const logout=()=>{
    localStorage.removeItem("token")
    setUser(null);
}

return (
    <AuthContext.Provider value={{user,login,logout }}>
          {children}

    </AuthContext.Provider>
)

}
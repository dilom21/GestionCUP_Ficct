import React from 'react';  
import Navbar from '@/Components/Navbar';  
  
export default function DocenteLayout({ children }) {  
    return (  
        <div className="min-h-screen bg-gray-100">  
            <Navbar />  
            <main className="p-6">  
                {children}  
            </main>  
        </div>  
    );  
} 

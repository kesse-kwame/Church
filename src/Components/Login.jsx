import React, { useState} from 'react'

const Login = () => {

    const [isLoginMode, setIsLoginMode] = useState(true)
  return (
    <div className='w-[430px] p-8 rounded-2xl shadow-lg border border-gray-300 bg-white'>
      {/*Header title*/}
      <div className='flex justify-center mb-4'>
        <h1 className='text-3xl font-bold'>Welcome to ChurchSuite</h1>
      </div>
      <div className='flex justify-center mb-4'>
        <h2 className='text-3xl font-semibold text-center'>{isLoginMode ? "Login" : "Sign Up"}</h2>
      </div>
      {/*Tab Controls*/}
      <div className='relative flex h-12 mb-6 border border-gray-300 rounded-full overflow-hidden'>
        <button onClick={()=> setIsLoginMode(true)} className={`w-1/2 text-lg font-medium transition-all z-10 ${isLoginMode ? "text-white" : "text-black"}`}>
          Login
        </button>
        <button onClick={()=> setIsLoginMode(false)} className={`w-1/2 text-lg font-medium transition-all z-10 ${!isLoginMode ? "text-white" : "text-black"}`}>
          Sign Up</button>    
        <div className={`absolute top-0 h-full w-1/2 rounded-full bg-blue-500 transition-all duration-300 ease-in-out ${isLoginMode ? "left-0" : "left-1/2"}`}></div>
      </div>
      {/*Form Section*/}
      <form className='space-y-4'>
        {!isLoginMode && (
          < input type="text" placeholder='Name' required className='w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-blue-200 placeholder-gray-400' />
        )}
        {/*Shared input field*/}
        <input type="email" placeholder='Email or Username' required className='w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-blue-200 placeholder-gray-400' />
        <input type="password" placeholder='Password' required className='w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-blue-200 placeholder-gray-400'/>
        {/*Sign Up field */}
        {!isLoginMode && (
          <input type="password" placeholder='Confirm Password' required className='w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-blue-200 placeholder-gray-400' />
        )}

        {/*Forgot Password*/}
        {isLoginMode && (
          <div className='text-left'>
            <p className='text-blue-500 hover:underline'>Forgot Password?</p>
          </div>
        )}

        {/*Shared button*/}
        <button className='w-full p-3 bg-blue-500 text-white rounded-full text-lg font-medium hover:opacity-90 transition'>
          {isLoginMode ? "Login" : "Sign Up"}
        </button>
        {/*Text*/}
        {isLoginMode && (
          <div>
             <p className='text-gray-400 font-small'>Login as Admin or Staff to access different features</p>
          </div>
        )}
        {/* Switch Link*/}
        <p className='text-center text-gray-600'>{isLoginMode ? "Don't have an account?" : "Already have an account?"}
            <a href="#" onClick={(e)=> setIsLoginMode(!isLoginMode)} className='text-blue-500 hover:underline ml-1'>
              {isLoginMode ? "Sign Up" : "Login"}
            </a></p>

      </form>
    </div>  
  )
}

export default Login

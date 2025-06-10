// src/contexts/AppContext.js
'use client'
import { createContext, useContext, useState } from 'react'

// สร้าง context
const AppContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  language: 'th',
  setLanguage: () => {},
  round1:1,
  setRound1: () => {},
  round2:2,
  setRound2: () => {},
  round3:5,
  setRound3: () => {},
})

// สร้าง Provider
export function AppProvider({ children }) {
  const [theme, setTheme] = useState('light')
  const [language, setLanguage] = useState('th')
  const [round1, setRound1] = useState(1)
  const [round2, setRound2] = useState(2)
//   const [round3, setRound3] = useState(7)


  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <AppContext.Provider value={{ 
      theme, 
      toggleTheme,
      language,
      setLanguage,
      round1,
      setRound1,
      round2,
      setRound2,
      round3:AppContext._currentValue.round3, // ใช้ค่า default
    }}>
      {children}
    </AppContext.Provider>
  )
}

// สร้าง hook สำหรับใช้งาน
export function useApp() {
  return useContext(AppContext)
}
// ต้อง ไป import AppProvider ไว้ใน components ที่จะใช้งานแล้ว 
// import { AppProvider } from '@/app/contexts/AppContext'

//<AppProvider>
//{children}
//</AppProvider> */}
// const { round1 } = useApp() ใช้ function useApp ใน AppContext.js เพื่อเรียกค่าจาก context มาใช้

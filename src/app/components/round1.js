import { useApp } from '@/app/contexts/AppContext'  // หรือระบุ path ที่ถูกต้อง
import Round2 from './round2'
function Round1() {
  const { round1 } = useApp() //ได้ค่ามากจาก useContext ใน AppContext.js
  return (
    <>
        <div>
            <h1>Round 1 : {round1}</h1>
        </div>
        <Round2 />
    </>
  )
}
export default Round1;
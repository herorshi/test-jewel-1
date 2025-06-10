
import { useApp } from '@/app/contexts/AppContext'
import Round3 from './round3'
function Round2() {
  const { round2 } = useApp()
  return (
    <>
        <div>
            <h1>Round 2 : {round2}</h1>
        </div>
        <Round3 />
    </>
  )
}
export default Round2;
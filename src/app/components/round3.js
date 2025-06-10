
import { useApp } from '@/app/contexts/AppContext'
function Round3() {
  const { round3 } = useApp()
  return (
    <>
        <div>
            <h1>Round 3 : {round3}</h1>
        </div>
    </>
  )
}
export default Round3;
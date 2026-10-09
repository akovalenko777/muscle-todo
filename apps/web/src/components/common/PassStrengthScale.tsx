
interface IProps {
  strength: number | null
}

export default function PassStrengthScale({strength}: IProps){
  return (
    <div className={`pass-strength-scale-wrap ${strength!==null ? 'strength-'+strength : ''}`}>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  )
}
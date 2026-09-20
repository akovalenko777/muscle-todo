import { Link } from "react-router-dom";

export default function IndexPage(){
  return (
    <>
      <h1>Велком до канбан дошки :)</h1>
      <br />
      <Link to={'/login'}>Увійти</Link>
      <br />
      <Link to={'/register'}>Зареєструватися</Link>
      <br />
      або використати свій обліковий запис Google
      <br />
      
    </>
  )
}
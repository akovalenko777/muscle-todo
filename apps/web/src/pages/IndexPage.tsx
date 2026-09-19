import { Link } from "react-router-dom";

export default function IndexPage(){
  return (
    <>
      <h1>This is main page</h1>
      <br />
      <Link to={'/login'}>Увійти</Link>
    </>
  )
}
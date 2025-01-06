// import GoogleButton from "@/components/GoogleButton";
import { Suspense } from "react";


export default async function Signin() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="stack">
        <h1>SignIn</h1>
        {/* <GoogleButton /> */}
      </div>
    </Suspense>
  );
}
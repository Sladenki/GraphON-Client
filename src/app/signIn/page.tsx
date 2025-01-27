'use client'

import LoginButton from "@/components/ProfileCorner/LoginButton/LoginButton";
import { Suspense } from "react";


export default async function Signin() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <h1>SignIn</h1>
      <LoginButton/>
    </Suspense>
  );
}
"use client";
import googleLogo from "@/public/google.png";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { HoverBorderGradient } from "../ui/hover-border-gradient";

function GoogleSignIn() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  function handleClick() {
    signIn("google", {
      callbackUrl: redirect || "/",
    });
  }

  return (
    <Suspense>
      <div className="m-40 flex justify-center text-center">
        <HoverBorderGradient
          containerClassName="rounded-full"
          as="button"
          className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
          onClick={handleClick}
        >
          <Image src={googleLogo} alt="Google Logo" width={20} height={20} />
          <span>Sign in</span>
        </HoverBorderGradient>
      </div>
    </Suspense>
  );
}

export default GoogleSignIn;

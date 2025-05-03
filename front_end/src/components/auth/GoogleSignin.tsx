import googleLogo from "@/public/google.png";
import { Button } from "../ui/button";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

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
      <Button color="primary" onClick={handleClick} variant="ghost">
        <Image src={googleLogo} alt="Google Logo" width={20} height={20} />
        Continue with Google
      </Button>
    </Suspense>
  );
}

export default GoogleSignIn;

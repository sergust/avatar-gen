import { signIn, signOut, useSession } from "next-auth/react";
import { PrimaryLink } from "./PrimaryLink";
import { Button } from "./Button";
import { useBuyCredits } from "~/hooks/useBuyCredits";

export function Header() {
  const session = useSession();
  console.log(session);
  const isLoggedIn = !!session.data;

  const { buyCredits } = useBuyCredits();

  return (
    <header className="w-full dark:bg-gray-900">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 ">
        <PrimaryLink href="/">Avatar Gen</PrimaryLink>
        <ul>
          <li>
            <PrimaryLink href="/generate">Generate</PrimaryLink>
          </li>
        </ul>
        <ul className="flex items-center gap-5">
          {!isLoggedIn && (
            <li>
              <Button
                onClick={() => {
                  signIn().catch(console.error);
                }}
              >
                Login
              </Button>
            </li>
          )}

          {isLoggedIn && (
            <>
              <li>{session.data?.user.name}</li>
              <li>
                <Button onClick={() => buyCredits().catch(console.error)}>
                  Buy credits
                </Button>
              </li>
              <li>
                <Button
                  variant="secondary"
                  onClick={() => {
                    signOut().catch(console.error);
                  }}
                >
                  Logout
                </Button>
              </li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
}

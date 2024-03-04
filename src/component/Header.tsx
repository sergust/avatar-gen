import { signIn, signOut, useSession } from "next-auth/react";
import { PrimaryLink } from "./PrimaryLink";
import { Button } from "./Button";

export function Header() {
  const session = useSession();
  console.log(session);
  const isLoggedIn = !!session.data;

  return (
    <header className="container mx-auto flex h-16 items-center justify-between px-4 dark:bg-gray-800">
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
    </header>
  );
}

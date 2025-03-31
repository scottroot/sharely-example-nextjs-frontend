import { cookies } from "next/headers";
import Link from "next/link";
import { graphRead } from "@/lib/neo4j";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";


export default async function Home() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  const account = session.account || "dev";

  return (
    // <div className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    <div className="grid p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Hello {account !== "dev" ? account : "guest"}!
        </h2>
      </div>
      <main className="flex flex-col items-start">
        <h3 className="mb-2 text-lg font-medium text-gray-700 sm:truncate sm:text-xl/7 sm:tracking-tight">
          Getting Started
        </h3>
        <p className="mb-6">This is a demo with a simulated environment and does not contain any Sharely data.</p>
        <ol className="pl-6 list-decimal list-inside text-sm/6 text-center sm:text-left space-y-4">
          <li className="tracking-[-.01em] text-lg text-gray-900">
            <strong>Login</strong>: Simulated login - type in customer account name. {(account && account !== "dev") && (<span className="text-green-700 italic">Done</span>)}
          </li>
          <li className="tracking-[-.01em] text-lg text-gray-900">
            <strong>Upload</strong>: Upload a knowledge document (PDF) file you&apos;d like to have categorized.
          </li>
          <li className="tracking-[-.01em] text-lg text-gray-900">
            <strong>Browse</strong>: Browse categories of your parsed knowledge documents.
          </li>
        </ol>
      </main>
    </div>
  );
}

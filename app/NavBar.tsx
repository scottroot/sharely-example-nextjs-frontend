"use client"
import Link from "next/link";
import { usePathname } from "next/navigation"
import {Bars3Icon, Cog6ToothIcon, XMarkIcon} from '@heroicons/react/24/outline'
import clsx from "clsx";
import useSWR from "swr";


export default function NavBar() {
  const pathname = usePathname();
  const { data: account } = useSWR(
    "/api/account",
    (url) => fetch(url).then(res => res.json()).then(({ account }) => account),
    // { refreshInterval: 5000 }
  );
  const menuItems = [
    {url: "/", label: "Home"},
    {url: "/browse", label: "Browse Categories"},
    {url: "/upload", label: "Upload"},
    {url: "/info", label: "My Files"},
    // {url: "/login", label: "Login"},
  ]
  if(!pathname) return null;
  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button */}
            <button className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block size-6 group-data-[open]:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-[open]:block" />
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {menuItems.map(({url, label}, idx) => (
                <Link
                  key={`${idx}__${label}`}
                  href={url}
                  className={clsx(
                    "inline-flex items-center border-b-2 border-indigo-500 px-1 pt-1 text-sm font-medium text-gray-900",
                    pathname === url ? "border-indigo-500" : "border-transparent hover:border-gray-300 hover:text-gray-700",
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          {/*<div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">*/}
          {/*  <button*/}
          {/*    type="button"*/}
          {/*    className="relative rounded-full bg-gray-100 px-3 py-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"*/}
          {/*  >*/}
          {/*    <span className="absolute -inset-1.5" />*/}
          {/*    <span className="sr-only">Account Menu</span>*/}
          {/*    {account && account}*/}
          {/*  </button>*/}
          {/*</div>*/}


          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {account ?
              (
                <>
                  <Link
                    href="/login"
                    title="Change login account"
                    className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <span className="absolute -inset-1.5" />
                    <div
                      className="relative rounded-full bg-gray-100 px-3 py-1 text-gray-400"
                    >
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Account Menu</span>
                      {account}
                    </div>
                  </Link>
                  <Link href="/settings" className="relative flex items-center text-gray-600 hover:text-gray-800 cursor-pointer">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Open user menu</span>
                    <Cog6ToothIcon className="size-6 ml-3 hover:shadow-lg" />
                  </Link>
                </>
              )
              : (
                <Link href="/login" className="relative flex items-center text-blue-500 hover:text-blue-700 cursor-pointer">
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Log in</span>
                  Log In
                </Link>
              )
            }
          </div>
        </div>
      </div>
    </nav>
  )
}

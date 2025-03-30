import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import Link from "next/link";
import {HomeIcon} from "@heroicons/react/16/solid";


interface BreadcrumbHeader {
  rootCategory: string;
  parentCategory?: string;
  baseCategory?: string
}

export default function BreadcrumbHeader({rootCategory, parentCategory, baseCategory}: BreadcrumbHeader) {
  return (
    <div className="flex flex-col w-full">
      <div>
        {/*<nav aria-label="Back" className="xsm:hidden">*/}
        {/*  <Link href="#" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">*/}
        {/*    <ChevronLeftIcon aria-hidden="true" className="-ml-1 mr-1 size-5 shrink-0 text-gray-400" />*/}
        {/*    Back*/}
        {/*  </Link>*/}
        {/*</nav>*/}
        <nav aria-label="Breadcrumb" className="flex xhidden xsm:flex items-center">
          <Link href="/">
            <HomeIcon className="-ml-1 mr-4 size-5 shrink-0 text-gray-400" />
          </Link>
          <ol role="list" className="flex items-center space-x-4">
            <li>
              <div className="flex">
                <Link
                  href={`/${encodeURIComponent(rootCategory)}`}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700"
                >
                  {rootCategory}
                </Link>
              </div>
            </li>
            {parentCategory &&
              <li>
                <div className="flex items-center">
                  <ChevronRightIcon aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
                  <Link
                    href={`/${encodeURIComponent(rootCategory)}/${encodeURIComponent(parentCategory)}`}
                    className="ml-4 text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    {parentCategory}
                  </Link>
                </div>
              </li>
            }
            {(parentCategory && baseCategory) &&
              <li>
                <div className="flex items-center">
                  <ChevronRightIcon aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
                  <Link
                    href={`/${encodeURIComponent(rootCategory)}/${encodeURIComponent(parentCategory)}/${encodeURIComponent(baseCategory)}`}
                    className="ml-4 text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    {baseCategory}
                  </Link>
                </div>
              </li>
            }
          </ol>
        </nav>
      </div>
      <div className="mt-8 md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {baseCategory ? baseCategory : (parentCategory ? parentCategory : rootCategory)}
          </h2>
        </div>
        {/*<div className="mt-4 flex shrink-0 md:ml-4 md:mt-0">*/}
        {/*  <button*/}
        {/*    type="button"*/}
        {/*    className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"*/}
        {/*  >*/}
        {/*    Edit*/}
        {/*  </button>*/}
        {/*  <button*/}
        {/*    type="button"*/}
        {/*    className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"*/}
        {/*  >*/}
        {/*    Publish*/}
        {/*  </button>*/}
        {/*</div>*/}
      </div>
    </div>
  )
}

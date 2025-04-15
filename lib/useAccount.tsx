"use client"
import useSWR from "swr";
import type { SWRConfiguration } from "swr";


interface OptionsForSWR extends SWRConfiguration {
      /**
     *  error retry interval in milliseconds
     *  @defaultValue 5000
     */
    errorRetryInterval: number;
    /** max error retry count */
    errorRetryCount?: number;
    /**
     * timeout to trigger the onLoadingSlow event in milliseconds
     * @defaultValue 3000
     */
    loadingTimeout: number;
    /**
     * only revalidate once during a time span in milliseconds
     * @defaultValue 5000
     */
    focusThrottleInterval: number;
    /**
     * dedupe requests with the same key in this time span in milliseconds
     * @defaultValue 2000
     */
    dedupingInterval: number;
    /**
     *  @link https://swr.vercel.app/docs/revalidation
     *  * Disabled by default: `refreshInterval = 0`
     *  * If set to a number, polling interval in milliseconds
     *  * If set to a function, the function will receive the latest data and should return the interval in milliseconds
     */
    refreshInterval?: number | ((latestData: any | undefined) => number);
    /**
     * polling when the window is invisible (if `refreshInterval` is enabled)
     * @defaultValue false
     *
     */
    refreshWhenHidden?: boolean;
    /**
     * polling when the browser is offline (determined by `navigator.onLine`)
     */
    refreshWhenOffline?: boolean;
    /**
     * automatically revalidate when window gets focused
     * @defaultValue true
     * @link https://swr.vercel.app/docs/revalidation
     */
    revalidateOnFocus: boolean;
    /**
     * automatically revalidate when the browser regains a network connection (via `navigator.onLine`)
     * @defaultValue true
     * @link https://swr.vercel.app/docs/revalidation
     */
    revalidateOnReconnect: boolean;
    /**
     * enable or disable automatic revalidation when component is mounted
     */
    revalidateOnMount?: boolean;
    /**
     * automatically revalidate even if there is stale data
     * @defaultValue true
     * @link https://swr.vercel.app/docs/revalidation#disable-automatic-revalidations
     */
    revalidateIfStale: boolean;
    /**
     * retry when fetcher has an error
     * @defaultValue true
     */
    shouldRetryOnError: boolean | ((err: Error) => boolean);
    /**
     * keep the previous result when key is changed but data is not ready
     * @defaultValue false
     */
    keepPreviousData?: boolean;
    /**
     * @experimental  enable React Suspense mode
     * @defaultValue false
     * @link https://swr.vercel.app/docs/suspense
     */
    suspense?: boolean;
    /**
     * initial data to be returned (note: ***This is per-hook***)
     * @link https://swr.vercel.app/docs/with-nextjs
     */
    fallbackData?: any | Promise<any>;
    /**
     * the fetcher function
     */
    fetcher?: any;
    /**
     * array of middleware functions
     * @link https://swr.vercel.app/docs/middleware
     */
    use?: any[];
    /**
     * a key-value object of multiple fallback data
     * @link https://swr.vercel.app/docs/with-nextjs#pre-rendering-with-default-data
     */
    fallback: {
        [key: string]: any;
    };
    /**
     * function to detect whether pause revalidations, will ignore fetched data and errors when it returns true. Returns false by default.
     */
    isPaused: () => boolean;
    /**
     * callback function when a request takes too long to load (see `loadingTimeout`)
     */
    onLoadingSlow: (key: string, config: any) => void;
    /**
     * callback function when a request finishes successfully
     */
    onSuccess: (data: any, key: string, config: any) => void;
    /**
     * callback function when a request returns an error
     */
    onError: (err: Error, key: string, config: any) => void;
    /**
     * handler for error retry
     */
    onErrorRetry: (err: Error, key: string, config: any, revalidate: any, revalidateOpts: any) => void;
    /**
     * callback function when a request is ignored
     */
    onDiscarded: (key: string) => void;
    /**
     * comparison function used to detect when returned data has changed, to avoid spurious rerenders. By default, [stable-hash](https://github.com/shuding/stable-hash) is used.
     */
    compare: (a: any | undefined, b: any | undefined) => boolean;
    /**
     * isOnline and isVisible are functions that return a boolean, to determine if the application is "active". By default, SWR will bail out a revalidation if these conditions are not met.
     * @link https://swr.vercel.app/docs/advanced/react-native#customize-focus-and-reconnect-events
     */
    isOnline: () => boolean;
    /**
     * isOnline and isVisible are functions that return a boolean, to determine if the application is "active". By default, SWR will bail out a revalidation if these conditions are not met.
     * @link https://swr.vercel.app/docs/advanced/react-native#customize-focus-and-reconnect-events
     */
    isVisible: () => boolean;
}


export const useAccount = (swrOptions: SWRConfiguration = {}) => {
  const {data, isLoading, mutate, error, isValidating} = useSWR(
    "/api/account",
    (url) => fetch(url).then(r => r.json()).then(({ account }) => account),
    swrOptions
  );

  return {
    account: data,
    accountIsLoading: isLoading,
    accountIsValidating: isValidating,
    accountError: error,
    mutateAccount: mutate,
  }
}


export function AltPage({ topLabel, heading, subtitle }: { topLabel: any, heading: string, subtitle?: string }) {
  return (
    <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <div className="text-base font-semibold text-gray-600 animate-pulse">
          {topLabel}
        </div>
        <h1 className="mt-4 text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
          {heading}
        </h1>
        {subtitle &&
          <p className="mt-6 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
            {subtitle}
          </p>
        }
      </div>
    </main>
  )
}


export function AccountIsLoading() {
  const Loading = () => (
    <div className="flex text-xl font-bold gap-2 justify-center">
      <div className="animate-bounce -animation-delay-100">.</div>
      <div className="animate-bounce">.</div>
      <div className="animate-bounce animation-delay-100">.</div>
    </div>
  )
  return (
    <AltPage
      topLabel={<Loading />}
      heading="Loading"
      subtitle="Loading account data. Just a moment..."
    />
  )
}


export function AccountNotLoggedIn() {
  return (
    <AltPage
      topLabel="404"
      heading="Not logged in."
      subtitle="Please log in to view page."
    />
  )
}
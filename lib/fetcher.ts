/**
 * Fetcher function for SWR that makes an HTTP request and returns a JSON response.
 *
 * @template JSON - The expected JSON response type.
 * @param input - The request URL or Request object.
 * @param init - Optional fetch configuration options.
 * @returns A promise (unknown) that resolves to the JSON response.
 */
export default async function fetcher<JSON = unknown>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<JSON> {
  return fetch(input, {
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    ...init,
  }).then((res) => res.json());
}

// const fetcher = (url) => fetch(url).then(res => res.json());
// export default fetcher;

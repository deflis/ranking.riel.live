import ky, { Options } from "ky";

const defaultOptions = {
  timeout: 60000,
};

export async function fetcher<T>(
  url: string,
  options: Options = {}
): Promise<T> {
  const res = await ky(url, { ...defaultOptions, ...options });
  return await res.json();
}

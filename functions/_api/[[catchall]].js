export function onRequest(context) {
  const pathname = new URL( context.request.url).pathname;
  return fetch(`https://narou-ranking.web.app${pathname}`);

}
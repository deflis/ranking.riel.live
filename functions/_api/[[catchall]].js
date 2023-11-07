export function onRequest(context) {
  const origin = new URL( context.request.url);
  origin.hostname = "narou-ranking.web.app";
  return fetch(origin.toString(), context.request);

}
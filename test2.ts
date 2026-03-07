import { createIsomorphicFn } from "@tanstack/react-start";
const fn = createIsomorphicFn().server((data: { ncode: string }) => { return true; }).client((data: { ncode: string }) => { return false; });
console.log(fn({ncode: "hi"}));

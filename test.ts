import { createIsomorphicFn } from "@tanstack/react-start";
console.log(createIsomorphicFn().server((data: { ncode: string }) => {}).client);

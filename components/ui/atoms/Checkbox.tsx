import clsx from "clsx";
import { InputHTMLAttributes, PropsWithoutRef } from "react";

export const Checkbox: React.FC<
  PropsWithoutRef<InputHTMLAttributes<HTMLInputElement>>
> = ({ className, ...props }) => (
  <input
    type="checkbox"
    className={clsx(
      "t appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain mr-2 cursor-pointer",
      className
    )}
    {...props}
  />
);

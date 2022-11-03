import clsx from "clsx";
import { forwardRef, InputHTMLAttributes } from "react";

export const Checkbox: React.FC<InputHTMLAttributes<HTMLInputElement>> =
  forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => (
      <input
        ref={ref}
        type="checkbox"
        className={clsx(
          "t appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 bg-no-repeat bg-center bg-contain mr-2 cursor-pointer box-content",
          className
        )}
        {...props}
      />
    )
  );

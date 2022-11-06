import clsx from "clsx";
import { forwardRef, InputHTMLAttributes } from "react";

export const TextField: React.FC<InputHTMLAttributes<HTMLInputElement>> =
  forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    function TextFieldBase({ className, ...props }, ref) {
      return (
        <input
          ref={ref}
          type="text"
          className={clsx(
            "inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 disabled:bg-gray-50",
            "dark:bg-zinc-900 dark:border-zinc-700 dark:focus:ring-offset-zinc-500 dark:focus:ring-gray-800 dark:text-white dark:disabled:bg-zinc-700",
            className
          )}
          {...props}
        />
      );
    }
  );

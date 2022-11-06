import clsx from "clsx";
import { forwardRef, InputHTMLAttributes } from "react";
import styles from "./form.module.css";

export const TextField: React.FC<InputHTMLAttributes<HTMLInputElement>> =
  forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    function TextFieldBase({ className, ...props }, ref) {
      return (
        <input
          ref={ref}
          type="text"
          className={clsx(styles.input, className)}
          {...props}
        />
      );
    }
  );

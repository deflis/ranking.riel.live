import clsx from "clsx";
import { InputHTMLAttributes, forwardRef } from "react";

import styles from "./form.module.css";

export const TextField: React.FC<InputHTMLAttributes<HTMLInputElement>> =
  forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    function TextFieldBase({ className, type, ...props }, ref) {
      return (
        <input
          ref={ref}
          type={type ?? "text"}
          {...props}
          className={clsx(styles.input, className)}
        />
      );
    }
  );

import React, { PropsWithChildren } from "react";

const DetailItemText: React.FC<
  PropsWithChildren<{ label: React.ReactNode }>
> = ({ label, children }) => {
  return (
    <div>
      <div>{label}</div>
      <div>{children}</div>
    </div>
  );
};
export default DetailItemText;

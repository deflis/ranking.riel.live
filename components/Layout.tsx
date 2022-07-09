export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div>
    <div className="layout">{children}</div>
  </div>
);

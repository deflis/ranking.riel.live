import { Footer } from "./ui/common/Footer";
import { Header } from "./ui/common/Header";

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <>
    <Header />
    <div className="layout">{children}</div>
    <Footer />
  </>
);

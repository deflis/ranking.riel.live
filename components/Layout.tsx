import { Footer } from "./ui/common/Footer";
import { Header } from "./ui/common/Header";
import styles from "./Layout.module.css";

export const Layout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <div className={styles.body}>
    <Header />
    <div className={styles.layout}>{children}</div>
    <Footer />
  </div>
);

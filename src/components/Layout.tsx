import styles from "./Layout.module.css";
import { Footer } from "./ui/common/Footer";
import { Header } from "./ui/common/Header";

type LayoutProps = {
	children: React.ReactNode;
};

export const Layout: React.FC<LayoutProps> = ({ children }: LayoutProps) => (
	<div className={styles.body}>
		<Header />
		<div className={styles.layout}>{children}</div>
		<Footer />
	</div>
);

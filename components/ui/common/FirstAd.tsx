import { useHistory } from "react-router";
import { useCount } from "../../util/globalState";
import AdSense from "./AdSense";

export const FirstAd: React.FC = ({ children }) => {
  const history = useHistory();
  const count = useCount();
  const firstView = history.length < 2 && count < 100;
  return <>{firstView && (children ? children : <AdSense />)}</>;
};

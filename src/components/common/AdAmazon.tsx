import React from "react";

import { makeStyles, createStyles, Hidden } from "@material-ui/core";
import { useAdMode } from "../../util/globalState";

const useStyles = makeStyles((theme) =>
  createStyles({
    contiainer: {
      textAlign: "center",
    },
    ad: {
      border: "none",
    },
  })
);

const AdAmazon728x90: React.FC = () => {
  const style = useStyles();

  return (
    <iframe
      title="Amazon広告"
      className={style.ad}
      src="https://rcm-fe.amazon-adsystem.com/e/cm?o=9&p=48&l=ez&f=ifr&linkID=50fa90484170d3f8a8218a6b11bc21ca&t=riel011-22&tracking_id=riel011-22"
      width="728"
      height="90"
      scrolling="no"
    />
  );
};

const AdAmazon468x60: React.FC = () => {
  const style = useStyles();

  return (
    <iframe
      title="Amazon広告"
      className={style.ad}
      src="https://rcm-fe.amazon-adsystem.com/e/cm?o=9&p=13&l=ez&f=ifr&linkID=45eedac80204e7d9ae479f497dd6013c&t=riel011-22&tracking_id=riel011-22"
      width="468"
      height="60"
      scrolling="no"
    />
  );
};

export const AdAmazonWidth: React.FC = () => {
  const style = useStyles();
  const [adMode] = useAdMode();
  return (
    <>
      {adMode && (
        <div className={style.contiainer}>
          <Hidden smDown>
            <AdAmazon728x90 />
          </Hidden>
          <Hidden mdUp>
            <AdAmazon468x60 />
          </Hidden>
        </div>
      )}
    </>
  );
};

import React, { useEffect, useState } from "react";
import { TwitterShareButton } from "react-share";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";
import { Button } from "@material-ui/core";

export const TwitterShare: React.FC<{ title?: string }> = React.memo(
  ({ title: titleOriginal, children }) => {
    const [title, setTitle] = useState(
      titleOriginal ?? document.title.replace(" - なろうランキングビューワ", "")
    );

    useEffect(() => {
      if (titleOriginal) {
        setTitle(titleOriginal);
      } else {
        setTitle(document.title.replace(" - なろうランキングビューワ", ""));
      }
    }, [titleOriginal]);

    return (
      <Button
        component={TwitterShareButton}
        title={title}
        url={window.location.toString()}
        hashtags={["なろうランキングビューワ"]}
        resetButtonStyle={false}
        startIcon={<FontAwesomeIcon icon={faTwitter} />}
        variant="contained"
      >
        {children}
      </Button>
    );
  }
);

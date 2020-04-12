import React, { useEffect, useState } from "react";
import { TwitterShareButton } from "react-share";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";

export const TwitterShare: React.FC<{ title?: string }> = ({
  title: titleOriginal,
  children
}) => {
  const [title, setTitle] = useState(
    titleOriginal ?? document.title.replace("なろうランキングビューワ - ", "")
  );

  useEffect(() => {
    if (titleOriginal) {
      setTitle(titleOriginal);
    } else {
      setTitle(document.title.replace("なろうランキングビューワ - ", ""));
    }
  }, [ titleOriginal]);

  return (
    <TwitterShareButton
      className="button"
      title={title}
      url={window.location.toString()}
      hashtags={["なろうランキングビューワ"]}
      resetButtonStyle={false}
    >
      <FontAwesomeIcon icon={faTwitter} /> {children}
    </TwitterShareButton>
  );
};

import React, { useState, useCallback } from "react";

export const useMenu: () => [
  HTMLButtonElement | undefined,
  boolean,
  React.MouseEventHandler<HTMLButtonElement>,
  () => void
] = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>();
  const handleClick = useCallback((e) => setAnchorEl(e.currentTarget), []);
  const handleClose = useCallback(() => setAnchorEl(undefined), []);

  return [anchorEl, Boolean(anchorEl), handleClick, handleClose];
};

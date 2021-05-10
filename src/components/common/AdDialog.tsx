import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@material-ui/core";
import AdSense from "./AdSense";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";

export const AdDialog: React.FC<{
  handleOk: () => void;
  handleCancel: () => void;
}> = ({ handleOk, handleCancel }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Dialog open fullScreen={fullScreen} onClose={handleCancel}>
      <DialogTitle>広告を本当に消去してもよろしいですか？</DialogTitle>
      <DialogContent>
        <DialogContentText>
          昨今のインターネットは広告で成り立っています。このサービスの運営には数円程度と僅かながらも運営資金が必要となっております。ご協力をお願いしたいです。
        </DialogContentText>
        <AdSense />
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel} color="primary">
          広告を消去しない
        </Button>
        <Button onClick={handleOk} color="primary">
          広告を消去する
        </Button>
      </DialogActions>
    </Dialog>
  );
};

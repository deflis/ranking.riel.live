import React, { useCallback, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import AdSense from "./AdSense";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useLocalStorage } from "react-use";
import { useHistory } from "react-router";

export const R18Dialog: React.FC<{
  handleOk: () => void;
  handleCancel: () => void;
}> = ({ handleOk, handleCancel }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));
  return (
    <Dialog open fullScreen={fullScreen} onClose={handleCancel}>
      <DialogTitle>あなたは18歳以上ですか？</DialogTitle>
      <DialogContent>
        <DialogContentText>
          このページには18歳未満閲覧禁止のR18小説情報が含まれています。
          <br />
          あなたは18歳以上ですか？
        </DialogContentText>
        <AdSense />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="primary">
          18歳未満である（通常ランキングを見る）
        </Button>
        <Button autoFocus onClick={handleOk} color="primary">
          18歳以上である（閲覧可）
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const R18DialogForm: React.FC = () => {
  const [ok, setOk] = useLocalStorage("r18", false);
  const [showDialog, setShowDialog] = useState(!ok);
  const history = useHistory();
  const handleOk = useCallback(() => {
    setOk(true);
    setShowDialog(false);
  }, [setOk]);
  const handleCancel = useCallback(() => {
    history.push("/");
  }, [history]);
  return showDialog ? (
    <R18Dialog handleOk={handleOk} handleCancel={handleCancel} />
  ) : (
    <></>
  );
};

export default R18DialogForm;

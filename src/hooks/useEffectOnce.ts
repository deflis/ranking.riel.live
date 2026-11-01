import { useEffect } from "react";

export const useEffectOnce = (effect: React.EffectCallback) => {
	// oxlint-disable-next-line react/exhaustive-deps -- マウント時にのみ実行するため
	useEffect(effect, []);
};

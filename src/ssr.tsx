import {
	createStartHandler,
	defaultStreamHandler,
} from "@tanstack/react-start/server";
import { getRouterManifest } from "@tanstack/react-start/plugin/manifest";
import { getRouter } from "./router";

export default createStartHandler({
	createRouter: getRouter,
	getRouterManifest,
})(defaultStreamHandler);

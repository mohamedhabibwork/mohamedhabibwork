import { getDefaultConfig } from "expo/metro-config.js";
import { wrapWithReanimatedMetroConfig } from "react-native-reanimated/metro-config/index.js";
import { withUniwindConfig } from "uniwind/metro";

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(import.meta.dirname);

const uniwindConfig = withUniwindConfig(wrapWithReanimatedMetroConfig(config), {
	cssEntryFile: "./global.css",
	dtsFile: "./uniwind-types.d.ts",
});

export default uniwindConfig;

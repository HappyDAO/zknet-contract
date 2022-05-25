import { pino } from "pino";
import pretty from "pino-pretty";
import { pinoCaller } from "pino-caller";
import { resolve } from "path";

export const logger = pinoCaller(
  pino(
    pretty({
      sync: true,
      colorize: true,
      translateTime: "yyyy-mm-dd HH:MM:ss.l",
      ignore: "pid,hostname",
      levelFirst: true,
    }),
  ),
  { relativeTo: resolve(__dirname, "..") },
);

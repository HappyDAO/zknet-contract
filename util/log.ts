import { resolve } from "path";
import { pino } from "pino";
import { pinoCaller } from "pino-caller";
import pretty from "pino-pretty";

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

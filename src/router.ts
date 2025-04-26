// Generouted, changes to this file will be overridden
/* eslint-disable */

import { components, hooks, utils } from "@generouted/react-router/client";

export type Path =
  | `/`
  | `/about`
  | `/custom/:type?`
  | `/detail/:ncode`
  | `/r18/:type?/:date?`
  | `/r18/detail/:ncode`
  | `/ranking/:type?/:date?`;

export type Params = {
  "/custom/:type?": { type?: string };
  "/detail/:ncode": { ncode: string };
  "/r18/:type?/:date?": { type?: string; date?: string };
  "/r18/detail/:ncode": { ncode: string };
  "/ranking/:type?/:date?": { type?: string; date?: string };
};

export type ModalPath = never;

export const { Link, Navigate } = components<Path, Params>();
export const { useModals, useNavigate, useParams } = hooks<
  Path,
  Params,
  ModalPath
>();
export const { redirect } = utils<Path, Params>();

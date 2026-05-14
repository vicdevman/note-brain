import { defaultCache } from "@serwist/next/worker";
import {
  BackgroundSyncPlugin,
  ExpirationPlugin,
  NetworkFirst,
  NetworkOnly,
  Serwist,
  StaleWhileRevalidate,
} from "serwist";
import type { PrecacheEntry, RuntimeCaching } from "serwist";

declare global {
  interface WorkerGlobalScope {
    __SW_MANIFEST: (PrecacheEntry | string)[];
  }
}

declare const self: WorkerGlobalScope & typeof globalThis;

const syncQueue = new BackgroundSyncPlugin("brane-sync-queue", {
  maxRetentionTime: 24 * 60,
});

const runtimeCaching: RuntimeCaching[] = [
  {
    matcher: ({ sameOrigin, url: { pathname } }) =>
      sameOrigin && pathname.startsWith("/api/notes"),
    method: "POST",
    handler: new NetworkOnly({ plugins: [syncQueue] }),
  },
  {
    matcher: ({ sameOrigin, url: { pathname } }) =>
      sameOrigin && pathname.startsWith("/api/notes"),
    method: "PATCH",
    handler: new NetworkOnly({ plugins: [syncQueue] }),
  },
  {
    matcher: ({ sameOrigin, url: { pathname } }) =>
      sameOrigin && pathname.startsWith("/api/notes"),
    method: "DELETE",
    handler: new NetworkOnly({ plugins: [syncQueue] }),
  },
  {
    matcher: ({ sameOrigin, url: { pathname } }) =>
      sameOrigin && (pathname === "/app" || pathname.startsWith("/app/")),
    handler: new NetworkFirst({
      cacheName: "brane-app-shell",
      networkTimeoutSeconds: 3,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 24,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        }),
      ],
    }),
  },
  {
    matcher: ({ sameOrigin, url: { pathname } }) =>
      sameOrigin && pathname.startsWith("/brane-brand-kit/"),
    handler: new StaleWhileRevalidate({
      cacheName: "brane-brand-assets",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 24,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
      ],
    }),
  },
  ...defaultCache,
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
});

serwist.addEventListeners();

import {
  data,
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache";
import { useState } from "react";
export async function loader() {
  const CONVEX_URL = process.env["CONVEX_URL"]!;
  return data({ ENV: { CONVEX_URL } });
}
import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const loaderData = useLoaderData<typeof loader>();
  const convexUrl = loaderData?.ENV?.CONVEX_URL || "";
  const [convex] = useState(() => new ConvexReactClient(convexUrl));
  const [queryClient] = useState(() => {
    const convexQueryClient = new ConvexQueryClient(convex);
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          queryKeyHashFn: convexQueryClient.hashFn(),
          queryFn: convexQueryClient.queryFn(),
          staleTime: Infinity, // Data is never stale with Convex's real-time updates
          gcTime: 10000, // Keep cached queries for 10 seconds after last use
        },
      },
    });
    convexQueryClient.connect(client);
    return client;
  });

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <ConvexProvider client={convex}>
          <ConvexQueryCacheProvider>
            <QueryClientProvider client={queryClient}>
              <nav className="bg-blue-600 dark:bg-blue-700 border-b border-blue-700 dark:border-blue-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center gap-8 h-16">
                    <Link
                      to="/"
                      className="text-white hover:text-blue-100 font-semibold transition-colors"
                    >
                      🏠 Home
                    </Link>
                    <Link
                      to="/products"
                      className="text-white hover:text-blue-100 font-semibold transition-colors"
                    >
                      📦 Products
                    </Link>
                  </div>
                </div>
              </nav>
              {children}
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </ConvexQueryCacheProvider>
        </ConvexProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

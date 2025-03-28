// This file is needed to satisfy the Next.js export requirements
// for dynamic routes when using "output: export" in next.config.js

export function generateStaticParams() {
  // Return an empty array as we don't need to pre-render any specific paths
  // The API routes will be handled client-side
  return [];
}

// This is a placeholder page component that won't actually be used
export default function Page() {
  return null;
}
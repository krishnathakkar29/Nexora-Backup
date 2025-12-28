import type { Metadata } from "next";
// import localFont from "next/font/local";
import { Space_Grotesk } from 'next/font/google';
import "./test.css";
import QueryProviderWrapper from "@/wrappers/query-provider";
import { Toaster } from "sonner";

// const clashGrotesk = localFont({
//   src: "../fonts/ClashGrotesk-Variable.woff2",
//   variable: "--font-CG",
// });

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'], // Specify the necessary subsets
  variable: '--font-space-grotesk', // Optional: Define a CSS variable for use with Tailwind CSS
});

export const metadata: Metadata = {
  title: "Nexora",
  description:
    "Nexora - A platform to outreach and manage efficiently , make dynamic forms and assistant for your queries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable}  antialiased min-h-dvh`}>
        <QueryProviderWrapper>
          {children}
          <Toaster
            position="bottom-right"
            expand={true}
            richColors
            theme="dark"
            closeButton
            style={{ marginBottom: "20px" }}
          />
        </QueryProviderWrapper>
      </body>
    </html>
  );
}

import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/*
         * Google Fonts se cargan acá con <link>, no con @import en global.css:
         * en el build de producción Next concatena todo el CSS en un solo bundle y
         * las reglas @import quedan después del reset de Tailwind, por lo que el
         * navegador las descarta (spec: @import debe preceder cualquier regla).
         */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Abel&family=Poppins:wght@400;500;700&family=GT+Super+Display:wght@300&family=Inter&family=Graphik:wght@400;500;600;700&family=Allura&display=swap"
        />
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="UugClPEBpZ+JIUWW2C/7hg"
          async
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

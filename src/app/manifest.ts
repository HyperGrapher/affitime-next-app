import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "Affitime", short_name: "Affitime", description: "Affiliate pazaryeri", start_url: "/", display: "standalone", background_color: "#fbfaf7", theme_color: "#5b3df5", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }] };
}

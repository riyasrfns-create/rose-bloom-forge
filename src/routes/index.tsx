import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Collections } from "@/components/site/Collections";
import { Offers } from "@/components/site/Offers";
import { Export } from "@/components/site/Export";
import { Gallery } from "@/components/site/Gallery";
import { Testimonials } from "@/components/site/Testimonials";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { Intro } from "@/components/site/Intro";
import { PetalField } from "@/components/site/ambient";

const title = "Flower Industries (Pvt) Ltd | Luxury Florist & Floral Export, Sri Lanka";
const description =
  "Couture floral design and worldwide export from Wellampitiya, Sri Lanka. Luxury bouquets, hotel florals, wedding installations and bulk export for international clients.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Intro />
      <PetalField />
      <Nav />
      <main className="relative z-10">
        <Hero />
        <About />
        <Collections />
        <Offers />
        <Export />
        <Gallery />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

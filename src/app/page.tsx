import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Solutions from "@/components/Solutions";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import ContactForm from "@/components/ContactForm";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Solutions />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}

import { LandingHeader } from './components/header'
import { HeroSection } from './components/hero'
import { FeaturesSection } from './components/features'
import { WorkflowSection } from './components/workflow'
import { PricingSection } from './components/pricing'
import { FAQSection } from './components/faq'
import { Footer } from './components/footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <WorkflowSection />
        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}

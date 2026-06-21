import { LandingFaqSection } from '@/components/landing/LandingFaqSection'
import { LandingFeaturesSection } from '@/components/landing/LandingFeaturesSection'
import { LandingHeroSection } from '@/components/landing/LandingHeroSection'
import { LandingPricingSection } from '@/components/landing/LandingPricingSection'
import { LandingWorkflowSection } from '@/components/landing/LandingWorkflowSection'

/**
 * Marketing home page content rendered inside the landing layout.
 */
export function LandingPage() {
  return (
    <>
      <LandingHeroSection />
      <LandingFeaturesSection />
      <LandingWorkflowSection />
      <LandingPricingSection />
      <LandingFaqSection />
    </>
  )
}

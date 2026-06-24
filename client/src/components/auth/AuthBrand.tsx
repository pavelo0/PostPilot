import { BrandLogo } from '@/components/BrandLogo'
import { Link } from 'react-router-dom'

export function AuthBrand() {
  return (
    <Link to="/" aria-label="PostPilot">
      <BrandLogo size="sm" />
    </Link>
  )
}

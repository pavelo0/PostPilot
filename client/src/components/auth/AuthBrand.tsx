import logo from '@/assets/logo.svg'
import { Link } from 'react-router-dom'

/**
 * Brand block used across auth screens.
 */
export function AuthBrand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <img src={logo} alt="PostPilot" className="h-7 w-7 rounded-md" />
      <span className="text-sm font-semibold">PostPilot</span>
    </Link>
  )
}

import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image src="/htcab-haridwar-best-taxi-service-logo.jpg" alt="HappyTaxi" width={40} height={40} className="rounded-lg" />
              <span className="text-xl font-bold text-primary">HappyTaxi</span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-md">
              Connecting drivers and passengers for safe, reliable, and affordable rides. Your journey is our priority.
            </p>
            <div className="flex space-x-4">
              <Link href="https://www.facebook.com/people/Deepak-Joshi/pfbid02u8D63BVc26apTbkdcC7n95wVkNx67FNDdvmra3Ed67utb49d5cfzAWHUbXx5kxs5l/?rdid=XRjjpoqQNQRsVxP9&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1ELNes8Ydj%2F" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              
              <Link href="https://www.instagram.com/happytaxiservice1?igsh=MXhxNG1nMXcxZXQ1YQ==" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-muted-foreground hover:text-primary">
                  Safety
                </Link>
              </li>
              <li>
                <Link href="/rides" className="text-muted-foreground hover:text-primary">
                  Find Rides
                </Link>
              </li>
              <li>
                <Link href="/auth" className="text-muted-foreground hover:text-primary">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+91 9760764682</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>rashmijoshi193@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Flat 108 P4 Deep Ganga Apartment ,Haridwar,Uttrakhand</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HappyTaxi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

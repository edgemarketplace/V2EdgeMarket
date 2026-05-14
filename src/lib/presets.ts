type PageType = 'home' | 'about' | 'products' | 'product-detail' | 'contact';

export const PAGE_PRESETS: Record<PageType, any> = {
  home: {
    content: [
      { type: 'Header', props: { navLinks: [{ label: 'About', href: '/about' }, { label: 'Products', href: '/products' }, { label: 'Contact', href: '/contact' }] } },
      { type: 'Hero', props: { heading: 'Welcome to our Marketplace', subheading: 'Discover extraordinary items crafted with care.' } },
      { type: 'GridFeaturedProducts', props: { title: 'Featured Selection' } },
      { type: 'ConversionInquiry', props: { title: 'Have a Question?', buttonText: 'Contact Us' } },
      { type: 'Footer', props: { copyright: '© 2024 Edge Marketplace' } }
    ],
    root: { props: { title: 'Home' } }
  },
  about: {
    content: [
      { type: 'Header', props: { navLinks: [{ label: 'Home', href: '/home' }, { label: 'Products', href: '/products' }, { label: 'Contact', href: '/contact' }] } },
      { type: 'Hero', props: { heading: 'Our Story', subheading: 'Passion, craft, and the community behind it all.' } },
      { type: 'TrustStory', props: { title: 'The Maker Behind the Brand', content: 'We believe in quality over quantity...' } },
      { type: 'Footer', props: { copyright: '© 2024 Edge Marketplace' } }
    ],
    root: { props: { title: 'About Us' } }
  },
  products: {
    content: [
      { type: 'Header', props: { navLinks: [{ label: 'Home', href: '/home' }, { label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }] } },
      { type: 'Hero', props: { heading: 'Explore Collection', subheading: 'Browse our full catalog of premium offerings.' } },
      { type: 'GridFeaturedProducts', props: { title: 'Full Catalog' } },
      { type: 'Footer', props: { copyright: '© 2024 Edge Marketplace' } }
    ],
    root: { props: { title: 'Products' } }
  },
  'product-detail': {
    content: [
      { type: 'Header', props: { navLinks: [{ label: 'Home', href: '/home' }, { label: 'Products', href: '/products' }] } },
      { type: 'Hero', props: { heading: 'Product Name', subheading: '$99.00' } },
      { type: 'Footer', props: { copyright: '© 2024 Edge Marketplace' } }
    ],
    root: { props: { title: 'Product Details' } }
  },
  contact: {
    content: [
      { type: 'Header', props: { navLinks: [{ label: 'Home', href: '/home' }, { label: 'About', href: '/about' }, { label: 'Products', href: '/products' }] } },
      { type: 'Hero', props: { heading: 'Get in Touch', subheading: 'We are here to help you with any inquiries.' } },
      { type: 'ConversionInquiry', props: { title: 'Send us a Message', buttonText: 'Submit' } },
      { type: 'Footer', props: { copyright: '© 2024 Edge Marketplace' } }
    ],
    root: { props: { title: 'Contact Us' } }
  }
};

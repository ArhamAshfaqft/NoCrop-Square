import React, { useState } from 'react'
import { toast } from 'sonner'
import icon from '../assets/icon.png'
import heroShowcase from '../assets/hero-showcase.png'
import {
  ArrowRight,
  Sparkles,
  Scaling,
  Stamp,
  FilePenLine,
  Minimize2,
  Lock,
  Check,
  ShieldCheck,
  Cpu,
  Zap,
  Moon,
  Sun,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ShoppingBag,
  Star
} from 'lucide-react'

const ROW1_REVIEWS = [
  {
    name: "Sarah K.",
    role: "Etsy Handmade Jewelry Owner",
    text: "Saved me over 10 hours a week on product listing preparation. The secure AI background removal is faster than Photoshop, and the bulk renaming takes seconds."
  },
  {
    name: "Marcus D.",
    role: "Shopify Apparel Brand Founder",
    text: "Decreased our product page load speeds by 42% after converting catalog listings to WebP. Our search visibility and conversion rates went up immediately."
  },
  {
    name: "Elena V.",
    role: "Digital Marketing Agency Director",
    text: "Watermarking hundreds of catalog images was a nightmare. OptiSnap does background removal, watermarks, resizing, and zip packing in one run. Unbelievable tool."
  },
  {
    name: "David L.",
    role: "Amazon FBA Power Seller",
    text: "Amazon requires strict pure white backgrounds and exact 1600px square sizing. OptiSnap automates this perfectly for entire batch folder uploads."
  },
  {
    name: "Aiko M.",
    role: "Etsy Vintage Collective Shop",
    text: "I love that it keeps my original photo quality high while resizing. The padding blur background looks extremely high-end on our store catalog."
  },
  {
    name: "Carlos R.",
    role: "eBay Electronics Merchant",
    text: "Bulk renaming with product serial numbers and sequential indexing has saved my team countless copy-paste hours. A must-have tool for high volume listings."
  }
];

const ROW2_REVIEWS = [
  {
    name: "Sophie T.",
    role: "WooCommerce Boutique Designer",
    text: "Being able to save custom presets for our main collection styles and load them instantly saves so much brainpower. Best investment this year."
  },
  {
    name: "Jordan B.",
    role: "Poshmark Ambassador",
    text: "Preparing square crop images for Poshmark has never been this simple. I drag 50 photos, click process, and get them back in less than a minute."
  },
  {
    name: "Liam W.",
    role: "Sneaker Reseller & Store Owner",
    text: "The transparency warning saved me from exporting corrupt transparency formats. The WebP compression is lossless and clean."
  },
  {
    name: "Chloe N.",
    role: "Eco-friendly Brand Manager",
    text: "Our team works across different operating systems. Having a zero-install, secure web engine means we can process everything directly without overhead."
  },
  {
    name: "Ravi S.",
    role: "E-commerce SEO Consultant",
    text: "Proper image sizing and target naming is key for Google Image SEO. OptiSnap solves both of these bottlenecks in one single click."
  },
  {
    name: "Nina G.",
    role: "Handmade Pottery Artist",
    text: "I'm not tech-savvy, but the interface is so beautiful and easy to use. No confusing options, just drag, drop, and export."
  }
];

export default function LandingPage({ onLaunchApp, session, theme, toggleTheme }) {
  const [activeFaq, setActiveFaq] = useState(null)

  const faqs = [
    {
      q: "Does this upload my photos to your servers?",
      a: "No. OptiSnap is designed with a privacy-first secure pipeline. All image resizing, background removal, and compression are processed instantly on a secure, isolated sandboxed layer. Your raw photos are kept 100% private and never leave your environment."
    },
    {
      q: "What makes this better than standard tools?",
      a: "OptiSnap combines multiple workflows—background removal, canvas crop padding, watermarking, file renaming, and compression—into a single run. Instead of using 4 different tools, you do everything in 3 seconds."
    },
    {
      q: "How does the lifetime deal work?",
      a: "You pay once and own it forever. There are no recurring monthly subscription costs or limits on the number of images you can process."
    },
    {
      q: "Do I need to install any desktop applications?",
      a: "No. OptiSnap is a cloud-ready web application accessible instantly through standard web browsers (Chrome, Edge, Safari, Firefox). There is no setup, installation, or administrative rights required."
    },
    {
      q: "What image output formats are supported?",
      a: "You can convert and export your images to JPG, PNG, WEBP, and AVIF container formats with customizable quality levels."
    }
  ]

  const features = [
    {
      icon: <Sparkles size={22} className="text-pro" />,
      title: "AI Background Removal",
      desc: "Remove distracting backgrounds in seconds using optimized AI models."
    },
    {
      icon: <Scaling size={22} className="text-pro" />,
      title: "Crop Padding Presets",
      desc: "Instantly crop or fit images to standard presets for Etsy, Shopify, Pinterest, and Instagram."
    },
    {
      icon: <Minimize2 size={22} className="text-pro" />,
      title: "Lossless Compression",
      desc: "Shave off up to 85% of image file weight with zero visual quality loss for faster site loading."
    },
    {
      icon: <FilePenLine size={22} className="text-pro" />,
      title: "Bulk SEO Renaming",
      desc: "Rename entire batches sequentially using target product keywords to increase organic search rankings."
    },
    {
      icon: <Stamp size={22} className="text-pro" />,
      title: "Logo & Text Watermarks",
      desc: "Add translucent branding overlays to prevent content theft. Features custom position and opacity controls."
    },
    {
      icon: <Lock size={22} className="text-pro" />,
      title: "100% Data Protection",
      desc: "Isolated sandbox execution means complete data privacy. Perfect for proprietary design catalogs."
    }
  ]

  const pricingTiers = [
    {
      name: "Starter Deal",
      price: "$49",
      period: "one-time payment",
      desc: "Perfect for independent sellers and creators starting out.",
      features: [
        "Up to 50 images per batch",
        "E-commerce presets (Etsy, Shopify, Amazon)",
        "Text and logo watermarking",
        "Keyword sequential renaming",
        "Lifetime platform updates",
        "Standard support"
      ],
      isPopular: false,
      cta: "Get Starter Access"
    },
    {
      name: "Professional Deal",
      price: "$99",
      period: "one-time payment",
      desc: "Best for high-volume stores, power users, and agencies.",
      features: [
        "Unlimited image batches",
        "Premium AI background removal",
        "Lossless high-speed compression settings",
        "Blurred padding options",
        "Priority customer support",
        "Lifetime platform updates",
        "Commercial usage license"
      ],
      isPopular: true,
      cta: "Get Professional Access"
    }
  ]

  return (
    <div style={{
      height: '100vh',
      overflowY: 'auto',
      scrollBehavior: 'smooth',
      background: 'var(--bg-main)',
      color: 'var(--text-main)',
      transition: 'background 0.3s ease, color 0.3s ease'
    }}>
      {/* Sticky Navigation Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 40px',
        transition: 'background 0.3s, border-color 0.3s'
      }} className="navbar-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '18px' }}>
          <img src={icon} alt="OptiSnap Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span>OptiSnap</span>
        </div>

        <nav style={{
          display: 'flex',
          gap: '30px',
          alignItems: 'center',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)'
        }}>
          <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Features</a>
          <a href="#how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>How it Works</a>
          <a href="#pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Pricing</a>
          <a href="#faq" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>FAQ</a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {!session && (
            <button
              onClick={() => onLaunchApp('settings')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '8px 16px',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.8'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              Log In / Sign Up
            </button>
          )}
          
          <button className="btn-primary" onClick={() => onLaunchApp('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {session ? "Open Workspace" : "Launch Workspace"} <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '100px 40px 60px 40px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {/* Soft Decorative Glow */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
          zIndex: -1,
          borderRadius: '50%'
        }}></div>

        <span style={{
          background: 'rgba(139, 92, 246, 0.1)',
          color: 'var(--primary)',
          padding: '6px 16px',
          borderRadius: '30px',
          fontSize: '13px',
          fontWeight: 600,
          border: '1px solid rgba(139, 92, 246, 0.2)'
        }}>
          Privacy-First Image Engine
        </span>

        <h1 style={{
          fontSize: '48px',
          fontWeight: 800,
          lineHeight: '1.2',
          letterSpacing: '-1px',
          margin: '24px 0 16px 0',
          color: 'var(--text-main)'
        }}>
          E-Commerce Images, Ready in One Click.
        </h1>

        <p style={{
          fontSize: '18px',
          color: 'var(--text-secondary)',
          maxWidth: '680px',
          margin: '0 auto 32px auto',
          lineHeight: '1.6'
        }}>
          Resize, remove backgrounds, compress, and watermark your product photos with professional-grade speed. Increase shop page speed, protect your assets, and boost Etsy and Shopify SEO.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => onLaunchApp('dashboard')} style={{ padding: '16px 32px', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Launch Workspace Free <ArrowRight size={16} />
          </button>
          <a href="#pricing" style={{
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            padding: '16px 32px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 500,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            transition: 'all 0.2s'
          }} className="btn-secondary-custom">
            Compare Lifetime Deals
          </a>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '16px' }}>
          No installation required. Get instant processing and enterprise-grade privacy for your catalog.
        </p>
      </section>

      {/* Hero Mockup Showcase */}
      <section style={{ padding: '0 40px 60px 40px', maxWidth: '1150px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Mock Browser Header Bar */}
          <div style={{
            height: '40px',
            background: 'var(--bg-main)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            position: 'relative',
            flexShrink: 0
          }}>
            {/* Window control dots */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56' }}></span>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e' }}></span>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f' }}></span>
            </div>
            {/* Centered URL Address */}
            <div style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              padding: '4px 18px',
              borderRadius: '6px',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              fontFamily: 'monospace',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ color: '#27c93f', fontSize: '8px' }}>●</span> app.optisnap.app/workspace
            </div>
          </div>

          {/* Browser Workspace Content */}
          <div style={{ background: '#ffffff', width: '100%', position: 'relative' }}>
            <img 
              src={heroShowcase} 
              alt="OptiSnap Workflow Showcase" 
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
              onError={(e) => {
                // If the file is not placed in assets folder yet, display a styled placeholder
                e.target.style.display = 'none';
                const placeholder = document.getElementById('hero-img-placeholder');
                if (placeholder) placeholder.style.display = 'flex';
              }}
            />
            {/* Fallback Beautiful Placeholder */}
            <div 
              id="hero-img-placeholder"
              style={{
                display: 'none',
                width: '100%',
                height: '400px',
                background: 'linear-gradient(135deg, rgba(134, 77, 226, 0.08) 0%, rgba(134, 77, 226, 0.01) 100%)',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '12px',
                padding: '24px',
                boxSizing: 'border-box'
              }}
            >
              <Sparkles size={40} style={{ color: 'var(--primary)' }} />
              <h4 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>Workflow Showcase Mockup</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, maxWidth: '420px', lineHeight: 1.5 }}>
                Save your workflow screenshot as <code style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 4px', borderRadius: '3px' }}>src/assets/hero-showcase.png</code> to display it in this mock browser!
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* Features Grid Section */}
      <section id="features" style={{
        padding: '80px 40px',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-color)',
        transition: 'background 0.3s'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ marginBottom: '12px' }}>Professional Features. Built to Convert.</h2>
            <p style={{ color: 'var(--text-secondary)', maxW: '600px', margin: '0 auto' }}>
              We loaded OptiSnap with the exact image preparation tools high-volume e-commerce sellers demand daily.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px'
          }}>
            {features.map((feat, idx) => (
              <div key={idx} style={{
                padding: '24px',
                borderRadius: '12px',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{
                  background: 'var(--bg-card)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {feat.icon}
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>{feat.title}</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" style={{
        padding: '80px 0',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        width: '100%',
        transition: 'background 0.3s'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ marginBottom: '12px' }}>Three Steps. Done.</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Get batch listings prepared without opening bloated software suites.</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '30px'
          }} className="steps-container">
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(139, 92, 246, 0.1)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '18px',
                margin: '0 auto 16px auto',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>1</div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>Select Product Files</h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Drag and drop multiple raw product images directly into the browser dashboard.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(139, 92, 246, 0.1)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '18px',
                margin: '0 auto 16px auto',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>2</div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>Apply Listing Rules</h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Activate AI background removal, select crop dimensions, append watermarks, and set keyword formats.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(139, 92, 246, 0.1)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '18px',
                margin: '0 auto 16px auto',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>3</div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>Download Compressed ZIP</h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Click process to trigger multi-threaded canvas builders and receive your optimized package in a single ZIP.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" style={{
        padding: '80px 0',
        width: '100%',
        overflowX: 'hidden',
        position: 'relative'
      }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes scrollLeft {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes scrollRight {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .marquee-track-left {
            display: flex;
            gap: 24px;
            width: max-content;
            animation: scrollLeft 40s linear infinite;
          }
          .marquee-track-right {
            display: flex;
            gap: 24px;
            width: max-content;
            animation: scrollRight 40s linear infinite;
          }
          .marquee-track-left:hover,
          .marquee-track-right:hover {
            animation-play-state: paused;
          }
        `}} />

        <div style={{ textAlign: 'center', marginBottom: '50px', padding: '0 40px' }}>
          <h2 style={{ marginBottom: '12px' }}>Loved by E-Commerce Sellers</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Here is why store owners and digital marketers are switching to OptiSnap.</p>
        </div>

        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          overflow: 'hidden',
          width: '100%',
          padding: '10px 0'
        }}>
          {/* Edge Gradient Fades */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '150px',
            height: '100%',
            background: 'linear-gradient(to right, var(--bg-main) 0%, transparent 100%)',
            zIndex: 2,
            pointerEvents: 'none'
          }}></div>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '150px',
            height: '100%',
            background: 'linear-gradient(to left, var(--bg-main) 0%, transparent 100%)',
            zIndex: 2,
            pointerEvents: 'none'
          }}></div>

          {/* Row 1 (Scrolling Left) */}
          <div className="marquee-track-left">
            {[...ROW1_REVIEWS, ...ROW1_REVIEWS].map((rev, idx) => (
              <div key={idx} style={{
                background: 'var(--bg-card)',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
                width: '320px',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                whiteSpace: 'normal',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="var(--primary)" color="var(--primary)" />
                  ))}
                </div>
                <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-main)', margin: 0, fontStyle: 'italic' }}>
                  "{rev.text}"
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', paddingTop: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{rev.name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{rev.role}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2 (Scrolling Right) */}
          <div className="marquee-track-right">
            {[...ROW2_REVIEWS, ...ROW2_REVIEWS].map((rev, idx) => (
              <div key={idx} style={{
                background: 'var(--bg-card)',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
                width: '320px',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                whiteSpace: 'normal',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="var(--primary)" color="var(--primary)" />
                  ))}
                </div>
                <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-main)', margin: 0, fontStyle: 'italic' }}>
                  "{rev.text}"
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', paddingTop: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{rev.name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{rev.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Matrix (AppSumo Lifetime Deal) */}
      <section id="pricing" style={{
        padding: '80px 40px',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        transition: 'background 0.3s'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{
              background: 'rgba(34, 197, 94, 0.1)',
              color: '#22c55e',
              padding: '6px 16px',
              borderRadius: '30px',
              fontSize: '12px',
              fontWeight: 600,
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              Limited AppSumo Launch Deal
            </span>
            <h2 style={{ margin: '16px 0 12px 0' }}>One-Time Investment. Lifetime Value.</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Choose the volume option that aligns with your listing size.</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '30px',
            marginTop: '20px'
          }} className="pricing-grid">
            {pricingTiers.map((tier, idx) => (
              <div key={idx} style={{
                background: 'var(--bg-main)',
                borderRadius: '16px',
                padding: '40px',
                border: tier.isPopular ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                {tier.isPopular && (
                  <span style={{
                    position: 'absolute',
                    top: '-13px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '4px 14px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Highly Recommended
                  </span>
                )}

                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>{tier.name}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', minHeight: '38px' }}>{tier.desc}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '36px', fontWeight: 800 }}>{tier.price}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>/ {tier.period}</span>
                  </div>

                  <div className="divider" style={{ margin: '20px 0' }}></div>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <Check size={14} style={{ color: '#22c55e', flexShrink: 0 }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className={tier.isPopular ? 'btn-primary' : 'btn-secondary'}
                  style={{ width: '100%', padding: '12px', textAlign: 'center', fontWeight: 600 }}
                  onClick={onLaunchApp}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '40px',
            textAlign: 'center',
            padding: '20px',
            background: 'var(--bg-main)',
            borderRadius: '12px',
            border: '1px dashed var(--border-color)',
            fontSize: '13px',
            color: 'var(--text-secondary)'
          }}>
            📋 Have an AppSumo activation code? Launch the workspace and activate it instantly under Account Settings.
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section id="faq" style={{ padding: '80px 40px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ marginBottom: '12px' }}>Answering Key Questions</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Clear answers regarding privacy, performance, and features.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, idx) => (
            <div key={idx} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--text-main)'
                }}
              >
                <span>{faq.q}</span>
                {activeFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {activeFaq === idx && (
                <div style={{
                  padding: '0 24px 20px 24px',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '16px'
                }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner Section */}
      <section style={{
        padding: '60px 40px 80px 40px',
        background: 'var(--bg-main)',
        transition: 'background 0.3s'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          background: 'linear-gradient(135deg, var(--primary) 0%, #6D28D9 100%)',
          borderRadius: '24px',
          padding: '60px 40px',
          textAlign: 'center',
          boxShadow: '0 20px 40px -15px rgba(139, 92, 246, 0.4)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle Graphic Accents */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-20%',
            width: '300px',
            height: '300px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-50%',
            right: '-10%',
            width: '250px',
            height: '250px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}></div>

          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px', color: '#ffffff' }}>Ready to Optimize Your Listing Flow?</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', maxWidth: '520px', margin: '0 auto 32px auto', fontSize: '15px', lineHeight: '1.6' }}>
            Start processing bulk images securely with 100% data privacy. Accelerate shop loading speed and protect your catalog.
          </p>
          <button onClick={onLaunchApp} style={{
            padding: '16px 36px',
            fontSize: '15px',
            fontWeight: 600,
            background: '#ffffff',
            color: 'var(--primary)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }} className="btn-cta-card">
            Open OptiSnap Workspace <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer Section */}
      <footer style={{
        padding: '80px 40px 40px 40px',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-color)',
        transition: 'background 0.3s'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Premium Multi-Column Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1.5fr',
            gap: '40px',
            paddingBottom: '60px',
            borderBottom: '1px solid var(--border-color)',
            textAlign: 'left'
          }} className="footer-links-grid">
            {/* Column 1: Brand & Security Badge */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '16px' }}>
                <img src={icon} alt="OptiSnap Logo" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                <span>OptiSnap</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                High-performance automated image engine custom-built for high-volume Etsy, Shopify, and Amazon sellers.
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                marginTop: '8px',
                width: 'fit-content'
              }}>
                <ShieldCheck size={16} style={{ color: '#22c55e' }} />
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>100% Enterprise-Grade Private</span>
              </div>
            </div>

            {/* Column 2: Product Tools */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-main)' }}>Features</span>
              <a href="#" onClick={(e) => { e.preventDefault(); onLaunchApp('bg-removal'); }} style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>AI BG Remover</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onLaunchApp('resize'); }} style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Canvas Padding</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onLaunchApp('compress'); }} style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>WEBP Compression</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onLaunchApp('rename'); }} style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>SEO Bulk Rename</a>
            </div>

            {/* Column 3: Resources */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-main)' }}>Resources</span>
              <a href="#faq" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Help & FAQs</a>
              <a href="#pricing" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>AppSumo Deal</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onLaunchApp('settings'); }} style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Redeem License</a>
              <a href="#" onClick={(e) => { e.preventDefault(); toast.info("Developer API access is in private beta. Please email support@optisnap.app to request access."); }} style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Developer API</a>
            </div>

            {/* Column 4: Platform Security Assurance */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-main)' }}>Data Compliance</span>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                OptiSnap is built on an isolated, sandboxed environment. No files or personal metadata are ever collected, stored, or processed on external servers.
              </p>
            </div>
          </div>

          {/* Footer Copyright Bottom Bar */}
          <div style={{
            marginTop: '30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }} className="footer-bottom">
            <span>© 2026 OptiSnap Inc. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '24px' }}>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Terms of Service</a>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

"use client";

export function Footer() {
  return (
    <footer className="site-footer w-full">
      <div className="footer-top">
        <div className="footer-logo">
          <img
            src="https://cdn.shopify.com/s/files/1/0968/4595/5385/files/Sycomp-logo-white-1.webp?v=1765876745"
            alt="Sycomp Logo"
          />
        </div>

        <nav className="footer-nav">
          <a href="https://sycomp.com/solutions/" target="_blank" rel="noopener noreferrer">Solutions</a>
          <a href="https://sycomp.com/services/" target="_blank" rel="noopener noreferrer">Services</a>
          <a href="https://sycomp.com/industries/" target="_blank" rel="noopener noreferrer">Industries</a>
          <a href="https://sycomp.com/resources/" target="_blank" rel="noopener noreferrer">Resources</a>
          <a href="https://sycomp.com/about/" target="_blank" rel="noopener noreferrer">About</a>
          <a href="https://sycomp.com/careers/" target="_blank" rel="noopener noreferrer">Careers</a>
          <a href="https://sycomp.com/customer-support/" target="_blank" rel="noopener noreferrer">Customer Support</a>
        </nav>

        <div className="footer-social">
          <a href="https://www.instagram.com/sycomp_inc/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <img
              src="https://cdn.shopify.com/s/files/1/0968/4595/5385/files/white-instagram-social-media-logo-computer-icon-735811695985674klghdw6h78-Photoroom.png?v=1765878153"
              alt="Instagram"
            />
          </a>
          <a href="https://www.facebook.com/SycompInc/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <img
              src="https://cdn.shopify.com/s/files/1/0968/4595/5385/files/facebook-logo-white-white-facebook-f-logo-115628618682gxdsl4yn5-Photoroom.png?v=1765878154"
              alt="Facebook"
            />
          </a>
          <a href="https://x.com/Sycomp_Inc" target="_blank" rel="noopener noreferrer" aria-label="X">
            <img
              src="https://cdn.shopify.com/s/files/1/0968/4595/5385/files/download-Photoroom.png?v=1765878153"
              alt="X"
            />
          </a>
          <a href="https://www.youtube.com/@Sycomp" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
            <img
              src="https://cdn.shopify.com/s/files/1/0968/4595/5385/files/download_2_-Photoroom.png?v=1765878153"
              alt="YouTube"
            />
          </a>
          <a href="https://www.linkedin.com/company/sycomp/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <img
              src="https://cdn.shopify.com/s/files/1/0968/4595/5385/files/1fdbd88fec469fc342cdff7ea25b8bd8-Photoroom.png?v=1765878153"
              alt="LinkedIn"
            />
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Sycomp A Technology Company, Inc. All rights reserved.</p>

        <div className="footer-legal">
          <a href="https://sycomp.com/termsandconditions/" target="_blank" rel="noopener noreferrer">Terms and conditions</a>
          <a href="https://sycomp.com/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}

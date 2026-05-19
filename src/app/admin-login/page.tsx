"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestOTP, verifyOTP } from "@/lib/actions/auth";
import { Footer } from "@/components/footer";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await requestOTP(email, "ADMIN");
      if (res.success) {
        setStep("OTP");
        setSuccessMsg(`Admin OTP sent successfully to ${email}`);
      } else {
        setError(res.error || "Failed to send OTP. Please check your admin email.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await verifyOTP(email, otp);
      if (res.success) {
        if (res.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/store");
        }
      } else {
        setError(res.error || "Invalid OTP. Please check and try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sycomp-login-page">
      {/* SCOPED CSS STYLES FOR THE SHOP-FRONT LOOK */}
      <style dangerouslySetInnerHTML={{ __html: `
        .sycomp-login-page {
          /* RESET / BASE */
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          font-family: Arial, Helvetica, sans-serif;
          background-color: #ffffff;
          color: rgb(0 0 0 / 0.81);
        }

        .sycomp-login-page * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        /* FONTS */
        @font-face {
            font-family: Inter;
            font-weight: 400;
            font-style: normal;
            font-display: swap;
            src: url("//store.sycomp.com/cdn/fonts/inter/inter_n4.b2a3f24c19b4de56e8871f609e73ca7f6d2e2bb9.woff2") format("woff2");
        }
        @font-face {
            font-family: Inter;
            font-weight: 700;
            font-style: normal;
            font-display: swap;
            src: url("//store.sycomp.com/cdn/fonts/inter/inter_n7.02711e6b374660cfc7915d1afc1c204e633421e4.woff2") format("woff2");
        }

        /* HEADER */
        .sycomp-login-page .password-header {
            position: sticky;
            top: 0;
            left: 0;
            width: 100%;
            background: #ffffff;
            padding: 16px 0;
            z-index: 999;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
        }

        .sycomp-login-page .password-header__inner {
            margin: 0 auto;
            padding: 0px 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .sycomp-login-page .password-header__logo {
            display: inline-block;
            line-height: 0;
        }

        .sycomp-login-page .password-header__logo img {
            max-width: 240px;
            max-height: 100px;
            width: auto;
            height: auto;
            object-fit: contain;
            display: block;
        }

        .sycomp-login-page .password-header__support {
            display: flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
            color: #0b2a4a;
            font-size: 16px;
            font-weight: 600;
            font-family: "Plus Jakarta Sans", sans-serif;
        }

        .sycomp-login-page .password-header__support:hover {
            opacity: 0.8;
        }

        .sycomp-login-page .support-icon {
            width: 22px;
            height: 22px;
        }

        /* MAIN / BACKGROUND COMING SOON */
        .sycomp-login-page .coming-soon-wrapper {
            position: relative;
            min-height: 79vh;
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            overflow: hidden;
            padding: 40px 20px;
        }

        .sycomp-login-page .coming-soon-wrapper::before {
            content: "";
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.3);
            z-index: 1;
        }

        .sycomp-login-page .coming-soon-wrapper > *:not(.background-video) {
            position: relative;
            z-index: 2;
        }

        .sycomp-login-page .background-video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: 0;
        }

        .sycomp-login-page .coming-soon-wrapper p {
            font-size: 20px;
            padding-bottom: 18px;
            font-weight: 700;
            color: white;
            font-family: "Plus Jakarta Sans", sans-serif;
        }

        /* FORM */
        .sycomp-login-page .password-form {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .sycomp-login-page .password-inline {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .sycomp-login-page .password-input {
            width: 280px;
            padding: 14px 16px;
            font-size: 16px;
            border: 1px solid #ccc;
            border-radius: 8px;
            outline: none;
            background: #ffffff;
            color: #333333;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .sycomp-login-page .password-input:focus {
            border-color: #000;
        }

        .sycomp-login-page .password-button {
            padding: 14px 24px;
            font-size: 16px;
            background: #000;
            color: #fff;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            transition: opacity 0.2s ease;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .sycomp-login-page .password-button:hover {
            opacity: 0.9;
        }

        .sycomp-login-page .password-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        /* ALERTS / ERRORS */
        .sycomp-login-page .password-error {
            margin-top: 14px;
            color: #ff3b30;
            background: rgba(255, 255, 255, 0.95);
            padding: 10px 20px;
            border-radius: 8px;
            border-left: 4px solid #ff3b30;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            max-width: 400px;
        }

        .sycomp-login-page .password-success {
            margin-top: 14px;
            color: #34c759;
            background: rgba(255, 255, 255, 0.95);
            padding: 10px 20px;
            border-radius: 8px;
            border-left: 4px solid #34c759;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            max-width: 400px;
        }

        .sycomp-login-page .change-email-btn {
            background: none;
            border: none;
            color: #ffffff;
            text-decoration: underline;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            margin-top: 12px;
            font-family: "Plus Jakarta Sans", sans-serif;
            text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.8);
        }

        .sycomp-login-page .change-email-btn:hover {
            opacity: 0.8;
        }

        /* SITE FOOTER */
        .sycomp-login-page .site-footer {
            background-color: #1f4475;
            color: #ffffff;
            font-family: Arial, Helvetica, sans-serif;
            width: 100%;
        }

        .sycomp-login-page .footer-top {
            max-width: 1400px;
            width: 100%;
            margin: 0 auto;
            padding: 45px 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 40px;
            flex-wrap: wrap;
        }

        .sycomp-login-page .footer-logo img {
            height: 50px;
            width: auto;
        }

        .sycomp-login-page .footer-nav {
            display: flex;
            gap: 28px;
            flex-wrap: wrap;
        }

        .sycomp-login-page .footer-nav a {
            color: #ffffff;
            text-decoration: none;
            font-size: 15px;
            font-weight: 500;
            white-space: nowrap;
        }

        .sycomp-login-page .footer-nav a:hover {
            text-decoration: underline;
        }

        .sycomp-login-page .footer-social {
            display: flex;
            gap: 14px;
        }

        .sycomp-login-page .footer-social a {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .sycomp-login-page .footer-social img {
            width: 25px;
            height: 25px;
            object-fit: contain;
            display: block;
        }

        .sycomp-login-page .footer-bottom {
            border-top: 1px solid rgba(255, 255, 255, 0.25);
            padding: 15px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1400px;
            width: 100%;
            margin: 0 auto;
            font-size: 14px;
            flex-wrap: wrap;
            gap: 20px;
        }

        .sycomp-login-page .footer-legal {
            display: flex;
            gap: 25px;
        }

        .sycomp-login-page .footer-legal a {
            color: #ffffff;
            text-decoration: none;
        }

        .sycomp-login-page .footer-legal a:hover {
            text-decoration: underline;
        }

        /* RESPONSIVE LAYOUT */
        @media (max-width: 768px) {
            .sycomp-login-page .password-header {
                padding: 12px 0;
            }

            .sycomp-login-page .password-header__inner {
                padding: 0px 16px;
            }

            .sycomp-login-page .password-header__logo img {
                max-width: 120px;
                max-height: 38px;
            }

            .sycomp-login-page .password-header__support span {
                display: none;
            }

            .sycomp-login-page .password-inline {
                flex-direction: column;
                gap: 14px;
                width: 100%;
            }

            .sycomp-login-page .password-input,
            .sycomp-login-page .password-button {
                width: 100%;
                max-width: 320px;
            }

            .sycomp-login-page .footer-top {
                flex-direction: column;
                align-items: center;
                text-align: center;
                padding: 40px 20px 30px;
                gap: 30px;
            }

            .sycomp-login-page .footer-logo img {
                height: 42px;
            }

            .sycomp-login-page .footer-nav {
                flex-direction: column;
                gap: 18px;
            }

            .sycomp-login-page .footer-nav a {
                font-size: 16px;
            }

            .sycomp-login-page .footer-social {
                justify-content: center;
                gap: 16px;
                margin-top: 10px;
            }

            .sycomp-login-page .footer-bottom {
                flex-direction: column;
                text-align: center;
                padding: 25px 20px;
                gap: 18px;
            }

            .sycomp-login-page .footer-legal {
                justify-content: center;
                gap: 30px;
                flex-wrap: wrap;
            }
        }
      ` }} />

      {/* HEADER SECTION */}
      <header className="password-header">
        <div className="password-header__inner">
          <a href="/" className="password-header__logo">
            <img
              src="https://cdn.shopify.com/s/files/1/0968/4595/5385/files/sycomp-logo-full-color_no_tag.png?v=1765973489"
              alt="Sycomp"
            />
          </a>

          <a href="https://sycomp.com/customer-support/" className="password-header__support" target="_blank" rel="noopener noreferrer">
            <svg className="support-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
              <path d="M4 12a8 8 0 1 1 16 0v5a2 2 0 0 1-2 2h-1" stroke="currentColor" strokeWidth={2} strokeLinecap="round"></path>
              <path d="M6 12v3a2 2 0 0 0 2 2h1" stroke="currentColor" strokeWidth={2} strokeLinecap="round"></path>
              <path d="M9 20h6" stroke="currentColor" strokeWidth={2} strokeLinecap="round"></path>
            </svg>
            <span>Customer Support</span>
          </a>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main id="MainContent" className="password-main-content">
        <div className="coming-soon-wrapper">
          {/* Background image from the original design */}
          <img
            className="background-video"
            src="https://cdn.shopify.com/s/files/1/0968/4595/5385/files/Screenshot_2026-01-20_154847.png?v=1768904467"
            alt="Background"
          />

          {step === "EMAIL" ? (
            <>
              <p>Please enter your admin email to receive a login OTP code.</p>
              <form onSubmit={handleRequestOTP} className="password-form">
                <div className="password-inline">
                  <input
                    type="email"
                    className="password-input"
                    placeholder="Admin Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="password-button" disabled={loading}>
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </div>
                {error && <div className="password-error">{error}</div>}
              </form>
            </>
          ) : (
            <>
              <p>Please enter the 6-digit OTP code sent to your admin email.</p>
              <form onSubmit={handleVerifyOTP} className="password-form">
                <div className="password-inline">
                  <input
                    type="text"
                    className="password-input"
                    placeholder="6-Digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                  <button type="submit" className="password-button" disabled={loading}>
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
                {successMsg && <div className="password-success">{successMsg}</div>}
                {error && <div className="password-error">{error}</div>}
                
                <button
                  type="button"
                  className="change-email-btn"
                  onClick={() => {
                    setStep("EMAIL");
                    setOtp("");
                    setError("");
                    setSuccessMsg("");
                  }}
                >
                  Change Email
                </button>
              </form>
            </>
          )}
        </div>
      </main>

      {/* FOOTER SECTION */}
      <Footer />
    </div>
  );
}

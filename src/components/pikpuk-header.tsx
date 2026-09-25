import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { ArchiveButton } from "@/components/archive-button";
import { useAuth } from "@/lib/auth";

function authHref(mode: "signin" | "signup", redirect = "/") {
  const params = new URLSearchParams();
  if (mode === "signup") params.set("mode", "signup");
  if (redirect !== "/") params.set("redirect", redirect);
  const query = params.toString();
  return query ? `/auth?${query}` : "/auth";
}

function MenuAnchor({ href, label, subtext, onSelect, secondary = false }: { href: string; label: string; subtext?: string; onSelect: () => void; secondary?: boolean }) {
  return (
    <a className={`menu-link ${secondary ? "menu-link-secondary" : ""}`} href={href} onClick={onSelect}>
      <span>{label}</span>
      {subtext ? <small>{subtext}</small> : null}
    </a>
  );
}

function MenuButton({ label, subtext, onClick }: { label: string; subtext?: string; onClick: () => void }) {
  return (
    <ArchiveButton variant="menu" onClick={onClick}>
      <span>{label}</span>
      {subtext ? <small>{subtext}</small> : null}
    </ArchiveButton>
  );
}

export function PikPukHeader() {
  const navigate = useNavigate();
  const { user, isContributor, isLoading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [contributionPrompt, setContributionPrompt] = useState(false);
  const signedIn = Boolean(user);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    setContributionPrompt(false);
  };

  const openContribute = () => {
    if (signedIn) {
      window.location.href = "/contribute";
      return;
    }
    setContributionPrompt(true);
  };

  const handleSoundtrack = () => {
    if (signedIn) {
      window.location.href = "/settings";
      return;
    }
    window.location.href = authHref("signin", "/settings");
  };

  const handleSignOut = async () => {
    await signOut();
    closeMenu();
    void navigate({ to: "/auth", search: { mode: "signin", redirect: "/" }, replace: true });
  };

  return (
    <>
      <header className="archive-header">
        <Link className="wordmark" to="/" aria-label="PikPuk home">
          PikPuk
        </Link>
        <div className="header-actions">
          <ArchiveButton variant="icon" onClick={handleSoundtrack} aria-label="Soundtrack preferences" title="Soundtrack preferences">
            <span className="music-mark" aria-hidden="true">♫</span>
          </ArchiveButton>
          <ArchiveButton variant="icon" onClick={() => setOpen(true)} aria-expanded={open} aria-label="Open menu" title="Open menu">
            <Menu size={17} strokeWidth={1.5} />
          </ArchiveButton>
        </div>
      </header>

      {open && (
        <div className="pikpuk-menu" role="dialog" aria-modal="true" aria-label="PikPuk menu">
          <div className="menu-frame">
            <div className="menu-topline">
              <a className="menu-brand" href="/" onClick={closeMenu}>PIKPUK</a>
              <ArchiveButton variant="icon" onClick={closeMenu} aria-label="Close menu" title="Close menu">
                <X size={18} strokeWidth={1.5} />
              </ArchiveButton>
            </div>

            {contributionPrompt ? (
              <div className="menu-contribution-prompt">
                <p className="menu-section-label">Contribute</p>
                <h2>Add a piece of the past</h2>
                <p>
                  Share a photograph, memory, place detail, or source note. Accounts keep submissions connected to you while they are reviewed.
                </p>
                <div className="menu-inline-actions">
                  <a href={authHref("signin", "/contribute")} onClick={closeMenu}>Sign in</a>
                  <a href={authHref("signup", "/contribute")} onClick={closeMenu}>Create account</a>
                </div>
                <a className="menu-small-link" href="/contributor-guidelines" onClick={closeMenu}>Contributor Guidelines</a>
              </div>
            ) : (
              <>
                <nav className="menu-section" aria-label="Primary navigation">
                  <MenuAnchor href="/" label="Explore" onSelect={closeMenu} />
                  {signedIn && isContributor ? (
                    <MenuAnchor href="/contribute" label="Contribute" subtext="Your submissions" onSelect={closeMenu} />
                  ) : (
                    <MenuButton label="Contribute" onClick={openContribute} />
                  )}
                  <MenuAnchor href="/about" label="About" onSelect={closeMenu} />
                </nav>

                <div className="menu-divider" />

                {signedIn ? (
                  <nav className="menu-section" aria-label="Your PikPuk">
                    <p className="menu-section-label">Your PikPuk</p>
                    <MenuAnchor href="/interests" label="Interests" onSelect={closeMenu} />
                    <MenuAnchor href="/settings" label="Settings" onSelect={closeMenu} />
                    <MenuAnchor href="/account" label="Account" onSelect={closeMenu} />
                  </nav>
                ) : (
                  <nav className="menu-section" aria-label="Account access">
                    <MenuAnchor href={authHref("signin")} label="Sign in" onSelect={closeMenu} />
                    <MenuAnchor href={authHref("signup")} label="Create account" onSelect={closeMenu} secondary />
                  </nav>
                )}

                <div className="menu-divider" />

                <nav className="menu-section menu-section-small" aria-label="Support navigation">
                  <MenuAnchor href="/help" label="Help" onSelect={closeMenu} />
                  <MenuAnchor href="/contributor-guidelines" label="Contributor Guidelines" onSelect={closeMenu} />
                  <MenuAnchor href="/contact" label="Contact" onSelect={closeMenu} />
                </nav>

                {signedIn ? <div className="menu-divider" /> : null}

                <footer className="menu-footer">
                  <div className="menu-legal">
                    <a href="/privacy" onClick={closeMenu}>Privacy</a>
                    <span aria-hidden="true">·</span>
                    <a href="/terms" onClick={closeMenu}>Terms</a>
                    <span aria-hidden="true">·</span>
                    <a href="/rights" onClick={closeMenu}>Rights</a>
                  </div>
                  {signedIn ? (
                    <ArchiveButton variant="menu" className="menu-sign-out" onClick={handleSignOut}>
                      Sign out
                    </ArchiveButton>
                  ) : null}
                  <p>© PikPuk</p>
                </footer>
              </>
            )}

            {isLoading ? <span className="menu-auth-status">Checking account…</span> : null}
          </div>
        </div>
      )}
    </>
  );
}

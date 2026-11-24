import type { CSSProperties } from "react";

interface HomeSectionHeadingProps {
  title?: string;
  subtitle?: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
  textColor?: string;
  className?: string;
}

/** Shared editorial heading treatment for homepage content sections. */
export default function HomeSectionHeading({
  title,
  subtitle,
  showTitle = true,
  showSubtitle = true,
  textColor = "#4A2C2E",
  className = "",
}: HomeSectionHeadingProps) {
  if ((!showTitle || !title) && (!showSubtitle || !subtitle)) return null;

  const headingStyle: CSSProperties = { color: textColor };

  return (
    <header className={`home-section-heading mx-auto mb-8 max-w-4xl px-4 text-center md:mb-12 ${className}`}>
      {showTitle && title && (
        <>
          <p className="home-section-heading__eyebrow">GET CELEBRATION-READY</p>
          <h2 className="home-section-heading__title text-balance" style={headingStyle}>
            {title}
          </h2>
          <div className="home-section-heading__ornament" aria-hidden="true">
            <span />
            <i />
            <b />
            <i />
            <span />
          </div>
        </>
      )}

      {showSubtitle && subtitle && (
        <p className="home-section-heading__subtitle mx-auto text-balance" style={headingStyle}>
          {subtitle}
        </p>
      )}
    </header>
  );
}

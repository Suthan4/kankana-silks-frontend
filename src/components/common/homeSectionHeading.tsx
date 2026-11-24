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
  className = "",
}: HomeSectionHeadingProps) {
  if ((!showTitle || !title) && (!showSubtitle || !subtitle)) return null;

  return (
    <header className={`home-section-heading mx-auto mb-8 max-w-4xl px-4 text-center md:mb-12 ${className}`}>
      {showSubtitle && subtitle && (
        <p className="home-section-heading__eyebrow mx-auto text-balance">
          {subtitle}
        </p>
      )}

      {showTitle && title && (
        <>
          <h2 className="home-section-heading__title text-balance">
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
    </header>
  );
}

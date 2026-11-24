interface HomeSectionHeadingProps {
  title?: string;
  subtitle?: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
  textColor?: string;
  className?: string;
}

/** Shared minimal heading treatment for homepage content sections. */
export default function HomeSectionHeading({
  title,
  subtitle,
  showTitle = true,
  showSubtitle = true,
  className = "",
}: HomeSectionHeadingProps) {
  if ((!showTitle || !title) && (!showSubtitle || !subtitle)) return null;

  return (
    <header className={`home-section-heading mx-auto w-full px-4 text-center ${className}`}>
      {showSubtitle && subtitle && (
        <p className="home-section-heading__eyebrow mx-auto">
          {subtitle}
        </p>
      )}

      {showTitle && title && (
        <h2 className="home-section-heading__title">
          {title}
        </h2>
      )}
    </header>
  );
}

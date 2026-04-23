/**
 * Renders an ISO date string as a localised, human-friendly date.
 * Server Component — uses the server's locale (en-GB) so the output is
 * deterministic between SSR and hydration.
 */
type FormattedDateProps = {
  date?: string;
  className?: string;
};

export default function FormattedDate({ date, className }: FormattedDateProps) {
  if (!date) return null;

  const parsed = new Date(date);
  const formatted = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);

  return (
    <time dateTime={parsed.toISOString()} className={className}>
      {formatted}
    </time>
  );
}

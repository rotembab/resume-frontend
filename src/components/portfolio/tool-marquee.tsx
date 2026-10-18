/**
 * A decorative ribbon of technologies. The Tools section below carries the
 * same names accessibly, so this copy is hidden from assistive technology.
 */
export const ToolMarquee = ({ names }: { names: string[] }) => {
  if (!names.length) return null;
  const row = (copy: number) => (
    <ul className='marquee-row' key={copy}>
      {names.map((name) => (
        <li key={name}>{name}</li>
      ))}
    </ul>
  );
  return (
    <div className='tool-marquee' aria-hidden='true'>
      <div className='marquee-track'>{[0, 1].map(row)}</div>
    </div>
  );
};

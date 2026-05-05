type Props = {
  name: string
  redChar?: string
  className?: string
}

export default function ItemName({ name, redChar, className = '' }: Props) {
  if (!redChar || !name.includes(redChar)) {
    return <span className={className}>{name}</span>
  }
  const parts = name.split(redChar)
  return (
    <span className={className}>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className="text-red-500 font-bold">{redChar}</span>
          )}
        </span>
      ))}
    </span>
  )
}

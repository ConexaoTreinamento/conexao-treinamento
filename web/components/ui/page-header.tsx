interface IPageHeaderProps {
  title: string
  description?: string
}

export function PageHeader({ title, description }: IPageHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold">{title}</h1>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

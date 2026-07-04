import { StudioIcon } from './shared'

export function EmptyFeaturePage({ title, icon }: { title: string; icon: string }) {
  return (
    <section className="studio-section empty-feature">
      <StudioIcon name={icon} />
      <h2>{title}</h2>
      <p>0 records</p>
    </section>
  )
}

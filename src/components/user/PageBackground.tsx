export function PageBackground() {
  return (
    <div className="page-bg" aria-hidden="true">
      <div className="page-bg-image" />
      <div className="page-bg-gradient" />
      <div className="page-bg-orb w-[500px] h-[500px] bg-green-300 -top-32 -right-32" />
      <div className="page-bg-orb w-[400px] h-[400px] bg-emerald-200 bottom-20 -left-32" />
      <div className="page-bg-orb w-[300px] h-[300px] bg-lime-200 top-1/2 right-1/4 opacity-20" />
    </div>
  )
}

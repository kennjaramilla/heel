export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-accent/60 blur-3xl"
      />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}

import clsx from "clsx";

export function CalcButton({ className, ...props}: React.HTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={clsx('border', className)} {...props} />
}
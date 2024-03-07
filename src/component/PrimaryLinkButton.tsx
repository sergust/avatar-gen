import clsx from "clsx";
import Link, { type LinkProps } from "next/link";
import { type ReactNode } from "react";

export function PrimaryLinkButton(
  props: LinkProps & { children: ReactNode; className?: string },
) {
  const { className, ...propsWithoutClassName } = props;
  return (
    <Link
      {...propsWithoutClassName}
      className={clsx(
        "box-border rounded-xl border-2 bg-blue-900 px-4 py-2 text-gray-100 transition-colors hover:bg-blue-700 hover:text-cyan-500 dark:bg-blue-300 dark:hover:bg-blue-200",
        className ?? "",
      )}
    >
      {props.children}
    </Link>
  );
}

import clsx from "clsx";

export function Button(
  props: React.ComponentPropsWithoutRef<"button"> & {
    variant?: "primary" | "secondary";
  },
) {
  const color =
    (props.variant ?? "primary") === "primary"
      ? "text-gray-100 bg-blue-900 hover:bg-blue-700 dark:bg-blue-300 dark:hover:bg-blue-200"
      : "text-gray-100 bg-gray-900 hover:bg-gray-700 dark:bg-gray-900 dark:hover:bg-gray-600";

  return (
    <button
      {...props}
      className={clsx(
        "box-border rounded-xl border-2 px-4 py-2 transition-colors disabled:bg-gray-500",
        color,
      )}
    >
      {props.children}
    </button>
  );
}

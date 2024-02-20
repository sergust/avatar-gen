export function Button(props: React.ComponentPropsWithoutRef<"button">) {
  return (
    <button
      {...props}
      className="box-border rounded-xl border-2 bg-blue-900 px-4 py-2 text-gray-100 dark:bg-blue-300 dark:text-gray-900"
    >
      {props.children}
    </button>
  );
}

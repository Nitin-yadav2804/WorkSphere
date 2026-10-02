import Spinner from "./Spinner";

export default function AsyncButton({
  busy,
  busyLabel,
  children,
  spinnerProps,
  ...props
}) {
  return (
    <button {...props}>
      {busy && <Spinner {...spinnerProps} />}
      {busy ? busyLabel : children}
    </button>
  );
}

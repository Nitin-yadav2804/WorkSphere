export default function FieldError({ error, className }) {
  return error ? <p className={className}>{error.message}</p> : null;
}

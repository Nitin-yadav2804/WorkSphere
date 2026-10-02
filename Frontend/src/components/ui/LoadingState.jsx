// The surrounding page owns its layout; this also works inside tables and cards.
export default function LoadingState({ as: Tag = "p", children, ...props }) {
  return <Tag {...props}>{children}</Tag>;
}

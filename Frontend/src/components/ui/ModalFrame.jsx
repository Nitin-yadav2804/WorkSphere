// Keep dismissal policy at the call site: some dialogs close on the backdrop,
// while others deliberately remain open or block dismissal during submission.
export default function ModalFrame({ overlayProps, panelProps, children }) {
  return (
    <div {...overlayProps}>
      <div {...panelProps}>{children}</div>
    </div>
  );
}

import type { ReactElement } from 'react';

type UiInputPreviewProps = {
  label: string;
  placeholder: string;
};

/**
 * Shows static input style preview without form behavior.
 */
export function UiInputPreview({
  label,
  placeholder,
}: UiInputPreviewProps): ReactElement {
  return (
    <div className="ui-input-preview">
      <span>{label}</span>
      <input type="text" placeholder={placeholder} readOnly />
    </div>
  );
}

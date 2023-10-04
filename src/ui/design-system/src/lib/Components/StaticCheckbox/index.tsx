import CheckboxChecked from "../../../../images/toggles/checkbox-checked.svg"
import CheckboxUnchecked from "../../../../images/toggles/checkbox-unchecked.svg"

export type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  asInternalChecklist?: boolean
}

export function StaticCheckbox({
  checked,
  asInternalChecklist,
  ...props
}: InputProps) {
  return (
    <div className={asInternalChecklist ? "absolute left-0" : ""}>
      {checked ? <CheckboxChecked /> : <CheckboxUnchecked />}
      <input checked={checked} {...props} className="invisible" />
    </div>
  )
}

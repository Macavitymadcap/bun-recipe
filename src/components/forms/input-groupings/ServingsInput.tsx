interface ServingsInputProps {
  value?: string;
}

export const ServingsInput = ({ value }: ServingsInputProps) => {
  return (
    <div className="form-group col-6">
      <label htmlFor="servings">Servings</label>
      <input
        type="text"
        id="servings"
        name="servings"
        placeholder="e.g., 4-6"
        required
        value={value ?? ""}
      />
      <span className="text-danger text-sm"></span>
    </div>
  );
};

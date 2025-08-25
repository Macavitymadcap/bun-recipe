interface CookingTimeFormGroupProps {
  value?: string;
}

export const CookingTimeFormGroup = ({ value }: CookingTimeFormGroupProps) => {
  return (
    <div className="form-group col-6">
      <label htmlFor="cook-time">Cooking Time</label>
      <input
        type="text"
        id="cook-time"
        name="cooking_time"
        placeholder="e.g., 1 hour"
        value={value ?? ""}
      />
      <span className="text-danger text-sm"></span>
    </div>
  );
};

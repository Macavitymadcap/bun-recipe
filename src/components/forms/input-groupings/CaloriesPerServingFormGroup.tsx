interface CaloriesPerServingFormGroupProps {
  value?: number;
}

export const CaloriesPerServingFormGroup = ({
  value,
}: CaloriesPerServingFormGroupProps) => {
  return (
    <div className="form-group col-6">
      <label htmlFor="calories">Calories per serving</label>
      <input
        type="number"
        id="calories"
        name="calories_per_serving"
        placeholder="Optional (kcal)"
        value={value ?? ""}
      />
      <span className="text-danger text-sm"></span>
    </div>
  );
};

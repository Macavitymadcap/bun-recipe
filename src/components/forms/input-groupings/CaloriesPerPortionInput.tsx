interface CaloriesPerPortionInputProps {
  value?: number;
}

export const CaloriesPerPortionInput = ({
  value,
}: CaloriesPerPortionInputProps) => {
  return (
    <div className="form-group col-6">
      <label htmlFor="calories">Calories per Portion</label>
      <input
        type="number"
        id="calories"
        name="calories_per_portion"
        placeholder="Optional"
        value={value ?? ""}
      />
      <span className="text-danger text-sm"></span>
    </div>
  );
};

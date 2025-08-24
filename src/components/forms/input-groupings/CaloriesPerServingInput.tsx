interface CaloriesPerServingInputProps {
  value?: number;
}

export const CaloriesPerServingInput = ({
  value,
}: CaloriesPerServingInputProps) => {
  return (
    <div className="form-group col-6">
      <label htmlFor="calories">Calories per serving</label>
      <input
        type="number"
        id="calories"
        name="calories_per_serving"
        placeholder="Optional"
        value={value ?? ""}
      />
      <span className="text-danger text-sm"></span>
    </div>
  );
};

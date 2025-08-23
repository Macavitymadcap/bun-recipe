interface PreperationTimeInputProps {
  value?: string;
}

export const PreperationTimeInput = ({ value }: PreperationTimeInputProps) => {
  return (
    <div className="form-group col-6">
      <label htmlFor="prep-time">Preparation Time</label>
      <input
        type="text"
        id="prep-time"
        name="preparation_time"
        placeholder="e.g., 30 minutes"
        value={value ?? ""}
      />
      <span className="text-danger text-sm"></span>
    </div>
  );
};

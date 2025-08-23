interface RecipeNameInputProps {
  value?: string;
}

export const RecipeNameInput = ({ value }: RecipeNameInputProps) => {
  return (
    <div className="form-group col-12">
      <label htmlFor="name">Recipe Name</label>
      <input
        type="text"
        id="name"
        name="name"
        placeholder="Recipe name"
        required
        value={value ?? ""}
      />
      <span className="text-danger text-sm"></span>
    </div>
  );
};

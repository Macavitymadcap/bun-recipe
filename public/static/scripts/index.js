function recipeForm() {
  return {
    ingredients: [{ id: Date.now(), quantity: "", unit: "", name: "" }],
    methodSteps: [{ id: Date.now() + 1, instruction: "" }],
    cooksNotes: [],

    addIngredient() {
      this.ingredients.push({
        id: Date.now(),
        quantity: "",
        unit: "",
        name: "",
      });
    },

    removeIngredient(index) {
      if (this.ingredients.length > 1) {
        this.ingredients.splice(index, 1);
      }
    },

    addMethodStep() {
      this.methodSteps.push({
        id: Date.now(),
        instruction: "",
      });
    },

    removeMethodStep(index) {
      if (this.methodSteps.length > 1) {
        this.methodSteps.splice(index, 1);
      }
    },

    addCooksNote() {
      this.cooksNotes.push({
        id: Date.now(),
        note: "",
      });
    },

    removeCooksNote(index) {
      this.cooksNotes.splice(index, 1);
    },
  };
}

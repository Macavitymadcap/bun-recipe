// Create src/components/FullPageRecipe.tsx
import { CompleteRecipe } from "../database/services/recipe-service";

interface FullPageRecipeProps extends CompleteRecipe {}

export const FullPageRecipe = ({
  id,
  name,
  servings,
  calories_per_serving,
  preparation_time,
  cooking_time,
  ingredients,
  methodSteps,
  cooksNotes,
  tags,
}: FullPageRecipeProps) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${name} - Recipe</title>
      <link rel="stylesheet" href="/static/styles/index.css">
      <script src="//unpkg.com/alpinejs" defer></script>
    </head>
    <body>
      <header class="container">
        <div class="grid">
          <div class="col-2">
            <button onclick="window.close()" class="btn btn-outline-secondary">
              Close Window
            </button>
          </div>
          <div class="col-8">
            <h1 class="text-center">${name}</h1>
          </div>
          <div class="col-2">
            <button onclick="window.print()" class="btn btn-outline-primary">
              Print Recipe
            </button>
          </div>
        </div>
      </header>

      <main class="container">
        <article class="card">
          <!-- Recipe Basic Info -->
          <div class="card-body">
            <div class="grid">
              <div class="col-6">
                <strong>Servings:</strong> ${servings}
              </div>
              ${calories_per_serving ? `
                <div class="col-6">
                  <strong>Calories per Serving:</strong> ${calories_per_serving}
                </div>
              ` : ''}
              ${preparation_time ? `
                <div class="col-6">
                  <strong>Prep time:</strong> ${preparation_time}
                </div>
              ` : ''}
              ${cooking_time ? `
                <div class="col-6">
                  <strong>Cook time:</strong> ${cooking_time}
                </div>
              ` : ''}
            </div>

            <!-- Tags -->
            ${tags.length > 0 ? `
              <div class="mt-3">
                ${tags.map(tag => `<span class="badge badge-high ml-1">${tag}</span>`).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Ingredients Section -->
          <details class="mt-3" open>
            <summary>
              <strong>Ingredients (${ingredients.length})</strong>
            </summary>
            <div class="content">
              <ul>
                ${ingredients
                  .sort((a, b) => a.order_index - b.order_index)
                  .map(ingredient => `
                    <li>
                      ${ingredient.quantity}${ingredient.unit ? ` ${ingredient.unit}` : ''} ${ingredient.name}
                    </li>
                  `).join('')}
              </ul>
            </div>
          </details>

          <!-- Method Section -->
          <details class="mt-3" open>
            <summary>
              <strong>Method (${methodSteps.length} steps)</strong>
            </summary>
            <div class="content">
              <ol>
                ${methodSteps
                  .sort((a, b) => a.order_index - b.order_index)
                  .map(step => `
                    <li class="mb-2">
                      ${step.instruction}
                    </li>
                  `).join('')}
              </ol>
            </div>
          </details>

          <!-- Cook's Notes Section -->
          ${cooksNotes.length > 0 ? `
            <details class="mt-3" open>
              <summary>
                <strong>Cook's Notes (${cooksNotes.length})</strong>
              </summary>
              <div class="content">
                <ul>
                  ${cooksNotes.map(note => `
                    <li class="mb-1">
                      ${note}
                    </li>
                  `).join('')}
                </ul>
              </div>
            </details>
          ` : ''}
        </article>
      </main>

      <footer class="container">
        <p class="text-center">&copy; 2025 Dan & Stella's Recipes</p>
      </footer>
    </body>
    </html>
  `;
};
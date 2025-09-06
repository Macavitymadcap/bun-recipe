
// Updated src/components/DefaultContent.tsx

import { RecipeStatistics } from "../database/services/recipe-service";
import { AddIcon } from "./icons/AddIcon";
import { CloseIcon } from "./icons/CloseIcon";
import { ConvertIcon } from "./icons/ConvertIcon";
import { DeleteIcon } from "./icons/DeleteIcon";
import { DownloadIcon } from "./icons/DownloadIcon";
import { MaximiseIcon } from "./icons/MaximiseIcon";
import { RefreshIcon } from "./icons/RefreshIcon";
import { SearchIcon } from "./icons/SearchIcon";
import { ShoppingListIcon } from "./icons/ShoppingListIcon";
import { UpdateIcon } from "./icons/UpdateIcon";
import { UploadIcon } from "./icons/UploadIcon";

interface DefaultContentProps {
  statistics: RecipeStatistics;
}

export const DefaultContent = ({ statistics }: DefaultContentProps) => {
  return (
    <>
        <article className="card">
          <h2 className="card-header">Recipe Stats</h2>
          <div className="card-body text-center grid">
            <div className="col-6">
              <p>
                Total Recipes:&nbsp;
                <b className="text-primary">{statistics.totalRecipes}</b>
              </p>
            </div>
            <div className="col-6">
              <p>
                Unique Tags:&nbsp;
                <b className="text-secondary">{statistics.tagStatistics.length}</b>
              </p>
            </div>
          </div>
        </article>
          
        {statistics.tagStatistics.length > 0 && (
          <article className="card">
            <h3 className="card-header">
              Popular Tags
            </h3>
            <div className="card-body">
              <div className="wrapped-row">
                {statistics!.tagStatistics
                  .filter(tag => tag.count > 0)
                  .slice(0, 20) // Show top 20 tags
                  .map((tag, index) => (
                    <span key={index} className="badge badge-high mr-2 mb-1">
                      {tag.name} ({tag.count})
                    </span>
                  ))}
              </div>
              {statistics.tagStatistics.filter(tag => tag.count === 0).length > 0 && (
                <>
                  <h4 className="mt-3">Unused Tags:</h4>
                  <div className="wrapped-row">
                    {statistics.tagStatistics
                      .filter(tag => tag.count === 0)
                      .map((tag, index) => (
                        <span key={index} className="badge badge-low mr-2 mb-1">
                          {tag.name} (0)
                        </span>
                      ))}
                  </div>
                </>
              )}
            </div>
          </article>
        )}

      <article className="card">
        <h3 className="card-header">Icons & Actions</h3>
        <ul className="unstyled">
          <li>
            <button className="btn btn-icon btn-outline-success">
              <AddIcon />
            </button>
            &nbsp;
            <b>Create:</b> Opens a form to create a new recipe.
          </li>

          <li>
            <button className="btn btn-icon btn-outline-primary">
              <SearchIcon />
            </button>
            &nbsp;
            <b>Search:</b> Opens a dialog to search for existing recipes.
          </li>

          <li>
            <button className="btn btn-icon btn-outline-warning">
              <RefreshIcon />
            </button>
            &nbsp;
            <b>Refresh:</b> Reloads the current content.
          </li>

          <li>
            <button className="btn btn-icon btn-outline-primary">
              <DownloadIcon />
            </button>
            &nbsp;
            <b>Download:</b> Downloads recipe data as a JSON file backup.
          </li>

          <li>
            <button className="btn btn-icon btn-outline-secondary">
              <UploadIcon />
            </button>
            &nbsp;
            <b>Upload:</b> Opens a dialog to upload recipes from a JSON file backup.
          </li>

          <li>
            <button className="btn btn-icon btn-outline-secondary">
              <ConvertIcon />
            </button>
            &nbsp;
            <b>Convert:</b> Opens a popover to convert between different units.
          </li>

          <li>
            <button className="btn btn-icon btn-outline-warning">
              <ShoppingListIcon />
            </button>
            &nbsp;
            <b>Shopping List:</b> View and manage your shopping list, or add recipe ingredients to it.
          </li>

          <li>
            <button className="btn btn-icon btn-outline-primary">
              <MaximiseIcon />
            </button>
            &nbsp;
            <b>Maximise:</b> Expands the current recipe card to full content size.
          </li>

          <li>
            <button className="btn btn-icon btn-outline-secondary">
              <UpdateIcon />
            </button>
            &nbsp;
            <b>Update:</b> Expand the current recipe into a full size update form.
          </li>

          <li>
            <button className="btn btn-icon btn-outline-danger">
              <DeleteIcon />
            </button>
            &nbsp;
            <b>Delete:</b> deletes the current recipe card or removes an item from a list (like ingredients, directions and cooks notes).
          </li>

          <li>
            <button className="btn btn-icon btn-outline-danger">
              <CloseIcon />
            </button>
            &nbsp;
            <b>Close:</b> Closes the current recipe card or dialog.
          </li>
        </ul>
      </article>
    </>
  );
};
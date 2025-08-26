import { AddIcon } from "./icons/AddIcon";
import { CloseIcon } from "./icons/CloseIcon";
import { ConvertIcon } from "./icons/ConvertIcon";
import { DeleteIcon } from "./icons/DeleteIcon";
import { DownloadIcon } from "./icons/DownloadIcon";
import { MaximiseIcon } from "./icons/MaximiseIcon";
import { RefreshIcon } from "./icons/RefreshIcon";
import { SearchIcon } from "./icons/SearchIcon";

export const DefaultContent = () => {
  return (
    <>
      <p>This app handles actions with the following icons:</p>
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
          <b>JSON:</b> Downloads recipe data as a JSON.
        </li>
        <li>
          <button className="btn btn-icon btn-outline-secondary">
            <ConvertIcon />
          </button>
          &nbsp;
          <b>Convert:</b> Opens a popover to convert between different units.
        </li>
        <li>
          <button className="btn btn-icon btn-outline-primary">
            <MaximiseIcon />
          </button>
          &nbsp;
          <b>Maximise:</b> Expands the current recipe card to full content size.
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
    </>
  );
};

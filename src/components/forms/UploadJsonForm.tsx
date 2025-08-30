import { CloseIcon } from "../icons/CloseIcon";

export const UploadJsonForm = () => {
  const hxOnUploadSubmitted = {
    "hx-on:htmx:after-request":
      "this.reset(); htmx.find('dialog').close(); htmx.removeClass('dialog', 'card-outline-secondary')",
  };

  return (
    <form
      id="upload-json-form"
      hx-post="/data/upload"
      hx-target="#main-content"
      hx-swap="innerHTML"
      hx-encoding="multipart/form-data"
      method="dialog"
      {...hxOnUploadSubmitted}
    >
      <div className="card-header grid">
        <span className="col-1"></span>
        <h2 className="text-center col-10">Upload JSON</h2>

        <button
          title="Cancel Upload"
          type="button"
          className="btn btn-icon btn-outline-danger col-1 col-push-right"
          x-on:click="htmx.removeClass('dialog', 'card-outline-secondary'); htmx.find('dialog').close();"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="card-body">
        <div className="form-group">
          <label htmlFor="json-file">Select JSON File</label>
          <input
            type="file"
            id="json-file"
            name="jsonFile"
            accept=".json,application/json"
            required
          />
          <small className="text-surface-low">
            Upload a JSON file containing recipe data exported from this application.
          </small>
        </div>

        <div className="form-group">
          <label>
            Overwrite existing recipes with same names
            <input
              type="checkbox"
              name="overwriteExisting"
              value="true"
              class="switch switch-secondary"
            />
          </label>
          <small className="text-surface-low">
            If unchecked, recipes with duplicate names will be skipped.
          </small>
        </div>
      </div>

      <div className="card-footer wrapped-row">
        <button type="submit" className="btn btn-outline-secondary">
          Upload Recipes
        </button>

        <button
          className="btn btn-outline-warning"
          type="reset"
          title="Reset Form"
        >
          Reset
        </button>
      </div>
    </form>
  );
};
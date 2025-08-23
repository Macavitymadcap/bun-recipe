import { DeleteIcon } from "../../icons/DeleteIcon";

interface CooksNotesFieldsetProps {
  isUpdateForm: boolean;
}

export const CooksNotesFieldset = ({
  isUpdateForm,
}: CooksNotesFieldsetProps) => {
  return (
    <fieldset className={isUpdateForm ? "secondary" : "success"}>
      <legend>Cook's Notes (Optional)</legend>
      <ul id="notes-list" x-show="cooksNotes.length > 0">
        <template x-for="(note, index) in cooksNotes" x-bind:key="index">
          <li x-data="{ note }" className="mb-3">
            <div className="grid">
              <div className="form-group col-11">
                {isUpdateForm ? (
                  <>
                    <label x-bind:for="`cooksNotes[${index}]`">Note</label>
                    <textarea
                      x-bind:id="`cooks-note-${index}`"
                      x-bind:name="`cooksNotes[${index}]`"
                      x-model="cooksNotes[index]"
                      placeholder="Tips, substitutions, or additional information..."
                      rows={2}
                    ></textarea>
                  </>
                ) : (
                  <>
                    <label x-bind:for="'note-' + index">Note</label>
                    <textarea
                      x-bind:id="'note-' + index"
                      x-bind:name="'cooksNotes[' + index + '][note]'"
                      x-model="note.note"
                      placeholder="Tips, substitutions, or additional information..."
                      rows={2}
                    ></textarea>
                  </>
                )}
              </div>

              <div className="form-group col-1">
                <label>&nbsp;</label>
                <button
                  type="button"
                  className="btn btn-icon btn-outline-danger"
                  title="Remove note"
                  x-on:click="removeCooksNote(index)"
                >
                <DeleteIcon />
                </button>
              </div>
            </div>
          </li>
        </template>
      </ul>

      <div
        x-show="cooksNotes.length === 0"
        className="text-center text-surface-low mb-3"
      >
        <em>No notes added yet. Click "Add Note" to get started.</em>
      </div>

      <div className="wrapped-row">
        <button
          type="button"
          className="btn btn-outline-success mt-3"
          x-on:click="addCooksNote()"
        >
          Add Note
        </button>
      </div>
    </fieldset>
  );
};

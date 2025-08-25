import { AddIcon } from "../../icons/AddIcon";
import { DeleteIcon } from "../../icons/DeleteIcon";

interface CooksNotesSectionProps {
  isUpdateForm: boolean;
}

export const CooksNotesSection = ({ isUpdateForm }: CooksNotesSectionProps) => {
  return (
    <section>
      <header className="grid">
        <h3 className="col-11">Cook's Notes</h3>
        <button
          type="button"
          title="Add Cook's Note"
          className="btn btn-icon btn-outline-success col1 col-push-right"
          x-on:click="addCooksNote()"
        >
          <AddIcon />
        </button>
      </header>

      <ul id="notes-list" className="unstyled" x-show="cooksNotes.length > 0">
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
        <em>No notes added yet. Click the add button above to get started.</em>
      </div>
    </section>
  );
};

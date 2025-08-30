import { AddIcon } from "../../icons/AddIcon";
import { DeleteIcon } from "../../icons/DeleteIcon";

interface DirectionsSectionProps {
  isUpdateForm: boolean;
}

export const DirectionsSection = ({
  isUpdateForm,
}: DirectionsSectionProps) => {
  return (
    <section>
      <h3>Directions</h3>

      <ol id="directions-list" className="unstyled" x-show="directions.length > 0">
        <template x-for="(step, index) in directions" x-bind:key="index">
          <li x-data="{ step }" className="mb-3">
            <div className="grid">
              <div className="form-group col-11">
                {isUpdateForm ? (
                  <>
                    <label x-bind:for="`direction-${index}`">
                      Step <span x-text="index + 1"></span>
                    </label>
                    <textarea
                      x-bind:id="`direction-${index}`"
                      x-bind:name="`directions[${index}][instruction]`"
                      x-model="step.instruction"
                      placeholder="Describe this step..."
                      rows={2}
                      required
                    ></textarea>
                  </>
                ) : (
                  <>
                    <label x-bind:for="'direction-' + index">
                      Step <span x-text="index + 1"></span>
                    </label>
                    <textarea
                      x-bind:id="'direction-' + index"
                      x-bind:name="'directions[' + index + '][instruction]'"
                      x-model="step.instruction"
                      placeholder="Describe what to do in this step..."
                      rows={2}
                      required
                    ></textarea>
                  </>
                )}
              </div>

              <div className="col-1">
                <button
                  type="button"
                  className="btn btn-icon btn-outline-danger"
                  title="Remove direction"
                  x-on:click="removeDirection(index)"
                  x-bind:disabled={
                    isUpdateForm ? "directions.length <= 1" : undefined
                  }
                >
                  <DeleteIcon />
                </button>
              </div>
            </div>
          </li>
        </template>
      </ol>

      <div
        x-show="directions.length === 0"
        className="text-center text-surface-low mb-3"
      >
        <em>No directions added yet. Click "Add " to get started.</em>
      </div>
      
      <div className="wrapped-row">
        <button
          type="button"
          className="btn btn-outline-success"
          x-on:click="addDirection()"
        >
          Add Direction
        </button>
      </div>
    </section>
  );
};

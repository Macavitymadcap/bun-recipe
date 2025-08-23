import { DeleteIcon } from "../../icons/DeleteIcon";

interface MethodStepsFieldsetProps {
  isUpdateForm: boolean;
}

export const MethodStepsFieldset = ({
  isUpdateForm,
}: MethodStepsFieldsetProps) => {
  return (
    <fieldset className={isUpdateForm ? "secondary" : "success"}>
      <legend>Method</legend>
      <ol id="method-list" x-show="methodSteps.length > 0">
        <template x-for="(step, index) in methodSteps" x-bind:key="index">
          <li x-data="{ step }" className="mb-3">
            <div className="grid">
              <div className="form-group col-11">
                {isUpdateForm ? (
                  <>
                    <label x-bind:for="`method-step-${index}`">
                      Step <span x-text="index + 1"></span>
                    </label>
                    <textarea
                      x-bind:id="`method-step-${index}`"
                      x-bind:name="`method[${index}][instruction]`"
                      x-model="step.instruction"
                      placeholder="Describe this step..."
                      rows={2}
                      required
                    ></textarea>
                  </>
                ) : (
                  <>
                    <label x-bind:for="'method-step-' + index">
                      Step <span x-text="index + 1"></span>
                    </label>
                    <textarea
                      x-bind:id="'method-step-' + index"
                      x-bind:name="'method[' + index + '][instruction]'"
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
                  title="Remove step"
                  x-on:click="removeMethodStep(index)"
                  x-bind:disabled="methodSteps.length <= 1"
                >
                <DeleteIcon />
                </button>
              </div>
            </div>
          </li>
        </template>
      </ol>

      <div
        x-show="methodSteps.length === 0"
        className="text-center text-surface-low mb-3"
      >
        <em>No method steps added yet. Click "Add Step" to get started.</em>
      </div>

      <div className="wrapped-row">
        <button
          type="button"
          className="btn btn-outline-success mt-3"
          x-on:click="addMethodStep()"
        >
          Add Step
        </button>
      </div>
    </fieldset>
  );
};

import { AddIcon } from "../../icons/AddIcon";
import { CloseIcon } from "../../icons/CloseIcon";
import { AvailableTagsDataList } from "../../AvailableTagsDatalist";
import { TagEntity } from "../../../database/repositories/tag-repository";

interface TagFormGroupProps {
  availbaleTags: TagEntity[];
}

export const TagFormGroup = ({availbaleTags}: TagFormGroupProps) => {
  const tagInput = {
    "x-on:keydown.enter.prevent": "addTag()",
  };

  return (
    <div className="form-group">
      <label htmlFor="tagAutocomplete">Tags (Optional)</label>

      <div x-show="tags.length > 0" className="mb-2 wrapped-row">
        <template x-for="(tag, index) in tags" x-bind:key="tag">
          <span
            className="badge badge-high mr-2 mb-1"
            style="display: inline-block;"
          >
            <span x-text="tag"></span>
            <button
              type="button"
              className="ml-1"
              x-on:click="removeTag(index)"
              title="Remove tag"
            >
              <CloseIcon width={12} height={12} />
            </button>
          </span>
        </template>
      </div>

      {/* Autocomplete Input */}
      <div className="grid">
        <input
          type="text"
          id="tagAutocomplete"
          name="tagAutoComplete"
          placeholder="Type to add tags..."
          list="inputTags"
          x-model="currentTagInput"
          {...tagInput}
          x-on:input="handleTagInput($event)"
          className="col-11"
        />

        <AvailableTagsDataList availableTags={availbaleTags} datalistId="inputTags" />

        {/* Hidden input for form submission */}
        <input
          type="hidden"
          id="tags"
          name="tags"
          x-bind:value="tags.join(',')"
        />

        <button
          type="button"
          className="btn btn-icon btn-outline-success col-1"
          x-on:click="addTag()"
        >
          <AddIcon />
        </button>
      </div>

      <span className="text-danger text-sm"></span>
    </div>
  );
};

import { TagEntity } from "../../../database/repositories/tag-repository";
import { AddIcon } from "../../icons/AddIcon";
import { CloseIcon } from "../../icons/CloseIcon";

interface TagsInputProps {
  availableTags: TagEntity[];
}

export const TagInput = ({ availableTags }: TagsInputProps) => {
  const tagInput = {
    "x-on:keydown.enter.prevent": "addTag()",
  };

  return (
    <div className="form-group">
      <label htmlFor="tagAutocomplete">Tags (Optional)</label>

      <div x-show="tags.length > 0" className="mb-2 wrapped-row">
        <template x-for="(tag, index) in tags" x-bind:key="tag">
          <span
            className="badge badge-primary mr-2 mb-1"
            style="display: inline-block;"
          >
            <span x-text="tag"></span>
            <button
              type="button"
              className="ml-1"
              style="background: none; border: none; color: inherit; cursor: pointer; font-size: 0.8em;"
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
          list="availableTags"
          x-model="currentTagInput"
          {...tagInput}
          x-on:input="handleTagInput($event)"
          className="col-11"
        />

        <datalist id="availableTags">
          {availableTags.map((tag, index) => (
            <option key={index} value={tag.name}>
              {tag.name}
            </option>
          ))}
        </datalist>

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

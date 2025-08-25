import { TagEntity } from "../database/repositories/tag-repository";

interface AvailableTagsDataListProps {
  availableTags: TagEntity[];
  datalistId: string;
}

export const AvailableTagsDataList = ({
  availableTags,
  datalistId
}: AvailableTagsDataListProps) => {
  return (
    <datalist id={datalistId}>
      {availableTags.map((tag, index) => (
        <option key={index} value={tag.name}>
          {tag.name}
        </option>
      ))}
    </datalist>
  );
};

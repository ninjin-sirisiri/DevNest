"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { FieldLabel } from "@/components/ui/field";
import { useLocale } from '@/app/contexts/index'

type Tag = {
  id: string;
  name: string;
};

interface TagSuggestionProps {
  allTags: Tag[];
}

export const TagSuggestion = ({ allTags }: TagSuggestionProps) => {
  const { locale } = useLocale()
  const { control, setValue, getValues } = useFormContext();

  const watchedTags = useWatch({
    control,
    name: "tags",
  });

  const getFilteredTags = () => {
    if (!watchedTags) {
      return allTags;
    }
    const lastTag = watchedTags.split(",").pop()?.trim();
    if (!lastTag) {
      return allTags;
    }
    return allTags.filter((tag) =>
      tag.name.toLowerCase().includes(lastTag.toLowerCase())
    );
  };

  const filteredTags = getFilteredTags();

  const handleTagClick = (tag: string) => {
    const currentTags: string = getValues("tags");
    let tagsArray: string[] = currentTags
      ? currentTags.split(",").map((t) => t.trim())
      : [];

    // 最後の要素を削除
    tagsArray.pop();

    // 新しいタグを追加
    tagsArray.push(tag);

    // 重複を削除
    tagsArray = tagsArray.filter(
      (t, index, self) => self.indexOf(t) === index && t !== " "
    );

    setValue("tags", `${tagsArray.join(", ")},`);
  };

  return (
    <div className="space-y-2">
      <FieldLabel>{locale("thread.create.tags.suggestion")}</FieldLabel>
      <div className="max-h-32 overflow-y-auto flex flex-wrap gap-2 border p-2 rounded-md">
        {filteredTags.map((tag) => (
          <Badge
            key={tag.id}
            onClick={() => handleTagClick(tag.name)}
            className="cursor-pointer"
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};

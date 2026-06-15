import { Text, View } from "@tarojs/components";
import type { Chapter } from "../../types/report";
import "./index.scss";

interface Props {
  chapters: Chapter[];
}

export function ChapterList({ chapters }: Props) {
  if (!chapters.length) return null;

  return (
    <View className="chapter-list">
      {chapters.map((chapter, index) => (
        <View className="card chapter-card" key={`${chapter.title}-${index}`}>
          <View className="chapter-head">
            <Text className="chapter-index">{String(index + 1).padStart(2, "0")}</Text>
            <Text className="chapter-title">
              {chapter.emoji ? `${chapter.emoji} ` : ""}
              {chapter.title}
            </Text>
          </View>
          <Text className="chapter-content">{chapter.content}</Text>
        </View>
      ))}
    </View>
  );
}

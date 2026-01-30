import type { FeedItem } from "@/types/feed";
import { isAcademy, isEvent } from "@/types/feed";
import { Link } from "expo-router";
import { Pressable } from "react-native";
import { AcademyCard } from "./AcademyCard";
import { EventCard } from "./EventCard";

type Props = { item: FeedItem };

export function FeedItemCard({ item }: Props) {
  if (isAcademy(item)) return <AcademyCard academy={item} />;
  if (isEvent(item)) {
    return (
      <Link href={`/(tabs)/book/confirm/${item.id}`} asChild>
        <Pressable>
          <EventCard event={item} />
        </Pressable>
      </Link>
    );
  }
  return null;
}

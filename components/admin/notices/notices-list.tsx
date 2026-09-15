import { Notice } from "@/types/notice";
import NoticeCard from "./notice-card";

type Props = {
  notices: Notice[];
  onEdit: (notice: Notice) => void;
  onDelete: (id: string) => void;
};

export default function NoticesList({ notices, onEdit, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {notices.map((notice) => (
        <NoticeCard
          key={notice.id}
          notice={notice}
          onEdit={() => onEdit(notice)}
          onDelete={() => onDelete(notice.id)}
        />
      ))}
    </div>
  );
}
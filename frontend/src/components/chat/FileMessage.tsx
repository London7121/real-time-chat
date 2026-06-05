import { Typography, Image } from "antd";
import {
  FileOutlined,
  FilePdfOutlined,
  FileZipOutlined,
  FileWordOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface FileInfo {
  url: string;
  name: string;
  type: string;
  size: number;
}

function getFileIcon(type: string) {
  if (type.includes("pdf")) return <FilePdfOutlined style={{ fontSize: 22 }} />;
  if (type.includes("zip") || type.includes("rar"))
    return <FileZipOutlined style={{ fontSize: 22 }} />;
  if (type.includes("word") || type.includes("doc"))
    return <FileWordOutlined style={{ fontSize: 22 }} />;
  if (type.includes("excel") || type.includes("sheet"))
    return <FileExcelOutlined style={{ fontSize: 22 }} />;
  return <FileOutlined style={{ fontSize: 22 }} />;
}

export default function FileMessage({
  file,
  isMe,
}: {
  file: FileInfo;
  isMe: boolean;
}) {
  const isImage = file.type.startsWith("image/");
  const sizeMB = (file.size / 1024 / 1024).toFixed(1);

  if (isImage) {
    return (
      <Image
        src={file.url}
        alt={file.name}
        style={{
          maxWidth: 220,
          maxHeight: 220,
          borderRadius: 8,
          display: "block",
          marginBottom: 4,
        }}
        preview={{ src: file.url }}
      />
    );
  }

  return (
    <a
      href={file.url}
      download={file.name}
      target="_blank"
      rel="noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        background: isMe ? "rgba(255,255,255,0.15)" : "#f0f2f5",
        borderRadius: 10,
        marginBottom: 4,
        textDecoration: "none",
        color: isMe ? "#fff" : "inherit",
        transition: "opacity 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      <span
        style={{
          color: isMe ? "rgba(255,255,255,0.85)" : "#1677ff",
          lineHeight: 1,
        }}
      >
        {getFileIcon(file.type)}
      </span>
      <div>
        <Text
          ellipsis={{ tooltip: file.name }}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: isMe ? "#fff" : "inherit",
            maxWidth: 160,
            display: "block",
          }}
        >
          {file.name}
        </Text>
        <Text
          style={{
            fontSize: 11,
            color: isMe ? "rgba(255,255,255,0.6)" : "#aaa",
          }}
        >
          {sizeMB} MB
        </Text>
      </div>
    </a>
  );
}

import classNames from "classnames";
import React, { useCallback, useEffect, useRef, useState } from "react";
import IconTrash from "../../icons/IconTrash";
import IconUpload from "../../icons/IconUpload";
import styles from "./FileUpload.module.scss";

export interface FileUploadProps {
  value?: File[];
  onChange?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getHintText(accept?: string, maxSize?: number): string {
  const parts: string[] = [];

  if (accept) {
    const extensions = accept
      .split(",")
      .map((t) => t.trim())
      .map((t) => {
        if (t === "image/*") return "PNG, JPG, WEBP";
        if (t.startsWith(".")) return t.slice(1).toUpperCase();
        return t;
      });
    parts.push(extensions.join(", "));
  }

  if (maxSize) {
    parts.push(`up to ${formatBytes(maxSize)}`);
  }

  return parts.length > 0 ? parts.join(" ") : "";
}

export default function FileUpload({
  value,
  onChange,
  accept,
  multiple = true,
  maxFiles,
  maxSize,
  disabled = false,
  error = false,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [objectUrls, setObjectUrls] = useState<Map<File, string>>(new Map());

  const files = value ?? [];

  useEffect(() => {
    const newUrls = new Map<File, string>();
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        const existing = objectUrls.get(file);
        if (existing) {
          newUrls.set(file, existing);
        } else {
          newUrls.set(file, URL.createObjectURL(file));
        }
      }
    }

    // Revoke URLs for files no longer in the list
    for (const [file, url] of objectUrls) {
      if (!newUrls.has(file)) {
        URL.revokeObjectURL(url);
      }
    }

    setObjectUrls(newUrls);

    return () => {
      for (const url of newUrls.values()) {
        URL.revokeObjectURL(url);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const addFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming || disabled) return;

      let newFiles = Array.from(incoming);

      if (accept) {
        const acceptTypes = accept.split(",").map((t) => t.trim());
        newFiles = newFiles.filter((file) =>
          acceptTypes.some((type) => {
            if (type === "image/*") return file.type.startsWith("image/");
            if (type === "video/*") return file.type.startsWith("video/");
            if (type === "audio/*") return file.type.startsWith("audio/");
            if (type.startsWith("."))
              return file.name.toLowerCase().endsWith(type.toLowerCase());
            return file.type === type;
          }),
        );
      }

      if (maxSize) {
        newFiles = newFiles.filter((file) => file.size <= maxSize);
      }

      let combined = multiple ? [...files, ...newFiles] : newFiles.slice(0, 1);

      if (maxFiles) {
        combined = combined.slice(0, maxFiles);
      }

      onChange?.(combined);
    },
    [accept, disabled, files, maxFiles, maxSize, multiple, onChange],
  );

  const removeFile = useCallback(
    (index: number) => {
      if (disabled) return;
      const updated = files.filter((_, i) => i !== index);
      onChange?.(updated);
    },
    [disabled, files, onChange],
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setDragActive(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
    },
    [],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      addFiles(e.target.files);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [addFiles],
  );

  const hintText = getHintText(accept, maxSize);

  const dropzoneClass = classNames(
    styles.dropzone,
    dragActive && styles.dragActive,
    error && styles.error,
    disabled && styles.disabled,
    className,
  );

  return (
    <div>
      <div
        className={dropzoneClass}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className={styles.hiddenInput}
          tabIndex={-1}
        />
        <IconUpload color="currentColor" size={32} />
        <p className={styles.dropzoneText}>Drop files here or click to upload</p>
        {hintText && <span className={styles.dropzoneHint}>{hintText}</span>}
      </div>

      {files.length > 0 && (
        <div className={styles.previewGrid}>
          {files.map((file, index) => {
            const isImage = file.type.startsWith("image/");
            const url = objectUrls.get(file);

            return (
              <div key={`${file.name}-${file.size}-${index}`} className={styles.previewItem}>
                {isImage && url ? (
                  <img
                    src={url}
                    alt={file.name}
                    className={styles.previewImage}
                  />
                ) : (
                  <div className={styles.previewPlaceholder}>
                    <span className={styles.previewFileName}>{file.name}</span>
                    <span className={styles.previewFileSize}>
                      {formatBytes(file.size)}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  aria-label={`Remove ${file.name}`}
                >
                  <IconTrash color="#fff" size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

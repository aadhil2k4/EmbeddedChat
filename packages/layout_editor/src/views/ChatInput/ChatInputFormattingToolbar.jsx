import React, { useMemo, useState } from "react";
import { Box } from "@embeddedchat/ui-elements";
import { useChatInputFormattingToolbarStyles } from "./ChatInput.styles";
import SurfaceMenu from "../../components/SurfaceMenu/SurfaceMenu";
import SurfaceItem from "../../components/SurfaceMenu/SurfaceItem";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";

const ChatInputFormattingToolbar = ({
  optionConfig = {
    surfaceItems: ["emoji", "formatter", "audio", "video", "file"],
    formatters: ["bold", "italic", "strike", "code", "multiline"],
  },
}) => {
  const styles = useChatInputFormattingToolbarStyles();
  const [surfaceItems, setSurfaceItems] = useState(optionConfig.surfaceItems);
  const [activeSurfaceItem, setActiveSurfaceItem] = useState(null);
  const placeholderSurfaceItem = "placeholder-surface";

  const options = useMemo(() => {
    return {
      emoji: {
        label: "Emoji",
        id: "emoji",
        onClick: () => {},
        iconName: "emoji",
        visible: true,
      },
      audio: {
        label: "Audio Message",
        id: "audio",
        onClick: () => {},
        iconName: "mic",
        visible: true,
      },
      video: {
        label: "Video Message",
        id: "video",
        onClick: () => {},
        iconName: "video-recorder",
        visible: true,
      },
      file: {
        label: "Upload File",
        id: "file",
        onClick: () => {},
        iconName: "attachment",
        visible: true,
      },
      formatter: {
        label: "Formatter",
        id: "formatter",
        onClick: () => {},
        iconName: "format-text",
        visible: true,
      },
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1.5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    if (event.active.data.current?.type === "SurfaceOptions") {
      setActiveSurfaceItem({
        id: event.active.id,
        iconName: event.active.data.current.icon,
        label: event.active.data.current.label,
      });
    }
  };

  const handleDragEnd = (event) => {
    setActiveSurfaceItem(null);
    const { active, over } = event;

    if (active.id !== over.id) {
      if (
        event.active.data.current?.type === "SurfaceOptions" &&
        event.over.data.current?.type === "SurfaceOptions"
      ) {
        setSurfaceItems((items) => {
          const oldIndex = items.indexOf(active.id);
          const newIndex = items.indexOf(over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }
  };

  const surfaceOptions = useMemo(() => {
    return surfaceItems.length > 0
      ? surfaceItems
          .map((item) => {
            if (item === "formatter") {
              return options.formatter;
            }
            if (options[item] && options[item].visible) {
              return {
                id: options[item].id,
                onClick: options[item].onClick,
                label: options[item].label,
                iconName: options[item].iconName,
              };
            }
            return null;
          })
          .filter((option) => option !== null)
      : [{ id: placeholderSurfaceItem, label: "No items", iconName: "plus" }];
  }, [surfaceItems, options]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
    >
      <Box css={styles.chatFormat} className="ec-chat-input-formatting-toolbar">
        {surfaceOptions.length > 0 && (
          <SurfaceMenu options={surfaceOptions} tooltipPosition="top" />
        )}
      </Box>

      {createPortal(
        <DragOverlay zIndex={1700}>
          {activeSurfaceItem && <SurfaceItem {...activeSurfaceItem} />}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};

export default ChatInputFormattingToolbar;

import { useMemo, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { X, GripVertical, Image, Hash } from "lucide-react";

/**
 * Displays a reorderable grid of image thumbnails with rich animations.
 * Uses @hello-pangea/dnd (maintained fork of react-beautiful-dnd).
 */

const cardVariants = {
  hidden: { opacity: 0, scale: 0.6, y: 30, rotate: -5 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.06,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.5,
    y: -20,
    rotate: 10,
    transition: { duration: 0.25 },
  },
};

/* Draggable card wrapped in forwardRef so AnimatePresence popLayout can measure it */
const DraggableCard = forwardRef(
  ({ file, url, idx, snapshot, prov, onRemove, ...rest }, ref) => (
    <div ref={ref} {...rest}>
      <div
        ref={prov.innerRef}
        {...prov.draggableProps}
        {...prov.dragHandleProps}
        style={{ ...prov.draggableProps.style }}
      >
        <motion.div
          layout
          custom={idx}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          whileHover={
            !snapshot.isDragging
              ? { y: -6, scale: 1.04, boxShadow: "0 20px 40px rgba(124,58,237,0.15)" }
              : {}
          }
          className={`
            relative w-[130px] h-[130px] sm:w-[150px] sm:h-[150px] rounded-xl overflow-hidden
            bg-white border shadow-md cursor-grab active:cursor-grabbing
            transition-all duration-200
            ${snapshot.isDragging
              ? "ring-2 ring-violet-400 shadow-2xl shadow-violet-200/50 border-violet-300 z-50"
              : "border-gray-100 hover:border-violet-200"
            }
          `}
        >
          {/* Image */}
          <img
            src={url}
            alt={file.name}
            className="w-full h-full object-cover"
            draggable={false}
          />

          {/* Page number badge */}
          <motion.span
            key={idx}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"
          >
            <Hash className="w-2.5 h-2.5" />
            {idx + 1}
          </motion.span>

          {/* Grip icon */}
          <span className="absolute top-2 right-8 bg-white/80 backdrop-blur-sm text-gray-600 p-1 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-3 h-3" />
          </span>

          {/* Remove button */}
          <motion.button
            whileHover={{ scale: 1.3, rotate: 90 }}
            whileTap={{ scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(idx);
            }}
            className="absolute top-2 right-2 p-1 rounded-lg bg-red-500/90 hover:bg-red-600 text-white backdrop-blur-sm transition-colors shadow-lg"
          >
            <X className="w-3 h-3" />
          </motion.button>

          {/* File name overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-2 pb-2 pt-6">
            <p className="text-[10px] text-white truncate font-medium">
              {file.name}
            </p>
            <p className="text-[8px] text-white/60">
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </div>

          {/* Dragging overlay */}
          {snapshot.isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-violet-500/10 backdrop-blur-[1px]"
            />
          )}
        </motion.div>
      </div>
    </div>
  )
);

export default function ImagePreview({ images, onReorder, onRemove }) {
  /* Create stable object-URL map so we don't regenerate every render */
  const previews = useMemo(
    () => images.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [images]
  );

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    onReorder(result.source.index, result.destination.index);
  };

  if (images.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mt-10"
    >
      {/* Section heading */}
      <motion.div
        className="flex items-center gap-2 mb-5"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Image className="w-5 h-5 text-violet-500" />
        </motion.div>
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          {images.length} image{images.length !== 1 && "s"} — drag to reorder
        </h2>
        <motion.span
          key={images.length}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-auto text-xs bg-violet-100 text-violet-600 px-2.5 py-1 rounded-full font-bold"
        >
          {images.length} page{images.length !== 1 && "s"}
        </motion.span>
      </motion.div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="image-list" direction="horizontal">
          {(provided, droppableSnap) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex flex-wrap gap-4 p-4 rounded-2xl transition-all duration-300 ${
                droppableSnap.isDraggingOver
                  ? "bg-violet-50/50 ring-2 ring-violet-200 ring-dashed"
                  : "bg-gray-50/50"
              }`}
            >
              <AnimatePresence mode="popLayout">
                {previews.map(({ file, url }, idx) => (
                  <Draggable key={file.name + idx} draggableId={file.name + idx} index={idx}>
                    {(prov, snapshot) => (
                      <DraggableCard
                        file={file}
                        url={url}
                        idx={idx}
                        snapshot={snapshot}
                        prov={prov}
                        onRemove={onRemove}
                      />
                    )}
                  </Draggable>
                ))}
              </AnimatePresence>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </motion.div>
  );
}

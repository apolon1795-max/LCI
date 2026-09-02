import { AnimatePresence, motion } from 'motion/react';
import { Gift, Star } from 'lucide-react';

interface Props {
  earned: number;
  total?: number;
}

export const StarProgress = ({ earned, total = 5 }: Props) => {
  const giftUnlocked = earned >= total;

  return (
    <div
      className="bg-[#E8F1F8] px-4 py-2.5 shrink-0 border-b border-[#0054A6]/10 z-20"
      aria-label={`Собрано звёзд: ${earned} из ${total}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1" aria-hidden="true">
          {Array.from({ length: total }, (_, index) => {
            const isEarned = index < earned;
            return (
              <motion.span
                key={index}
                animate={isEarned ? { scale: [1, 1.3, 1], rotate: [0, -8, 0] } : { scale: 1, rotate: 0 }}
                transition={{ duration: 0.35 }}
                className="inline-flex"
              >
                <Star
                  size={18}
                  className={isEarned
                    ? 'fill-[#FFB800] text-[#FFB800] drop-shadow-sm'
                    : 'fill-white text-[#0054A6]/30'}
                />
              </motion.span>
            );
          })}
        </div>

        <div className="flex min-w-0 items-center gap-2 text-[12px] font-semibold text-[#0054A6]">
          {giftUnlocked ? <Gift size={16} className="shrink-0 text-[#E31E24]" /> : null}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={giftUnlocked ? 'unlocked' : earned}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="truncate"
            >
              {giftUnlocked ? 'Подарок открыт' : `До подарка: ${total - earned}`}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
